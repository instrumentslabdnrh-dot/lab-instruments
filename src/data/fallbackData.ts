import {
  EquipmentItem,
  NewInstallData,
  RepairYearData,
  PMYearData,
  CalibrationYearData,
  SheetConfig,
} from '../types';

export const RAW_SHEET_URLS = {
  registry: 'https://docs.google.com/spreadsheets/d/1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs/edit?gid=0#gid=0',
  newInstall: 'https://docs.google.com/spreadsheets/d/1WC1dDGeoUjdRypt3W1CnybTe2WlQBmaVRfcd8EwzA88/edit?usp=sharing',
  repairs: 'https://docs.google.com/spreadsheets/d/1dP4L2b3FTh0IU53TpsUAjC5iV2xJVvOrbO2t6Cjg_pk/edit?usp=sharing',
  repairs2568: 'https://docs.google.com/spreadsheets/d/1dP4L2b3FTh0IU53TpsUAjC5iV2xJVvOrbO2t6Cjg_pk/edit?gid=510670902#gid=510670902',
  repairs2569: 'https://docs.google.com/spreadsheets/d/1dP4L2b3FTh0IU53TpsUAjC5iV2xJVvOrbO2t6Cjg_pk/edit?gid=1704706845#gid=1704706845',
  pm: 'https://docs.google.com/spreadsheets/d/1uB3ashWurIAImySM0KLDUdRYT9kf786hwL9ATLex4hw/edit?usp=sharing',
  pm2568: 'https://docs.google.com/spreadsheets/d/1uB3ashWurIAImySM0KLDUdRYT9kf786hwL9ATLex4hw/edit?gid=0#gid=0',
  pm2569: 'https://docs.google.com/spreadsheets/d/1uB3ashWurIAImySM0KLDUdRYT9kf786hwL9ATLex4hw/edit?gid=417366916#gid=417366916',
  calibration: 'https://docs.google.com/spreadsheets/d/1Wk-sARHZ5KY0iSJ9ykJsf5tsaF-D4l0Oedbh9RnnvRg/edit?gid=448972226#gid=448972226',
};

export const INITIAL_SHEET_CONFIGS: SheetConfig[] = [
  {
    fiscalYear: 2565,
    registryUrl: 'https://docs.google.com/spreadsheets/d/1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs/gviz/tq?tqx=out:csv&gid=0',
    newInstallUrl: 'https://docs.google.com/spreadsheets/d/1WC1dDGeoUjdRypt3W1CnybTe2WlQBmaVRfcd8EwzA88/gviz/tq?tqx=out:csv&sheet=ปีงบ2565',
    repairUrl: '',
    pmUrl: '',
    calibrationUrl: 'https://docs.google.com/spreadsheets/d/1Wk-sARHZ5KY0iSJ9ykJsf5tsaF-D4l0Oedbh9RnnvRg/gviz/tq?tqx=out:csv&sheet=สรุป',
  },
  {
    fiscalYear: 2566,
    registryUrl: 'https://docs.google.com/spreadsheets/d/1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs/gviz/tq?tqx=out:csv&gid=0',
    newInstallUrl: 'https://docs.google.com/spreadsheets/d/1WC1dDGeoUjdRypt3W1CnybTe2WlQBmaVRfcd8EwzA88/gviz/tq?tqx=out:csv&sheet=ปีงบ2566',
    repairUrl: '',
    pmUrl: '',
    calibrationUrl: 'https://docs.google.com/spreadsheets/d/1Wk-sARHZ5KY0iSJ9ykJsf5tsaF-D4l0Oedbh9RnnvRg/gviz/tq?tqx=out:csv&sheet=สรุป',
  },
  {
    fiscalYear: 2567,
    registryUrl: 'https://docs.google.com/spreadsheets/d/1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs/gviz/tq?tqx=out:csv&gid=0',
    newInstallUrl: 'https://docs.google.com/spreadsheets/d/1WC1dDGeoUjdRypt3W1CnybTe2WlQBmaVRfcd8EwzA88/gviz/tq?tqx=out:csv&sheet=ปีงบ2567',
    repairUrl: '',
    pmUrl: '',
    calibrationUrl: 'https://docs.google.com/spreadsheets/d/1Wk-sARHZ5KY0iSJ9ykJsf5tsaF-D4l0Oedbh9RnnvRg/gviz/tq?tqx=out:csv&sheet=สรุป',
  },
  {
    fiscalYear: 2568,
    registryUrl: 'https://docs.google.com/spreadsheets/d/1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs/gviz/tq?tqx=out:csv&gid=0',
    newInstallUrl: 'https://docs.google.com/spreadsheets/d/1WC1dDGeoUjdRypt3W1CnybTe2WlQBmaVRfcd8EwzA88/gviz/tq?tqx=out:csv&sheet=ปีงบ2568',
    repairUrl: 'https://docs.google.com/spreadsheets/d/1dP4L2b3FTh0IU53TpsUAjC5iV2xJVvOrbO2t6Cjg_pk/gviz/tq?tqx=out:csv&sheet=2568',
    pmUrl: 'https://docs.google.com/spreadsheets/d/1uB3ashWurIAImySM0KLDUdRYT9kf786hwL9ATLex4hw/gviz/tq?tqx=out:csv&sheet=2568',
    calibrationUrl: 'https://docs.google.com/spreadsheets/d/1Wk-sARHZ5KY0iSJ9ykJsf5tsaF-D4l0Oedbh9RnnvRg/gviz/tq?tqx=out:csv&sheet=สรุป',
  },
  {
    fiscalYear: 2569,
    registryUrl: 'https://docs.google.com/spreadsheets/d/1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs/gviz/tq?tqx=out:csv&gid=0',
    newInstallUrl: 'https://docs.google.com/spreadsheets/d/1WC1dDGeoUjdRypt3W1CnybTe2WlQBmaVRfcd8EwzA88/gviz/tq?tqx=out:csv&sheet=ปีงบ2569',
    repairUrl: 'https://docs.google.com/spreadsheets/d/1dP4L2b3FTh0IU53TpsUAjC5iV2xJVvOrbO2t6Cjg_pk/gviz/tq?tqx=out:csv&sheet=2569',
    pmUrl: 'https://docs.google.com/spreadsheets/d/1uB3ashWurIAImySM0KLDUdRYT9kf786hwL9ATLex4hw/gviz/tq?tqx=out:csv&sheet=2569',
    calibrationUrl: 'https://docs.google.com/spreadsheets/d/1Wk-sARHZ5KY0iSJ9ykJsf5tsaF-D4l0Oedbh9RnnvRg/gviz/tq?tqx=out:csv&sheet=สรุป',
  },
];

// Fallback Registry Data Summary (498 Total from Google Sheet)
export const FALLBACK_REGISTRY_SUMMARY = {
  totalCount: 498,
  byCategory: [
    { name: 'เครื่องมือการแพทย์ (ค.การแพทย์)', count: 151, color: '#3B82F6' },
    { name: 'ทั่วไป', count: 247, color: '#6366F1' },
    { name: 'วัสดุวิทย์แลป', count: 79, color: '#10B981' },
    { name: 'ครุภัณฑ์แลป', count: 15, color: '#F59E0B' },
    { name: 'สนับสนุน', count: 6, color: '#EC4899' },
  ],
  byDepartment: [
    { name: 'สำนักงาน', count: 170, color: '#8B5CF6' },
    { name: 'เครื่องมือแลป (กลาง)', count: 100, color: '#3B82F6' },
    { name: 'คอมพิวเตอร์และไฟฟ้า', count: 78, color: '#06B6D4' },
    { name: 'เคมีคลินิกและภูมิคุ้มกันวิทยา', count: 38, color: '#10B981' },
    { name: 'ธนาคารเลือด', count: 33, color: '#EF4444' },
    { name: 'Donor (ผู้บริจาคโลหิต)', count: 30, color: '#F97316' },
    { name: 'จุลชีววิทยา', count: 19, color: '#84CC16' },
    { name: 'โลหิตวิทยา', count: 16, color: '#EAB308' },
    { name: 'จุลทรรศนศาสตร์', count: 14, color: '#EC4899' },
  ],
  byStatus: [
    { name: 'ใช้งาน', count: 408, color: '#10B981' },
    { name: 'ชำรุด', count: 44, color: '#EF4444' },
    { name: 'ยกเลิก', count: 27, color: '#6B7280' },
    { name: 'Stock (สำรอง)', count: 19, color: '#F59E0B' },
  ],
  yearlyTrend: [
    { fiscalYear: '2551', count: 3 },
    { fiscalYear: '2552', count: 7 },
    { fiscalYear: '2553', count: 4 },
    { fiscalYear: '2554', count: 7 },
    { fiscalYear: '2555', count: 12 },
    { fiscalYear: '2556', count: 4 },
    { fiscalYear: '2557', count: 31 },
    { fiscalYear: '2558', count: 14 },
    { fiscalYear: '2559', count: 36 },
    { fiscalYear: '2560', count: 17 },
    { fiscalYear: '2561', count: 24 },
    { fiscalYear: '2562', count: 22 },
    { fiscalYear: '2563', count: 13 },
    { fiscalYear: '2564', count: 42 },
    { fiscalYear: '2565', count: 5 },
    { fiscalYear: '2566', count: 12 },
    { fiscalYear: '2567', count: 22 },
    { fiscalYear: '2568', count: 54 },
    { fiscalYear: '2569', count: 16 },
  ],
};

// Fallback New Installation Data
export const FALLBACK_NEW_INSTALLATIONS: { [key: string]: NewInstallData } = {
  all: {
    fiscalYear: 0,
    totalCount: 95,
    byCategory: [
      { name: 'เครื่องมือการแพทย์', count: 48 },
      { name: 'วัสดุวิทย์แลป', count: 28 },
      { name: 'สนับสนุน', count: 12 },
      { name: 'ทั่วไป', count: 7 },
    ],
    byAcquisition: [
      { name: 'สั่งซื้อ', count: 42 },
      { name: 'วางเครื่อง', count: 26 },
      { name: 'ซื้อน้ำยา', count: 18 },
      { name: 'สนับสนุน', count: 9 },
    ],
    byDepartment: [
      { name: 'เคมีคลินิกและภูมิคุ้มกันวิทยา', count: 22 },
      { name: 'โลหิตวิทยา', count: 18 },
      { name: 'จุลชีววิทยา', count: 16 },
      { name: 'ธนาคารเลือด/Donor', count: 19 },
      { name: 'เครื่องมือแลป', count: 20 },
    ],
  },
  2565: {
    fiscalYear: 2565,
    totalCount: 3,
    byCategory: [{ name: 'เครื่องมือการแพทย์', count: 3 }],
    byAcquisition: [{ name: 'สั่งซื้อ', count: 2 }, { name: 'วางเครื่อง', count: 1 }],
    byDepartment: [{ name: 'ธนาคารเลือด', count: 2 }, { name: 'เคมีคลินิก', count: 1 }],
  },
  2566: {
    fiscalYear: 2566,
    totalCount: 11,
    byCategory: [{ name: 'เครื่องมือการแพทย์', count: 8 }, { name: 'วัสดุวิทย์แลป', count: 3 }],
    byAcquisition: [{ name: 'สั่งซื้อ', count: 7 }, { name: 'วางเครื่อง', count: 4 }],
    byDepartment: [{ name: 'จุลชีววิทยา', count: 5 }, { name: 'เคมีคลินิก', count: 4 }, { name: 'โลหิตวิทยา', count: 2 }],
  },
  2567: {
    fiscalYear: 2567,
    totalCount: 12,
    byCategory: [{ name: 'เครื่องมือการแพทย์', count: 7 }, { name: 'วัสดุวิทย์แลป', count: 5 }],
    byAcquisition: [{ name: 'สั่งซื้อ', count: 6 }, { name: 'ซื้อน้ำยา', count: 4 }, { name: 'วางเครื่อง', count: 2 }],
    byDepartment: [{ name: 'จุลทรรศนศาสตร์', count: 4 }, { name: 'โลหิตวิทยา', count: 3 }, { name: 'เคมีคลินิก', count: 5 }],
  },
  2568: {
    fiscalYear: 2568,
    totalCount: 48,
    byCategory: [{ name: 'เครื่องมือการแพทย์', count: 22 }, { name: 'วัสดุวิทย์แลป', count: 16 }, { name: 'สนับสนุน', count: 10 }],
    byAcquisition: [{ name: 'สั่งซื้อ', count: 19 }, { name: 'วางเครื่อง', count: 12 }, { name: 'ซื้อน้ำยา', count: 10 }, { name: 'สนับสนุน', count: 7 }],
    byDepartment: [{ name: 'เคมีคลินิก', count: 12 }, { name: 'ธนาคารเลือด/Donor', count: 10 }, { name: 'เครื่องมือแลป', count: 14 }, { name: 'จุลชีววิทยา', count: 12 }],
  },
  2569: {
    fiscalYear: 2569,
    totalCount: 21,
    byCategory: [{ name: 'เครื่องมือการแพทย์', count: 10 }, { name: 'วัสดุวิทย์แลป', count: 8 }, { name: 'ทั่วไป', count: 3 }],
    byAcquisition: [{ name: 'สั่งซื้อ', count: 8 }, { name: 'วางเครื่อง', count: 7 }, { name: 'ซื้อน้ำยา', count: 4 }, { name: 'สนับสนุน', count: 2 }],
    byDepartment: [{ name: 'ธนาคารเลือด', count: 8 }, { name: 'โลหิตวิทยา', count: 6 }, { name: 'สำนักงาน', count: 7 }],
  },
};

// Yearly trend data for new installations
export const NEW_INSTALL_YEARLY_TREND = [
  { fiscalYear: '2565', count: 3 },
  { fiscalYear: '2566', count: 11 },
  { fiscalYear: '2567', count: 12 },
  { fiscalYear: '2568', count: 48 },
  { fiscalYear: '2569', count: 21 },
];

// Fallback Repair Data (2568 & 2569)
export const FALLBACK_REPAIR_DATA_2568: RepairYearData = {
  fiscalYear: 2568,
  totalRepairs: 51,
  totalBroken: 51,
  writtenOffCount: 8,
  byDepartment: [
    {
      department: 'เครื่องตรวจวิเคราะห์ทางเคมีคลินิก-ภูมิคุ้มกันวิทยา',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 2, 'ม.ค.': 2, 'ก.พ.': 0, 'มี.ค.': 1, 'เม.ย.': 1, 'พ.ค.': 2, 'มิ.ย.': 1, 'ก.ค.': 3, 'ส.ค.': 1, 'ก.ย.': 4 },
      total: 17,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางโลหิตวิทยา',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 2, 'ม.ค.': 5, 'ก.พ.': 1, 'มี.ค.': 0, 'เม.ย.': 1, 'พ.ค.': 0, 'มิ.ย.': 3, 'ก.ค.': 1, 'ส.ค.': 4, 'ก.ย.': 5 },
      total: 22,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางจุลทรรศนศาสตร์',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 1, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 1,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางจุลชีววิทยา',
      months: { 'ต.ค.': 0, 'พ.ย.': 1, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 1,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางธนาคารเลือด',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 1, 'พ.ค.': 0, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 1,
    },
    {
      department: 'เครื่องมือทางห้องแลป',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 1, 'ก.ค.': 0, 'ส.ค.': 1, 'ก.ย.': 0 },
      total: 2,
    },
    {
      department: 'ครุภัณฑ์สำนักงานคอมพิวเตอร์และไฟฟ้า',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 1, 'มิ.ย.': 6, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 7,
    },
  ],
  frequentFailures: [
    { name: 'เครื่องตรวจวิเคราะห์ CBC/Coag', count: 22 },
    { name: 'เครื่องตรวจวิเคราะห์ Chem/Immuno', count: 17 },
    { name: 'คอมพิวเตอร์และพริ้นเตอร์ LIS', count: 7 },
    { name: 'Autopipette / Centrifuge', count: 2 },
    { name: 'ตู้แช่ / ตู้เย็นควบคุมอุณหภูมิ', count: 3 },
  ],
};

export const FALLBACK_REPAIR_DATA_2569: RepairYearData = {
  fiscalYear: 2569,
  totalRepairs: 66,
  totalBroken: 66,
  writtenOffCount: 9,
  byDepartment: [
    {
      department: 'เครื่องตรวจวิเคราะห์ทางเคมีคลินิก-ภูมิคุ้มกันวิทยา',
      months: { 'ต.ค.': 3, 'พ.ย.': 2, 'ธ.ค.': 2, 'ม.ค.': 2, 'ก.พ.': 0, 'มี.ค.': 3, 'เม.ย.': 1, 'พ.ค.': 2, 'มิ.ย.': 2, 'ก.ค.': 3, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 20,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางโลหิตวิทยา',
      months: { 'ต.ค.': 5, 'พ.ย.': 7, 'ธ.ค.': 3, 'ม.ค.': 3, 'ก.พ.': 3, 'มี.ค.': 2, 'เม.ย.': 0, 'พ.ค.': 2, 'มิ.ย.': 2, 'ก.ค.': 2, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 29,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางจุลทรรศนศาสตร์',
      months: { 'ต.ค.': 1, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 1,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางจุลชีววิทยา',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 1, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 1,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางธนาคารเลือด',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 1, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 1,
    },
    {
      department: 'เครื่องมือทางห้องแลป',
      months: { 'ต.ค.': 8, 'พ.ย.': 2, 'ธ.ค.': 1, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 2, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 13,
    },
    {
      department: 'ครุภัณฑ์สำนักงานคอมพิวเตอร์และไฟฟ้า',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 1, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 1,
    },
  ],
  frequentFailures: [
    { name: 'เครื่องตรวจวิเคราะห์ CBC/Coag', count: 29 },
    { name: 'เครื่องตรวจวิเคราะห์ Chem/Immuno', count: 20 },
    { name: 'เครื่องมือทางห้องแลป', count: 13 },
    { name: 'คอมพิวเตอร์และพริ้นเตอร์ LIS', count: 1 },
    { name: 'เครื่องตรวจวิเคราะห์อื่นๆ', count: 3 },
  ],
};

export const FALLBACK_REPAIR_DATA_ALL: RepairYearData = {
  fiscalYear: 0,
  totalRepairs: 117,
  totalBroken: 117,
  writtenOffCount: 17,
  byDepartment: [
    {
      department: 'เครื่องตรวจวิเคราะห์ทางเคมีคลินิก-ภูมิคุ้มกันวิทยา',
      months: { 'ต.ค.': 3, 'พ.ย.': 2, 'ธ.ค.': 4, 'ม.ค.': 4, 'ก.พ.': 0, 'มี.ค.': 4, 'เม.ย.': 2, 'พ.ค.': 4, 'มิ.ย.': 3, 'ก.ค.': 6, 'ส.ค.': 1, 'ก.ย.': 4 },
      total: 37,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางโลหิตวิทยา',
      months: { 'ต.ค.': 5, 'พ.ย.': 7, 'ธ.ค.': 5, 'ม.ค.': 8, 'ก.พ.': 4, 'มี.ค.': 2, 'เม.ย.': 1, 'พ.ค.': 2, 'มิ.ย.': 5, 'ก.ค.': 3, 'ส.ค.': 4, 'ก.ย.': 5 },
      total: 51,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางจุลทรรศนศาสตร์',
      months: { 'ต.ค.': 1, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 1, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 2,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางจุลชีววิทยา',
      months: { 'ต.ค.': 0, 'พ.ย.': 1, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 1, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 2,
    },
    {
      department: 'เครื่องตรวจวิเคราะห์ทางธนาคารเลือด',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 1, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 1, 'พ.ค.': 0, 'มิ.ย.': 0, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 2,
    },
    {
      department: 'เครื่องมือทางห้องแลป',
      months: { 'ต.ค.': 8, 'พ.ย.': 2, 'ธ.ค.': 1, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 0, 'เม.ย.': 0, 'พ.ค.': 0, 'มิ.ย.': 3, 'ก.ค.': 0, 'ส.ค.': 1, 'ก.ย.': 0 },
      total: 15,
    },
    {
      department: 'ครุภัณฑ์สำนักงานคอมพิวเตอร์และไฟฟ้า',
      months: { 'ต.ค.': 0, 'พ.ย.': 0, 'ธ.ค.': 0, 'ม.ค.': 0, 'ก.พ.': 0, 'มี.ค.': 1, 'เม.ย.': 0, 'พ.ค.': 1, 'มิ.ย.': 6, 'ก.ค.': 0, 'ส.ค.': 0, 'ก.ย.': 0 },
      total: 8,
    },
  ],
  frequentFailures: [
    { name: 'เครื่องตรวจวิเคราะห์ CBC/Coag', count: 51 },
    { name: 'เครื่องตรวจวิเคราะห์ Chem/Immuno', count: 37 },
    { name: 'เครื่องมือทางห้องแลป', count: 15 },
    { name: 'คอมพิวเตอร์และพริ้นเตอร์ LIS', count: 8 },
    { name: 'อื่นๆ', count: 6 },
  ],
};

export const FALLBACK_REPAIR_DATA_MAP: { [key: string]: RepairYearData } = {
  '2568': FALLBACK_REPAIR_DATA_2568,
  '2569': FALLBACK_REPAIR_DATA_2569,
  'all': FALLBACK_REPAIR_DATA_ALL,
};

export const REPAIR_MONTHLY_TREND_2568 = [
  { month: 'ต.ค.', count: 0 },
  { month: 'พ.ย.', count: 1 },
  { month: 'ธ.ค.', count: 4 },
  { month: 'ม.ค.', count: 7 },
  { month: 'ก.พ.', count: 1 },
  { month: 'มี.ค.', count: 1 },
  { month: 'เม.ย.', count: 3 },
  { month: 'พ.ค.', count: 5 },
  { month: 'มิ.ย.', count: 11 },
  { month: 'ก.ค.', count: 4 },
  { month: 'ส.ค.', count: 6 },
  { month: 'ก.ย.', count: 9 },
];

export const REPAIR_MONTHLY_TREND_2569 = [
  { month: 'ต.ค.', count: 17 },
  { month: 'พ.ย.', count: 11 },
  { month: 'ธ.ค.', count: 6 },
  { month: 'ม.ค.', count: 6 },
  { month: 'ก.พ.', count: 3 },
  { month: 'มี.ค.', count: 7 },
  { month: 'เม.ย.', count: 1 },
  { month: 'พ.ค.', count: 4 },
  { month: 'มิ.ย.', count: 6 },
  { month: 'ก.ค.', count: 5 },
  { month: 'ส.ค.', count: 0 },
  { month: 'ก.ย.', count: 0 },
];

export const REPAIR_MONTHLY_TREND_ALL = [
  { month: 'ต.ค.', count: 17 },
  { month: 'พ.ย.', count: 12 },
  { month: 'ธ.ค.', count: 10 },
  { month: 'ม.ค.', count: 13 },
  { month: 'ก.พ.', count: 4 },
  { month: 'มี.ค.', count: 8 },
  { month: 'เม.ย.', count: 4 },
  { month: 'พ.ค.', count: 9 },
  { month: 'มิ.ย.', count: 17 },
  { month: 'ก.ค.', count: 9 },
  { month: 'ส.ค.', count: 6 },
  { month: 'ก.ย.', count: 9 },
];

export const REPAIR_MONTHLY_TREND_MAP: { [key: string]: { month: string; count: number }[] } = {
  '2568': REPAIR_MONTHLY_TREND_2568,
  '2569': REPAIR_MONTHLY_TREND_2569,
  'all': REPAIR_MONTHLY_TREND_ALL,
};

export const REPAIR_YEARLY_COMPARISON = [
  { fiscalYear: '2565', totalRepairs: 28, broken: 28, writtenOff: 4 },
  { fiscalYear: '2566', totalRepairs: 35, broken: 35, writtenOff: 5 },
  { fiscalYear: '2567', totalRepairs: 42, broken: 42, writtenOff: 6 },
  { fiscalYear: '2568', totalRepairs: 51, broken: 51, writtenOff: 8 },
  { fiscalYear: '2569', totalRepairs: 66, broken: 66, writtenOff: 9 },
];

// Fallback Vendor PM Data
export const FALLBACK_PM_DATA_2568: PMYearData = {
  fiscalYear: 2568,
  onTimePercent: 100,
  completenessPercent: 100,
  byDepartment: [
    { department: 'เครื่องตรวจวิเคราะห์ทางเคมีคลินิก-ภูมิคุ้มกันวิทยา', ratePercent: 100, note: 'ตรงเวลา / ครบถ้วน' },
    { department: 'เครื่องตรวจวิเคราะห์ทางโลหิตวิทยา', ratePercent: 100, note: 'ตรงเวลา / ครบถ้วน' },
    { department: 'เครื่องตรวจวิเคราะห์ทางจุลทรรศนศาสตร์', ratePercent: 100, note: 'ตรงเวลา / ครบถ้วน' },
    { department: 'เครื่องตรวจวิเคราะห์ทางจุลชีววิทยา', ratePercent: 100, note: 'ตรงเวลา / ครบถ้วน' },
    { department: 'เครื่องตรวจวิเคราะห์ทางธนาคารเลือด', ratePercent: 100, note: 'ตรงเวลา / ครบถ้วน' },
    { department: 'เครื่องมือทางห้องแลป', ratePercent: 100, note: 'ตรงเวลา / ครบถ้วน' },
  ],
};

export const FALLBACK_PM_DATA_2569: PMYearData = {
  fiscalYear: 2569,
  onTimePercent: 0,
  completenessPercent: 0,
  byDepartment: [
    { department: 'เครื่องตรวจวิเคราะห์ทางเคมีคลินิก-ภูมิคุ้มกันวิทยา', ratePercent: 0, note: 'อยู่ระหว่างรอบสัญญา PM' },
    { department: 'เครื่องตรวจวิเคราะห์ทางโลหิตวิทยา', ratePercent: 0, note: 'อยู่ระหว่างรอบสัญญา PM' },
    { department: 'เครื่องตรวจวิเคราะห์ทางจุลทรรศนศาสตร์', ratePercent: 0, note: 'อยู่ระหว่างรอบสัญญา PM' },
    { department: 'เครื่องตรวจวิเคราะห์ทางจุลชีววิทยา', ratePercent: 0, note: 'อยู่ระหว่างรอบสัญญา PM' },
    { department: 'เครื่องตรวจวิเคราะห์ทางธนาคารเลือด', ratePercent: 0, note: 'อยู่ระหว่างรอบสัญญา PM' },
    { department: 'เครื่องมือทางห้องแลป', ratePercent: 0, note: 'อยู่ระหว่างรอบสัญญา PM' },
  ],
};

export const FALLBACK_PM_DATA_ALL: PMYearData = {
  fiscalYear: 0,
  onTimePercent: 50,
  completenessPercent: 50,
  byDepartment: [
    { department: 'เครื่องตรวจวิเคราะห์ทางเคมีคลินิก-ภูมิคุ้มกันวิทยา', ratePercent: 50, note: '2568: 100% | 2569: อยู่ระหว่างรอบ PM' },
    { department: 'เครื่องตรวจวิเคราะห์ทางโลหิตวิทยา', ratePercent: 50, note: '2568: 100% | 2569: อยู่ระหว่างรอบ PM' },
    { department: 'เครื่องตรวจวิเคราะห์ทางจุลทรรศนศาสตร์', ratePercent: 50, note: '2568: 100% | 2569: อยู่ระหว่างรอบ PM' },
    { department: 'เครื่องตรวจวิเคราะห์ทางจุลชีววิทยา', ratePercent: 50, note: '2568: 100% | 2569: อยู่ระหว่างรอบ PM' },
    { department: 'เครื่องตรวจวิเคราะห์ทางธนาคารเลือด', ratePercent: 50, note: '2568: 100% | 2569: อยู่ระหว่างรอบ PM' },
    { department: 'เครื่องมือทางห้องแลป', ratePercent: 50, note: '2568: 100% | 2569: อยู่ระหว่างรอบ PM' },
  ],
};

export const FALLBACK_PM_DATA_MAP: { [key: string]: PMYearData } = {
  '2568': FALLBACK_PM_DATA_2568,
  '2569': FALLBACK_PM_DATA_2569,
  'all': FALLBACK_PM_DATA_ALL,
};

// Fallback Calibration Data (2565 - 2569)
export const FALLBACK_CALIBRATION_SUMMARY: CalibrationYearData[] = [
  {
    fiscalYear: 2565,
    totalPlanned: 52,
    calibratedCount: 52,
    calibratedPercent: 100,
    uncalibratedCount: 0,
    uncalibratedPercent: 0,
    passedCount: 51,
    passedPercent: 98,
    failedCount: 1,
    failedPercent: 2,
  },
  {
    fiscalYear: 2566,
    totalPlanned: 70,
    calibratedCount: 45,
    calibratedPercent: 64,
    uncalibratedCount: 25,
    uncalibratedPercent: 36,
    passedCount: 43,
    passedPercent: 96,
    failedCount: 2,
    failedPercent: 4,
  },
  {
    fiscalYear: 2567,
    totalPlanned: 98,
    calibratedCount: 88,
    calibratedPercent: 90,
    uncalibratedCount: 10,
    uncalibratedPercent: 10,
    passedCount: 86,
    passedPercent: 98,
    failedCount: 2,
    failedPercent: 2,
  },
  {
    fiscalYear: 2568,
    totalPlanned: 111,
    calibratedCount: 105,
    calibratedPercent: 95,
    uncalibratedCount: 6,
    uncalibratedPercent: 5,
    passedCount: 105,
    passedPercent: 100,
    failedCount: 0,
    failedPercent: 0,
  },
  {
    fiscalYear: 2569,
    totalPlanned: 108,
    calibratedCount: 108,
    calibratedPercent: 100,
    uncalibratedCount: 0,
    uncalibratedPercent: 0,
    passedCount: 108,
    passedPercent: 100,
    failedCount: 0,
    failedPercent: 0,
  },
];

// Color palette definitions for distinct and readable charts
export const CHART_COLORS = {
  blue: '#2563EB',
  teal: '#0D9488',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  purple: '#8B5CF6',
  indigo: '#4F46E5',
  sky: '#0284C7',
  cyan: '#06B6D4',
  orange: '#EA580C',
  violet: '#7C3AED',
  pink: '#DB2777',
  lime: '#65A30D',
  slate: '#64748B',
};

export const DEPARTMENT_BAR_COLORS: { [key: string]: string } = {
  'เครื่องตรวจวิเคราะห์ทางเคมีคลินิก-ภูมิคุ้มกันวิทยา': '#2563EB', // Blue
  'เครื่องตรวจวิเคราะห์ทางโลหิตวิทยา': '#D97706', // Amber/Yellow
  'เครื่องตรวจวิเคราะห์ทางจุลทรรศนศาสตร์': '#EC4899', // Pink
  'เครื่องตรวจวิเคราะห์ทางจุลชีววิทยา': '#10B981', // Emerald
  'เครื่องตรวจวิเคราะห์ทางธนาคารเลือด': '#EF4444', // Red
  'เครื่องมือทางห้องแลป': '#8B5CF6', // Purple
  'ครุภัณฑ์สำนักงานคอมพิวเตอร์และไฟฟ้า': '#06B6D4', // Cyan
  'Donor (ผู้บริจาคโลหิต)': '#F97316', // Orange
  'สำนักงาน': '#64748B', // Slate
};
