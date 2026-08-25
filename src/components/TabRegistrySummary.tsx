import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Archive,
  TrendingUp,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RawDataButton } from './RawDataButton';
import { FALLBACK_REGISTRY_SUMMARY, RAW_SHEET_URLS } from '../data/fallbackData';
import { GlobalFilterState, SyncSettings, EquipmentItem } from '../types';
import { fetchCsvText, parseRegistryCsvText, getThaiFormattedTime } from '../services/sheetSync';

interface TabRegistrySummaryProps {
  filters: GlobalFilterState;
  settings?: SyncSettings;
  refreshTrigger?: number;
}

export const TabRegistrySummary: React.FC<TabRegistrySummaryProps> = ({ filters, settings, refreshTrigger }) => {
  const [liveData, setLiveData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    let customUrl = settings?.sheetConfigs?.[0]?.registryUrl || RAW_SHEET_URLS.registry;
    
    // Ensure URL doesn't have broken sheet=สรุป parameter for registry
    if (customUrl.includes('1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs') && customUrl.includes('sheet=สรุป')) {
      customUrl = 'https://docs.google.com/spreadsheets/d/1on3XwCkPZ_goTIz1ckMX3U800kmrYVhC4d4WHl17wJs/gviz/tq?tqx=out:csv&gid=0';
    }

    if (customUrl && customUrl.trim()) {
      setIsLoading(true);
      fetchCsvText(customUrl).then((text) => {
        if (!isMounted) return;
        if (text) {
          const parsed = parseRegistryCsvText(text);
          if (parsed && parsed.totalCount > 0) {
            setLiveData(parsed);
            setIsLive(true);
            setLastUpdated(getThaiFormattedTime());
            setIsLoading(false);
            return;
          }
        }
        setLiveData(null);
        setIsLive(false);
        setIsLoading(false);
      });
    } else {
      setLiveData(null);
      setIsLive(false);
    }

    return () => {
      isMounted = false;
    };
  }, [settings, refreshTrigger]);

  const rawSummary = liveData || FALLBACK_REGISTRY_SUMMARY;

  // Filter items dynamically if liveData is available and filters are active
  const filteredData = React.useMemo(() => {
    if (!liveData || !liveData.items) return rawSummary;

    let items: EquipmentItem[] = liveData.items;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      items = items.filter((i: any) =>
        i.name?.toLowerCase().includes(q) ||
        i.assetNo?.toLowerCase().includes(q) ||
        i.department?.toLowerCase().includes(q) ||
        i.spec?.toLowerCase().includes(q) ||
        i.serialNo?.toLowerCase().includes(q)
      );
    }
    if (filters.department && filters.department !== 'ทั้งหมด') {
      items = items.filter((i: any) => i.department === filters.department);
    }
    if (filters.category && filters.category !== 'ทั้งหมด') {
      items = items.filter((i: any) => i.category === filters.category);
    }
    if (filters.status && filters.status !== 'ทั้งหมด') {
      items = items.filter((i: any) => i.status === filters.status);
    }
    if (filters.fiscalYear && filters.fiscalYear !== 'ทั้งหมด') {
      items = items.filter((i: any) => String(i.fiscalYear) === filters.fiscalYear);
    }

    // Recompute summaries for filtered view
    const totalCount = items.length;
    const catMap: { [key: string]: number } = {};
    const deptMap: { [key: string]: number } = {};
    const statusMap: { [key: string]: number } = {};

    items.forEach((item: any) => {
      catMap[item.category] = (catMap[item.category] || 0) + 1;
      deptMap[item.department] = (deptMap[item.department] || 0) + 1;
      statusMap[item.status] = (statusMap[item.status] || 0) + 1;
    });

    const byCategory = rawSummary.byCategory.map((cat: any) => ({
      ...cat,
      count: catMap[cat.name] || 0,
    }));

    const byDepartment = rawSummary.byDepartment.map((dept: any) => ({
      ...dept,
      count: deptMap[dept.name] || 0,
    }));

    const byStatus = rawSummary.byStatus.map((st: any) => ({
      ...st,
      count: statusMap[st.name] || 0,
    }));

    return {
      ...rawSummary,
      totalCount,
      byCategory,
      byDepartment,
      byStatus,
    };
  }, [liveData, rawSummary, filters]);

  const summary = filteredData;

  const normalCount = summary.byStatus.find((s: any) => s.name === 'ใช้งาน')?.count || 0;
  const brokenCount = summary.byStatus.find((s: any) => s.name === 'ชำรุด')?.count || 0;
  const stockCount = summary.byStatus.find((s: any) => s.name.includes('Stock') || s.name.includes('สำรอง'))?.count || 0;
  const canceledCount = summary.byStatus.find((s: any) => s.name === 'ยกเลิก')?.count || 0;

  const normalPct = summary.totalCount > 0 ? ((normalCount / summary.totalCount) * 100).toFixed(1) : '0';
  const brokenPct = summary.totalCount > 0 ? ((brokenCount / summary.totalCount) * 100).toFixed(1) : '0';
  const stockPct = summary.totalCount > 0 ? ((stockCount / summary.totalCount) * 100).toFixed(1) : '0';
  const canceledPct = summary.totalCount > 0 ? ((canceledCount / summary.totalCount) * 100).toFixed(1) : '0';

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
          <p className="font-bold text-teal-300">{label || payload[0].name}</p>
          <p className="text-slate-200 mt-1">
            จำนวน: <span className="font-extrabold text-white">{payload[0].value}</span> เครื่อง
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header & Raw Data Link */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-teal-600" />
              <span>ปุ่มที่ 1: สรุปทะเบียนเครื่องมือห้องปฏิบัติการ</span>
            </h2>
            {isLoading ? (
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                กำลังดึงข้อมูลสด...
              </span>
            ) : isLive ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                เชื่อมข้อมูลสด Google Sheets สำเร็จ ({summary.totalCount} รายการ)
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                ใช้ข้อมูลประวัติระบบ
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            ข้อมูลครุภัณฑ์ อุปกรณ์ และเครื่องมือแลปทั้งหมด แยกตามหมวดหมู่ งาน สถานะ และแนวโน้มรายปีงบประมาณ
          </p>
        </div>

        {/* ปุ่มลิ้งไปยังข้อมูลดิบ */}
        <RawDataButton url={RAW_SHEET_URLS.registry} label="เปิดดูข้อมูลดิบ Google Sheets" />
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="เครื่องมือทั้งหมด"
          value={`${summary.totalCount}`}
          subtitle="ทะเบียนเครื่องมือรวมทุกหมวด"
          icon={<FileSpreadsheet className="w-6 h-6" />}
          colorScheme="blue"
          badgeText="100%"
        />
        <MetricCard
          title="สถานะ: ใช้งานได้ปกติ"
          value={`${normalCount}`}
          subtitle="พร้อมให้บริการประจำจุด"
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          colorScheme="emerald"
          badgeText={`${normalPct}%`}
        />
        <MetricCard
          title="สถานะ: ชำรุด/ส่งซ่อม"
          value={`${brokenCount}`}
          subtitle="รอการแก้ไขซ่อมบำรุง"
          icon={<AlertTriangle className="w-6 h-6 text-rose-600" />}
          colorScheme="rose"
          badgeText={`${brokenPct}%`}
        />
        <MetricCard
          title="สถานะ: สำรอง (Stock)"
          value={`${stockCount}`}
          subtitle="เครื่องมือสำรองพร้อมสลับ"
          icon={<Archive className="w-6 h-6 text-amber-600" />}
          colorScheme="amber"
          badgeText={`${stockPct}%`}
        />
        <MetricCard
          title="สถานะ: ยกเลิกใช้งาน"
          value={`${canceledCount}`}
          subtitle="ตัดจำหน่าย / ยกเลิก"
          icon={<XCircle className="w-6 h-6 text-slate-600" />}
          colorScheme="indigo"
          badgeText={`${canceledPct}%`}
        />
      </div>

      {/* Grid Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: สัดส่วนเครื่องมือตามหมวดหมู่ (Column C) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  1. สัดส่วนเครื่องมือตามหมวดหมู่ (คอลัมน์ C)
                </h3>
                <p className="text-xs text-slate-500">
                  เครื่องมือการแพทย์, วัสดุวิทย์แลป, ครุภัณฑ์แลป, สนับสนุน, ทั่วไป
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    label={({ name, count }) => `${name.split(' ')[0]}: ${count}`}
                  >
                    {summary.byCategory.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
            {summary.byCategory.map((item: any) => (
              <div
                key={item.name}
                className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] font-medium text-slate-600 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-slate-900 shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: สัดส่วนเครื่องมือแยกตามสถานะ (Column L) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  2. สัดส่วนเครื่องมือแยกตามสถานะ (คอลัมน์ L)
                </h3>
                <p className="text-xs text-slate-500">
                  ใช้งาน ({normalCount}), ชำรุด ({brokenCount}), ยกเลิก ({canceledCount}), Stock ({stockCount})
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.byStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {summary.byStatus.map((entry: any, index: number) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Breakdown Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
            {summary.byStatus.map((item: any) => (
              <div
                key={item.name}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center"
              >
                <div className="text-[11px] font-medium text-slate-500">{item.name}</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: สัดส่วนเครื่องมือตามสายงาน (Column D) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-bold text-slate-800 text-base">
            3. สัดส่วนเครื่องมือจำแนกตามสายงาน / แผนกปฏิบัติการ (คอลัมน์ D)
          </h3>
          <p className="text-xs text-slate-500">
            จำแนกเครื่องมือรายสายงาน เพื่อการบริหารจัดการและสอบบำรุง
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.byDepartment}
              margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {summary.byDepartment.map((entry: any, index: number) => (
                  <Cell key={`dept-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: แนวโน้มการเพิ่มจำนวนเครื่องมือรายปีงบประมาณ (ปีงบ พ.ศ. 2551 - 2569) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <span>4. แนวโน้มการเพิ่มจำนวนเครื่องมือที่ติดตั้งใหม่รายปีงบประมาณ (พ.ศ. 2551 - 2569)</span>
            </h3>
            <p className="text-xs text-slate-500">
              การจัดหาเครื่องมือสะสมและลงรับรายปีเพื่อประเมินอัตราขยายตัวของห้องปฏิบัติการ
            </p>
          </div>
          <span className="text-xs bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-full border border-teal-200">
            {summary.yearlyTrend.length} ปีงบประมาณ
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={summary.yearlyTrend}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="fiscalYear" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="จำนวนเครื่องมือที่ลงรับใหม่"
                stroke="#0D9488"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0D9488', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 8, fill: '#2563EB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

