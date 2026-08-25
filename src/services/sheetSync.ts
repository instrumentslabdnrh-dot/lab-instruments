import Papa from 'papaparse';
import { SheetConfig, SyncSettings, EquipmentItem, NewInstallData, CalibrationYearData } from '../types';
import { INITIAL_SHEET_CONFIGS, FALLBACK_REGISTRY_SUMMARY, FALLBACK_CALIBRATION_SUMMARY } from '../data/fallbackData';

const SETTINGS_KEY = 'dnrh_lab_dashboard_settings_v1';

export function getStoredSettings(): SyncSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sheetConfigs)) {
        // Sanitize registry URLs to ensure gid=0 is used instead of obsolete sheet=สรุป
        parsed.sheetConfigs = parsed.sheetConfigs.map((cfg: SheetConfig) => {
          if (cfg.registryUrl && cfg.registryUrl.includes('1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs') && cfg.registryUrl.includes('sheet=สรุป')) {
            return {
              ...cfg,
              registryUrl: 'https://docs.google.com/spreadsheets/d/1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs/gviz/tq?tqx=out:csv&gid=0',
            };
          }
          return cfg;
        });
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored settings, using default', e);
  }

  return {
    sheetConfigs: INITIAL_SHEET_CONFIGS,
    autoSync: true,
  };
}

export function saveStoredSettings(settings: SyncSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getThaiFormattedTime(date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds} น.`;
}

/**
 * Converts any standard Google Sheets sharing link into a CSV export endpoint URL with cache busting
 */
export function convertToCsvUrl(url: string, sheetName?: string): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  const timestamp = Date.now();

  // Extract Spreadsheet ID
  const matches = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!matches || !matches[1]) {
    const sep = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${sep}_t=${timestamp}`;
  }

  const spreadsheetId = matches[1];

  // If a specific sheetName is requested explicitly, prioritize it
  if (sheetName && sheetName.trim()) {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName.trim())}&_t=${timestamp}`;
  }

  // Check if sheet= is in the input url
  const sheetParamMatch = trimmed.match(/[?&]sheet=([^&#]+)/);
  if (sheetParamMatch && sheetParamMatch[1]) {
    const decodedSheet = decodeURIComponent(sheetParamMatch[1]);
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(decodedSheet)}&_t=${timestamp}`;
  }

  // Check if gid is specified anywhere in query or fragment
  const gidMatch = trimmed.match(/[?#&]gid=([0-9]+)/);
  if (gidMatch && gidMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gidMatch[1]}&_t=${timestamp}`;
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&_t=${timestamp}`;
}

export async function fetchCsvText(url: string, sheetName?: string): Promise<string | null> {
  const csvUrl = convertToCsvUrl(url, sheetName);
  if (!csvUrl) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain, */*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const text = await res.text();
    return text;
  } catch (err) {
    console.error('Failed to fetch CSV from URL:', url, sheetName, err);
    return null;
  }
}

/**
 * 1. Intelligent parser for Registry Sheet CSV (Topic 1: สรุปทะเบียนเครื่องมือห้องปฏิบัติการ)
 */
export function parseRegistryCsvText(text: string) {
  try {
    const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
    const rows = (parsed.data as string[][]) || [];
    if (rows.length === 0) return null;

    const categoryMap: { [key: string]: number } = {
      'เครื่องมือการแพทย์ (ค.การแพทย์)': 0,
      'ทั่วไป': 0,
      'วัสดุวิทย์แลป': 0,
      'ครุภัณฑ์แลป': 0,
      'สนับสนุน': 0,
    };

    const departmentMap: { [key: string]: number } = {
      'สำนักงาน': 0,
      'เครื่องมือแลป (กลาง)': 0,
      'คอมพิวเตอร์และไฟฟ้า': 0,
      'เคมีคลินิกและภูมิคุ้มกันวิทยา': 0,
      'ธนาคารเลือด': 0,
      'Donor (ผู้บริจาคโลหิต)': 0,
      'จุลชีววิทยา': 0,
      'โลหิตวิทยา': 0,
      'จุลทรรศนศาสตร์': 0,
    };

    const statusMap: { [key: string]: number } = {
      'ใช้งาน': 0,
      'ชำรุด': 0,
      'ยกเลิก': 0,
      'Stock (สำรอง)': 0,
    };

    const yearlyCountMap: { [key: string]: number } = {};
    const items: EquipmentItem[] = [];

    // Identify header column indices
    let headerRowIdx = -1;
    let dateCol = 0;
    let conditionCol = 1;
    let catCol = 2;
    let deptCol = 3;
    let assetCol = 4;
    let nameCol = 5;
    let snCol = 6;
    let specCol = 7;
    let vendorCol = 8;
    let priceCol = 9;
    let locationCol = 10;
    let statusCol = 11;

    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      row.forEach((cell, idx) => {
        const val = String(cell || '').trim();
        if (val.includes('หมวดหมู่') || val.includes('ประเภท')) catCol = idx;
        if (val.includes('งาน') || val.includes('แผนก') || val.includes('หน่วยงาน')) deptCol = idx;
        if ((val === 'เครื่องมือ' || val.includes('ชื่อเครื่องมือ') || val.includes('ชื่อเครื่อง') || val.includes('รายการ')) && !val.includes('คุณลักษณะ')) nameCol = idx;
        if (val.includes('คุณลักษณะ') || val.includes('รุ่น') || val.includes('สเปค')) specCol = idx;
        if (val.includes('Serial') || val.includes('S/N')) snCol = idx;
        if (val.includes('สถานะ') || val.includes('สภาพ') || val.includes('หมายเหตุ')) statusCol = idx;
        if (val.includes('วัน') || val.includes('ปีงบ') || val.includes('ลงรับ')) dateCol = idx;
        if (val.includes('หมายเลข') || val.includes('ครุภัณฑ์')) assetCol = idx;
        if (val.includes('ผู้จำหน่าย') || val.includes('บริษัท')) vendorCol = idx;
        if (val.includes('ราคา')) priceCol = idx;
        if (val.includes('ใช้ประจำที่') || val.includes('สถานที่')) locationCol = idx;
      });
      if (nameCol !== -1 && deptCol !== -1) {
        headerRowIdx = r;
        break;
      }
    }

    const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 1;

    for (let r = startRow; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rawName = String(row[nameCol] || row[specCol] || row[5] || '').trim();
      const rawCat = String(row[catCol] || row[2] || '').trim();
      const rawDept = String(row[deptCol] || row[3] || '').trim();
      const rawStatus = String(row[statusCol] || row[11] || '').trim();
      const rawDate = String(row[dateCol] || row[0] || '').trim();
      const rawAsset = String(row[assetCol] || row[4] || '').trim();
      const rawSn = String(row[snCol] || row[6] || '').trim();
      const rawSpec = String(row[specCol] || row[7] || '').trim();
      const rawVendor = String(row[vendorCol] || row[8] || '').trim();
      const rawPrice = String(row[priceCol] || row[9] || '').trim();
      const rawLocation = String(row[locationCol] || row[10] || '').trim();

      // Skip header repetitions or completely empty rows
      if (!rawName || rawName === 'เครื่องมือ' || rawName === 'รวม' || rawName === 'ลำดับ' || rawName === 'รายการ') continue;

      // Category matching
      let normalizedCat = 'ทั่วไป';
      if (rawCat.includes('การแพทย์') || rawCat.includes('ค.การแพทย์') || rawCat.includes('แพทย์')) {
        normalizedCat = 'เครื่องมือการแพทย์ (ค.การแพทย์)';
      } else if (rawCat.includes('วัสดุวิทย์') || rawCat.includes('วิทย์แลป') || rawCat.includes('วิทย')) {
        normalizedCat = 'วัสดุวิทย์แลป';
      } else if (rawCat.includes('ครุภัณฑ์แลป')) {
        normalizedCat = 'ครุภัณฑ์แลป';
      } else if (rawCat.includes('สนับสนุน') || rawCat.includes('สนับ')) {
        normalizedCat = 'สนับสนุน';
      } else {
        normalizedCat = 'ทั่วไป';
      }

      categoryMap[normalizedCat] = (categoryMap[normalizedCat] || 0) + 1;

      // Department matching
      let normalizedDept = 'สำนักงาน';
      const deptLower = rawDept.toLowerCase();
      if (rawDept.includes('เคมี') || rawDept.includes('ภูมิคุ้มกัน')) {
        normalizedDept = 'เคมีคลินิกและภูมิคุ้มกันวิทยา';
      } else if (rawDept.includes('โลหิต')) {
        normalizedDept = 'โลหิตวิทยา';
      } else if (rawDept.includes('จุลทรรศน์') || rawDept.includes('จุลทรรศนศาสตร์')) {
        normalizedDept = 'จุลทรรศนศาสตร์';
      } else if (rawDept.includes('จุลชีว')) {
        normalizedDept = 'จุลชีววิทยา';
      } else if (deptLower.includes('donor') || rawDept.includes('บริจาค')) {
        normalizedDept = 'Donor (ผู้บริจาคโลหิต)';
      } else if (rawDept.includes('ธนาคารเลือด') || deptLower.includes('blood')) {
        normalizedDept = 'ธนาคารเลือด';
      } else if (rawDept.includes('เครื่องมือแลป') || rawDept.includes('ว.แลป') || rawDept.includes('เครื่')) {
        normalizedDept = 'เครื่องมือแลป (กลาง)';
      } else if (rawDept.includes('คอมพิวเตอร์') || rawDept.includes('ไฟฟ้า') || rawDept.includes('IT') || rawCat.includes('คอมพิวเตอร์')) {
        normalizedDept = 'คอมพิวเตอร์และไฟฟ้า';
      } else if (rawDept.includes('สำนักงาน') || rawDept.includes('ธุรการ') || rawDept.includes('ำนักงาน')) {
        normalizedDept = 'สำนักงาน';
      }

      departmentMap[normalizedDept] = (departmentMap[normalizedDept] || 0) + 1;

      // Status matching
      let normalizedStatus = 'ใช้งาน';
      const statusLower = rawStatus.toLowerCase();
      if (rawStatus.includes('ชำรุด') || rawStatus.includes('ส่งซ่อม') || rawStatus.includes('รอซ่อม')) {
        normalizedStatus = 'ชำรุด';
      } else if (rawStatus.includes('ยกเลิก') || rawStatus.includes('จำหน่าย') || rawStatus.includes('แทงชำรุด')) {
        normalizedStatus = 'ยกเลิก';
      } else if (statusLower.includes('stock') || rawStatus.includes('สำรอง')) {
        normalizedStatus = 'Stock (สำรอง)';
      } else {
        normalizedStatus = 'ใช้งาน';
      }

      statusMap[normalizedStatus] = (statusMap[normalizedStatus] || 0) + 1;

      // Year matching
      let fiscalYear = 'ไม่ระบุปี';
      const yearMatch = (rawDate + ' ' + rawAsset).match(/25([456][0-9])/);
      if (yearMatch) {
        fiscalYear = `25${yearMatch[1]}`;
        yearlyCountMap[fiscalYear] = (yearlyCountMap[fiscalYear] || 0) + 1;
      }

      items.push({
        id: `eq-${r}`,
        name: rawName,
        category: normalizedCat,
        department: normalizedDept,
        status: normalizedStatus,
        assetNo: rawAsset,
        serialNo: rawSn,
        spec: rawSpec,
        vendor: rawVendor,
        price: rawPrice,
        location: rawLocation,
        receiveDate: rawDate,
        fiscalYear: fiscalYear !== 'ไม่ระบุปี' ? parseInt(fiscalYear, 10) : undefined,
      });
    }

    if (items.length === 0) return null;

    const totalCount = items.length;

    const byCategory = [
      { name: 'เครื่องมือการแพทย์ (ค.การแพทย์)', count: categoryMap['เครื่องมือการแพทย์ (ค.การแพทย์)'] || 0, color: '#3B82F6' },
      { name: 'ทั่วไป', count: categoryMap['ทั่วไป'] || 0, color: '#6366F1' },
      { name: 'วัสดุวิทย์แลป', count: categoryMap['วัสดุวิทย์แลป'] || 0, color: '#10B981' },
      { name: 'ครุภัณฑ์แลป', count: categoryMap['ครุภัณฑ์แลป'] || 0, color: '#F59E0B' },
      { name: 'สนับสนุน', count: categoryMap['สนับสนุน'] || 0, color: '#EC4899' },
    ];

    const byDepartment = [
      { name: 'สำนักงาน', count: departmentMap['สำนักงาน'] || 0, color: '#8B5CF6' },
      { name: 'เครื่องมือแลป (กลาง)', count: departmentMap['เครื่องมือแลป (กลาง)'] || 0, color: '#3B82F6' },
      { name: 'คอมพิวเตอร์และไฟฟ้า', count: departmentMap['คอมพิวเตอร์และไฟฟ้า'] || 0, color: '#06B6D4' },
      { name: 'เคมีคลินิกและภูมิคุ้มกันวิทยา', count: departmentMap['เคมีคลินิกและภูมิคุ้มกันวิทยา'] || 0, color: '#10B981' },
      { name: 'ธนาคารเลือด', count: departmentMap['ธนาคารเลือด'] || 0, color: '#EF4444' },
      { name: 'Donor (ผู้บริจาคโลหิต)', count: departmentMap['Donor (ผู้บริจาคโลหิต)'] || 0, color: '#F97316' },
      { name: 'จุลชีววิทยา', count: departmentMap['จุลชีววิทยา'] || 0, color: '#84CC16' },
      { name: 'โลหิตวิทยา', count: departmentMap['โลหิตวิทยา'] || 0, color: '#EAB308' },
      { name: 'จุลทรรศนศาสตร์', count: departmentMap['จุลทรรศนศาสตร์'] || 0, color: '#EC4899' },
    ];

    const byStatus = [
      { name: 'ใช้งาน', count: statusMap['ใช้งาน'] || 0, color: '#10B981' },
      { name: 'ชำรุด', count: statusMap['ชำรุด'] || 0, color: '#EF4444' },
      { name: 'ยกเลิก', count: statusMap['ยกเลิก'] || 0, color: '#6B7280' },
      { name: 'Stock (สำรอง)', count: statusMap['Stock (สำรอง)'] || 0, color: '#F59E0B' },
    ];

    const sortedYears = Object.keys(yearlyCountMap).sort();
    const yearlyTrend = sortedYears.map((yr) => ({
      fiscalYear: yr,
      count: yearlyCountMap[yr],
    }));

    return {
      totalCount,
      byCategory,
      byDepartment,
      byStatus,
      yearlyTrend: yearlyTrend.length > 0 ? yearlyTrend : FALLBACK_REGISTRY_SUMMARY.yearlyTrend,
      items,
    };
  } catch (err) {
    console.error('Error parsing registry CSV:', err);
    return null;
  }
}

/**
 * 2. Intelligent parser for New Installation CSV (Topic 2: ทะเบียนลงรับและติดตั้งเครื่องมือใหม่)
 */
export function parseNewInstallCsvText(text: string, defaultYear = 2568) {
  try {
    const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
    const rows = (parsed.data as string[][]) || [];
    if (rows.length === 0) return null;

    const catMap: { [key: string]: number } = {};
    const acqMap: { [key: string]: number } = {};
    const deptMap: { [key: string]: number } = {};
    let totalCount = 0;
    const items: any[] = [];

    // Header is row 0: [ลำดับ, วันที่, ประเภท, การได้มา, เครื่องมือ, รุ่น/SN, รายละเอียด, จำนวน, บริษัท, ผู้ตรวจสอบ, หมายเหตุ]
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 2) continue;

      const seq = String(row[0] || '').trim();
      const date = String(row[1] || '').trim();
      const rawCat = String(row[2] || '').trim();
      const rawAcq = String(row[3] || '').trim();
      const name = String(row[4] || row[1] || '').trim();
      const model = String(row[5] || '').trim();
      const desc = String(row[6] || '').trim();
      const qtyStr = String(row[7] || '1').trim();
      const qty = parseInt(qtyStr, 10) || 1;
      const vendor = String(row[8] || '').trim();
      const inspector = String(row[9] || '').trim();
      const note = String(row[10] || '').trim();

      // Skip non-data rows or signature footers
      if (!name || name === 'เครื่องมือ' || name === 'รายการ' || name === 'รวม' || name === 'ลำดับ') continue;
      if (seq.includes('ประกาศ') || seq.includes('ผู้รับผิดชอบ') || seq.includes('ผู้อนุมัติ') || date.includes('บังคับใช้')) continue;

      totalCount += qty;

      // Category
      let normCat = 'เครื่องมือการแพทย์';
      if (rawCat.includes('วัสดุวิทย์') || rawCat.includes('วิทย์แลป')) normCat = 'วัสดุวิทย์แลป';
      else if (rawCat.includes('คอมพิวเตอร์') || rawCat.includes('ไฟฟ้า') || rawCat.includes('IT')) normCat = 'คอมพิวเตอร์และไฟฟ้า';
      else if (rawCat.includes('สำนักงาน') || rawCat.includes('ธุรการ')) normCat = 'สำนักงาน';
      else if (rawCat.includes('สนับสนุน')) normCat = 'สนับสนุน';
      else if (rawCat.includes('ทั่วไป')) normCat = 'ทั่วไป';
      else if (rawCat.includes('ค.การแพทย์') || rawCat.includes('การแพทย์')) normCat = 'เครื่องมือการแพทย์';
      catMap[normCat] = (catMap[normCat] || 0) + qty;

      // Acquisition
      let normAcq = 'สั่งซื้อ';
      if (rawAcq.includes('วางเครื่อง')) normAcq = 'วางเครื่อง';
      else if (rawAcq.includes('ซื้อน้ำยา') || rawAcq.includes('น้ำยา')) normAcq = 'ซื้อน้ำยา';
      else if (rawAcq.includes('สนับสนุน') || rawAcq.includes('บริจาค') || rawAcq.includes('แถม')) normAcq = 'สนับสนุน';
      else if (rawAcq.includes('สั่งซื้อ') || rawAcq.includes('จัดซื้อ') || rawAcq.includes('งบประมาณ')) normAcq = 'สั่งซื้อ';
      acqMap[normAcq] = (acqMap[normAcq] || 0) + qty;

      // Department
      let normDept = 'ห้องปฏิบัติการกลาง';
      if (name.includes('เคมี') || desc.includes('เคมี') || note.includes('เคมี')) normDept = 'เคมีคลินิก';
      else if (name.includes('โลหิต') || desc.includes('โลหิต') || name.includes('CBC') || name.includes('Hb') || name.includes('Haematocrit')) normDept = 'โลหิตวิทยา';
      else if (name.includes('เลือด') || name.includes('Blood') || desc.includes('เลือด') || name.includes('gel card')) normDept = 'ธนาคารเลือด/Donor';
      else if (name.includes('เชื้อ') || name.includes('แบคทีเรีย') || desc.includes('LIMS') || name.includes('Micro')) normDept = 'จุลชีววิทยา';
      else if (normCat === 'สำนักงาน') normDept = 'สำนักงาน';
      else if (normCat === 'คอมพิวเตอร์และไฟฟ้า') normDept = 'คอมพิวเตอร์และไฟฟ้า';
      deptMap[normDept] = (deptMap[normDept] || 0) + qty;

      items.push({
        seq: seq || String(items.length + 1),
        date,
        category: normCat,
        acquisition: normAcq,
        department: normDept,
        name,
        model,
        desc,
        quantity: qty,
        vendor,
        inspector,
        note,
      });
    }

    if (totalCount === 0 && items.length === 0) return null;

    return {
      fiscalYear: defaultYear,
      totalCount,
      byCategory: Object.keys(catMap).map((k) => ({ name: k, count: catMap[k] })),
      byAcquisition: Object.keys(acqMap).map((k) => ({ name: k, count: acqMap[k] })),
      byDepartment: Object.keys(deptMap).map((k) => ({ name: k, count: deptMap[k] })),
      items,
    };
  } catch (err) {
    console.error('Error parsing new installation CSV:', err);
    return null;
  }
}

/**
 * 3. Intelligent parser for Repair Sheet CSV (Topic 3: เครื่องมือส่งซ่อม/ชำรุด)
 */
export function parseRepairCsvText(text: string) {
  try {
    const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
    const rows = (parsed.data as string[][]) || [];
    if (rows.length === 0) return null;

    const months = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
    const monthlyTotals = months.map((m) => ({ month: m, count: 0 }));
    const depts: any[] = [];
    let totalRepairs = 0;
    let writtenOffCount = 0;

    // Find header row containing month names
    const monthColIndices: { [key: string]: number } = {};
    for (let r = 0; r < Math.min(rows.length, 6); r++) {
      const row = rows[r];
      row.forEach((cell, idx) => {
        if (typeof cell === 'string') {
          months.forEach((m) => {
            if (cell.includes(m)) monthColIndices[m] = idx;
          });
        }
      });
    }

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const firstCell = String(row[0] || '').trim();
      const nameCell = String(row[1] || '').trim();

      if (firstCell.includes('แทงชำรุด') || nameCell.includes('แทงชำรุด')) {
        for (let c = 2; c < row.length; c++) {
          const val = parseInt(String(row[c]), 10);
          if (!isNaN(val) && val > 0) writtenOffCount = val;
        }
        continue;
      }

      if (nameCell && !['เครื่องมือ', 'รวม', 'ลำดับ', 'รายการ', 'กลุ่มงาน'].includes(nameCell) && !nameCell.includes('สรุป')) {
        let deptTotal = 0;
        const monthObj: { [key: string]: number } = {};

        months.forEach((m, idx) => {
          const colIdx = monthColIndices[m];
          let val = 0;
          if (colIdx !== undefined && row[colIdx]) {
            val = parseInt(String(row[colIdx]), 10) || 0;
          } else {
            // fallback index (usually cols 2 to 13)
            const fallbackIdx = 2 + idx;
            if (row[fallbackIdx]) {
              val = parseInt(String(row[fallbackIdx]), 10) || 0;
            }
          }
          monthlyTotals[idx].count += val;
          deptTotal += val;
          monthObj[m] = val;
        });

        const lastVal = parseInt(String(row[14] || row[13] || row[row.length - 1]), 10);
        const total = !isNaN(lastVal) && lastVal > 0 ? lastVal : deptTotal;
        totalRepairs += total;

        depts.push({
          department: nameCell,
          months: monthObj,
          total: total,
        });
      }
    }

    if (depts.length === 0) return null;

    const frequentFailures = depts
      .slice(0, 7)
      .sort((a, b) => b.total - a.total)
      .map((d) => ({
        name: d.department,
        count: d.total,
      }));

    return {
      byDepartment: depts,
      monthlyTrend: monthlyTotals,
      totalRepairs: totalRepairs || 0,
      totalBroken: totalRepairs || 0,
      writtenOffCount: writtenOffCount || 0,
      frequentFailures: frequentFailures.length > 0 ? frequentFailures : undefined,
    };
  } catch (err) {
    console.error('Error parsing repair CSV:', err);
    return null;
  }
}

/**
 * 4. Intelligent parser for PM Sheet CSV (Topic 4: การเข้ามาบำรุงรักษาเชิงป้องกันของบริษัท)
 */
export function parsePmCsvText(text: string) {
  try {
    const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
    const rows = (parsed.data as string[][]) || [];
    if (rows.length === 0) return null;

    const depts: { department: string; ratePercent: number; note: string }[] = [];
    let totalPct = 0;
    let count = 0;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const nameCell = String(row[1] || '').trim();
      const pctCell = String(row[2] || '').trim();
      const noteCell = String(row[3] || '').trim();

      if (
        nameCell &&
        !['เครื่องมือ', 'รวม', 'ลำดับ', 'รายการ'].includes(nameCell) &&
        !nameCell.includes('สรุปการเข้ามา PM')
      ) {
        if (nameCell.includes('รวม')) continue;

        const numMatch = pctCell.match(/([0-9.]+)/);
        const pctVal = numMatch ? parseFloat(numMatch[1]) : 0;

        depts.push({
          department: nameCell,
          ratePercent: pctVal,
          note: noteCell || (pctVal > 0 ? 'ตรงเวลาและครบถ้วนตามรอบสัญญา' : 'อยู่ระหว่างรอบสัญญา PM'),
        });

        totalPct += pctVal;
        count++;
      }
    }

    if (depts.length === 0) return null;

    const avgPct = count > 0 ? Math.round(totalPct / count) : 0;

    return {
      byDepartment: depts,
      onTimePercent: avgPct,
      completenessPercent: avgPct,
      completePercent: avgPct,
    };
  } catch (err) {
    console.error('Error parsing PM CSV:', err);
    return null;
  }
}

/**
 * 5. Intelligent parser for Calibration Summary CSV (Topic 5: ผลการสอบเทียบเครื่องมือ)
 */
export function parseCalibrationCsvText(text: string): CalibrationYearData[] | null {
  try {
    const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
    const rows = (parsed.data as string[][]) || [];
    if (rows.length === 0) return null;

    const years = [2565, 2566, 2567, 2568, 2569];
    const yearColIndices: { [year: number]: number } = {};

    // Find row containing fiscal years (e.g. 2565, 2566, 2567, 2568, 2569)
    for (let r = 0; r < Math.min(rows.length, 6); r++) {
      const row = rows[r];
      row.forEach((cell, idx) => {
        const str = String(cell || '').trim();
        years.forEach((yr) => {
          if (str === String(yr) || str.includes(String(yr))) {
            yearColIndices[yr] = idx;
          }
        });
      });
    }

    // Default column fallback if not found in header (columns are B, D, F, H, J -> 1, 3, 5, 7, 9)
    years.forEach((yr, i) => {
      if (yearColIndices[yr] === undefined) {
        yearColIndices[yr] = 1 + i * 2;
      }
    });

    let plannedRow: string[] | null = null;
    let calibratedRow: string[] | null = null;
    let uncalibratedRow: string[] | null = null;
    let passedRow: string[] | null = null;
    let failedRow: string[] | null = null;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const title = String(row[0] || row[1] || '').trim();

      if (title.includes('แผน') || title.includes('ต้องสอบเทียบ')) {
        if (!plannedRow) plannedRow = row;
      } else if (title.includes('ไม่ได้สอบเทียบ') || title.includes('ไม่ได้รับการสอบเทียบ')) {
        if (!uncalibratedRow) uncalibratedRow = row;
      } else if (title.includes('ได้สอบเทียบ') || title.includes('ได้รับการสอบเทียบ')) {
        if (!calibratedRow) calibratedRow = row;
      } else if (title.includes('ไม่ผ่าน')) {
        if (!failedRow) failedRow = row;
      } else if (title.includes('ผ่าน')) {
        if (!passedRow) passedRow = row;
      }
    }

    const result: CalibrationYearData[] = years.map((yr) => {
      const colIdx = yearColIndices[yr];
      const planned = parseInt(String(plannedRow ? plannedRow[colIdx] : 0), 10) || 0;
      const calibrated = parseInt(String(calibratedRow ? calibratedRow[colIdx] : 0), 10) || 0;
      const uncalibrated = parseInt(String(uncalibratedRow ? uncalibratedRow[colIdx] : (planned > calibrated ? planned - calibrated : 0)), 10) || 0;
      const passed = parseInt(String(passedRow ? passedRow[colIdx] : 0), 10) || 0;
      const failed = parseInt(String(failedRow ? failedRow[colIdx] : 0), 10) || 0;

      const calPct = planned > 0 ? Math.round((calibrated / planned) * 100) : 0;
      const uncalPct = planned > 0 ? Math.round((uncalibrated / planned) * 100) : (planned > 0 ? 100 - calPct : 0);
      const passPct = calibrated > 0 ? Math.round((passed / calibrated) * 100) : 0;
      const failPct = calibrated > 0 ? Math.round((failed / calibrated) * 100) : 0;

      return {
        fiscalYear: yr,
        totalPlanned: planned,
        calibratedCount: calibrated,
        calibratedPercent: calPct,
        uncalibratedCount: uncalibrated,
        uncalibratedPercent: uncalPct,
        passedCount: passed,
        passedPercent: passPct,
        failedCount: failed,
        failedPercent: failPct,
      };
    });

    // Check if we extracted valid non-zero data
    const hasData = result.some((r) => r.totalPlanned > 0);
    return hasData ? result : null;
  } catch (err) {
    console.error('Error parsing calibration CSV:', err);
    return null;
  }
}

