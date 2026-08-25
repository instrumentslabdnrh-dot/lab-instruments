import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { GlobalFilterState } from '../types';

interface GlobalFiltersBarProps {
  filters: GlobalFilterState;
  onFilterChange: (newFilters: GlobalFilterState) => void;
  availableDepartments?: string[];
  availableCategories?: string[];
  availableYears?: (string | number)[];
  availableStatuses?: string[];
}

const DEFAULT_DEPARTMENTS = [
  'ทั้งหมด',
  'เคมีคลินิกและภูมิคุ้มกันวิทยา',
  'โลหิตวิทยา',
  'จุลทรรศนศาสตร์',
  'จุลชีววิทยา',
  'ธนาคารเลือด',
  'Donor (ผู้บริจาคโลหิต)',
  'เครื่องมือแลป',
  'สำนักงาน',
  'คอมพิวเตอร์และไฟฟ้า',
];

const DEFAULT_CATEGORIES = [
  'ทั้งหมด',
  'เครื่องมือการแพทย์ (ค.การแพทย์)',
  'วัสดุวิทย์แลป',
  'ครุภัณฑ์แลป',
  'สนับสนุน',
  'ทั่วไป',
];

const DEFAULT_YEARS = ['ทั้งหมด', '2565', '2566', '2567', '2568', '2569', '2570'];

const DEFAULT_STATUSES = ['ทั้งหมด', 'ใช้งาน', 'ชำรุด', 'ยกเลิก', 'stock'];

export const GlobalFiltersBar: React.FC<GlobalFiltersBarProps> = ({
  filters,
  onFilterChange,
  availableDepartments = DEFAULT_DEPARTMENTS,
  availableCategories = DEFAULT_CATEGORIES,
  availableYears = DEFAULT_YEARS,
  availableStatuses = DEFAULT_STATUSES,
}) => {
  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      department: 'ทั้งหมด',
      category: 'ทั้งหมด',
      fiscalYear: 'ทั้งหมด',
      status: 'ทั้งหมด',
    });
  };

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.department !== 'ทั้งหมด' ||
    filters.category !== 'ทั้งหมด' ||
    filters.fiscalYear !== 'ทั้งหมด' ||
    filters.status !== 'ทั้งหมด';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>ตัวกรองและค้นหาข้อมูลเครื่องมือ (Global Filters)</span>
        </div>
        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. ค้นหาชื่อเครื่องมือ */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            🔍 ค้นหาเครื่องมือ / รหัสครุภัณฑ์
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="พิมชื่อเครื่องมือ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* 2. แยกตามงาน */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            📂 แยกตามงาน (คอลัมน์ D)
          </label>
          <select
            value={filters.department}
            onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
          >
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* 3. แยกตามหมวดหมู่ */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            🏷️ แยกตามหมวดหมู่ (คอลัมน์ C)
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 4. แยกตามปีงบประมาณ */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            📅 แยกตามปีงบประมาณ
          </label>
          <select
            value={filters.fiscalYear}
            onChange={(e) => onFilterChange({ ...filters, fiscalYear: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium text-teal-700 font-bold"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={String(yr)}>
                {yr === 'ทั้งหมด' ? 'ปีงบประมาณทั้งหมด' : `ปีงบประมาณ ${yr}`}
              </option>
            ))}
          </select>
        </div>

        {/* 5. แยกตามสถานะ */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            ⚡ แยกตามสถานะ (คอลัมน์ L)
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
          >
            {availableStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
