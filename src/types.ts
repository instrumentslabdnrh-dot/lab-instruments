export type MainTab = 'registry' | 'new_install' | 'repairs' | 'pm' | 'calibration';

export interface GlobalFilterState {
  searchQuery: string;
  department: string;
  category: string;
  fiscalYear: string;
  status: string;
}

export interface EquipmentItem {
  id: string;
  receiveDate?: string;
  condition?: string;
  category: string; // หมวดหมู่ (ค.การแพทย์, วัสดุวิทย์แลป, ครุภัณฑ์แลป, สนับสนุน, ทั่วไป)
  department: string; // งาน (เคมีคลินิก, โลหิตวิทยา, จุลทรรศนศาสตร์, จุลชีววิทยา, ธนาคารเลือด, donor, เครื่องมือแลป, สำนักงาน, คอมพิวเตอร์และไฟฟ้า)
  assetNo?: string; // หมายเลขประจำครุภัณฑ์
  name: string; // เครื่องมือ
  serialNo?: string;
  spec?: string;
  vendor?: string;
  unitPrice?: number | string;
  price?: string;
  location?: string;
  status: 'ใช้งาน' | 'ชำรุด' | 'ยกเลิก' | 'stock' | string; // สถานะ
  fiscalYear?: number;
  acquisitionMethod?: string; // สั่งซื้อ, วางเครื่อง, ซื้อน้ำยา, สนับสนุน
}

export interface NewInstallData {
  fiscalYear: number;
  totalCount: number;
  byCategory: { name: string; count: number }[];
  byAcquisition: { name: string; count: number }[];
  byDepartment: { name: string; count: number }[];
}

export interface RepairMonthlyRow {
  department: string;
  months: { [month: string]: number };
  total: number;
}

export interface RepairYearData {
  fiscalYear: number;
  totalRepairs: number;
  totalBroken: number;
  writtenOffCount: number; // แทงชำรุด
  byDepartment: RepairMonthlyRow[];
  frequentFailures: { name: string; count: number }[];
}

export interface PMYearData {
  fiscalYear: number;
  onTimePercent: number;
  completenessPercent: number;
  byDepartment: {
    department: string;
    ratePercent: number;
    completedCount?: number;
    totalCount?: number;
    note?: string;
  }[];
}

export interface CalibrationYearData {
  fiscalYear: number;
  totalPlanned: number; // 1. แผนเครื่องมือที่ต้องสอบเทียบ
  calibratedCount: number; // 2. จำนวนเครื่องมือได้สอบเทียบ
  calibratedPercent: number;
  uncalibratedCount: number; // 3. จำนวนเครื่องมือไม่ได้สอบเทียบ
  uncalibratedPercent: number;
  passedCount: number; // 4. ผ่าน
  passedPercent: number;
  failedCount: number; // 5. ไม่ผ่าน
  failedPercent: number;
}

export interface SheetConfig {
  fiscalYear: number;
  registryUrl?: string;
  newInstallUrl?: string;
  repairUrl?: string;
  pmUrl?: string;
  calibrationUrl?: string;
}

export interface SyncSettings {
  sheetConfigs: SheetConfig[];
  autoSync: boolean;
  lastSyncedAt?: string;
}
