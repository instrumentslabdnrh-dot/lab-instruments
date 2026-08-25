import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Wrench, Calendar, AlertOctagon, TrendingDown, FileText, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RawDataButton } from './RawDataButton';
import {
  FALLBACK_REPAIR_DATA_MAP,
  REPAIR_MONTHLY_TREND_MAP,
  RAW_SHEET_URLS,
  DEPARTMENT_BAR_COLORS,
} from '../data/fallbackData';
import { GlobalFilterState, SyncSettings } from '../types';
import { fetchCsvText, parseRepairCsvText } from '../services/sheetSync';

interface TabRepairSummaryProps {
  filters: GlobalFilterState;
  settings?: SyncSettings;
  refreshTrigger?: number;
}

export const TabRepairSummary: React.FC<TabRepairSummaryProps> = ({ filters, settings, refreshTrigger }) => {
  const [selectedYear, setSelectedYear] = useState<string>('2569');
  const [liveData, setLiveData] = useState<any | null>(null);
  const [yearlyComparisonData, setYearlyComparisonData] = useState<
    { fiscalYear: string; totalRepairs: number; writtenOff: number }[]
  >([
    { fiscalYear: '2568', totalRepairs: 51, writtenOff: 8 },
    { fiscalYear: '2569', totalRepairs: 66, writtenOff: 9 },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const baseSheetUrl = RAW_SHEET_URLS.repairs;

    if (baseSheetUrl && baseSheetUrl.trim()) {
      setIsLoading(true);

      // Always fetch all available fiscal years starting from 2568 onwards to build the yearly comparison trend
      Promise.all([
        fetchCsvText(baseSheetUrl, '2568'),
        fetchCsvText(baseSheetUrl, '2569'),
      ]).then(([text2568, text2569]) => {
        if (!isMounted) return;
        const p2568 = text2568 ? parseRepairCsvText(text2568) : null;
        const p2569 = text2569 ? parseRepairCsvText(text2569) : null;

        // Build dynamic comparison from 2568 onwards
        const comparison: { fiscalYear: string; totalRepairs: number; writtenOff: number }[] = [];
        if (p2568) {
          comparison.push({
            fiscalYear: '2568',
            totalRepairs: p2568.totalRepairs || 51,
            writtenOff: p2568.writtenOffCount || 8,
          });
        } else {
          comparison.push({ fiscalYear: '2568', totalRepairs: 51, writtenOff: 8 });
        }

        if (p2569) {
          comparison.push({
            fiscalYear: '2569',
            totalRepairs: p2569.totalRepairs || 66,
            writtenOff: p2569.writtenOffCount || 9,
          });
        } else {
          comparison.push({ fiscalYear: '2569', totalRepairs: 66, writtenOff: 9 });
        }

        setYearlyComparisonData(comparison);

        if (selectedYear === 'all') {
          if (p2568 || p2569) {
            const months = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
            const combinedMonthly = months.map((m, idx) => ({
              month: m,
              count: (p2568?.monthlyTrend?.[idx]?.count || 0) + (p2569?.monthlyTrend?.[idx]?.count || 0),
            }));

            const deptMap: { [k: string]: any } = {};
            [...(p2568?.byDepartment || []), ...(p2569?.byDepartment || [])].forEach((d) => {
              if (!deptMap[d.department]) {
                deptMap[d.department] = { department: d.department, total: 0, months: {} };
              }
              deptMap[d.department].total += d.total || 0;
            });

            const byDepartment = Object.values(deptMap).sort((a: any, b: any) => b.total - a.total);
            const totalRepairs = (p2568?.totalRepairs || 0) + (p2569?.totalRepairs || 0);
            const writtenOffCount = (p2568?.writtenOffCount || 0) + (p2569?.writtenOffCount || 0);

            setLiveData({
              byDepartment,
              monthlyTrend: combinedMonthly,
              totalRepairs,
              totalBroken: totalRepairs,
              writtenOffCount,
              frequentFailures: byDepartment.slice(0, 7).map((d: any) => ({ name: d.department, count: d.total })),
            });
            setIsLive(true);
          } else {
            setLiveData(null);
            setIsLive(false);
          }
          setIsLoading(false);
        } else if (selectedYear === '2568') {
          if (p2568 && p2568.byDepartment && p2568.byDepartment.length > 0) {
            setLiveData(p2568);
            setIsLive(true);
          } else {
            setLiveData(null);
            setIsLive(false);
          }
          setIsLoading(false);
        } else if (selectedYear === '2569') {
          if (p2569 && p2569.byDepartment && p2569.byDepartment.length > 0) {
            setLiveData(p2569);
            setIsLive(true);
          } else {
            setLiveData(null);
            setIsLive(false);
          }
          setIsLoading(false);
        } else {
          // Any other customized fiscal year tab
          fetchCsvText(baseSheetUrl, selectedYear).then((text) => {
            if (!isMounted) return;
            if (text) {
              const parsed = parseRepairCsvText(text);
              if (parsed && parsed.byDepartment && parsed.byDepartment.length > 0) {
                setLiveData(parsed);
                setIsLive(true);
                setIsLoading(false);
                return;
              }
            }
            setLiveData(null);
            setIsLive(false);
            setIsLoading(false);
          });
        }
      });
    } else {
      setLiveData(null);
      setIsLive(false);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedYear, settings, refreshTrigger]);

  const fallbackRepair = FALLBACK_REPAIR_DATA_MAP[selectedYear] || FALLBACK_REPAIR_DATA_MAP['2569'];
  const fallbackMonthly = REPAIR_MONTHLY_TREND_MAP[selectedYear] || REPAIR_MONTHLY_TREND_MAP['2569'];

  const repairData = liveData || fallbackRepair;
  const monthlyTrend = liveData?.monthlyTrend || fallbackMonthly;

  const configForYear = settings?.sheetConfigs?.find((c) => String(c.fiscalYear) === selectedYear);
  const rawSheetUrl =
    configForYear?.repairUrl ||
    (selectedYear === '2568'
      ? RAW_SHEET_URLS.repairs2568
      : selectedYear === '2569'
      ? RAW_SHEET_URLS.repairs2569
      : RAW_SHEET_URLS.repairs);

  const topDept = [...repairData.byDepartment].sort((a, b) => b.total - a.total)[0] || {
    department: 'โลหิตวิทยา',
    total: 29,
  };

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-slate-700 max-w-xs">
          <p className="font-bold text-rose-300">{label || payload[0].name}</p>
          <p className="text-slate-200 mt-1">
            จำนวนครั้งที่ชำรุด/ส่งซ่อม:{' '}
            <span className="font-extrabold text-amber-400">{payload[0].value}</span> ครั้ง
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
              <Wrench className="w-6 h-6 text-rose-600" />
              <span>ปุ่มที่ 3: สรุปงานซ่อมเครื่องมือและประวัติเครื่องชำรุด/ไม่พร้อมใช้งาน</span>
            </h2>
            {isLoading ? (
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                กำลังดึงข้อมูลสด...
              </span>
            ) : isLive ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                เชื่อมข้อมูลสด Google Sheets
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                ใช้ข้อมูลประวัติระบบ
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            บันทึกความถี่การชำรุด รายเดือน รายสายงาน และแนวโน้มเครื่องมือแทงชำรุด
          </p>
        </div>

        {/* ปุ่มลิ้งไปยังข้อมูลดิบ */}
        <RawDataButton url={rawSheetUrl} label={`เปิดดูข้อมูลดิบ Google Sheets (${selectedYear === 'all' ? 'ทุกปี' : `ปี ${selectedYear}`})`} />
      </div>

      {/* Fiscal Year Filter Dropdown & Summary Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-rose-600" />
          <span className="font-bold text-slate-800 text-sm">
            เลือกปีงบประมาณที่ต้องการแสดงข้อมูลงานซ่อม:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['2569', '2568', 'all'].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 ${
                selectedYear === yr
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {yr === 'all' ? 'รวมทุกปีงบประมาณ (2568-2569)' : `ปีงบประมาณ ${yr}`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="จำนวนครั้งส่งซ่อมรวม"
          value={`${repairData.totalRepairs}`}
          subtitle={`สถิติการแจ้งซ่อมทั้งหมด (${selectedYear === 'all' ? 'รวม 2568-2569' : `ปีงบ ${selectedYear}`})`}
          icon={<Wrench className="w-6 h-6 text-rose-600" />}
          colorScheme="rose"
          badgeText="ครั้ง"
        />
        <MetricCard
          title="เครื่องมือไม่พร้อมใช้งาน"
          value={`${repairData.totalBroken}`}
          subtitle="ชำรุดส่งผลต่อการตรวจ"
          icon={<AlertOctagon className="w-6 h-6 text-amber-600" />}
          colorScheme="amber"
          badgeText="ครั้ง"
        />
        <MetricCard
          title="เครื่องมือแทงชำรุด"
          value={`${repairData.writtenOffCount}`}
          subtitle="จำหน่าย / ปลดวิถีตัดออก"
          icon={<TrendingDown className="w-6 h-6 text-indigo-600" />}
          colorScheme="indigo"
          badgeText="เครื่อง"
        />
        <MetricCard
          title="สายงานที่ซ่อมบ่อยที่สุด"
          value={topDept.department.replace('เครื่องตรวจวิเคราะห์ทาง', '')}
          subtitle={`${topDept.total} ครั้ง (${selectedYear === 'all' ? 'ปีงบ 2568-2569' : `ปีงบ ${selectedYear}`})`}
          icon={<FileText className="w-6 h-6 text-purple-600" />}
          colorScheme="purple"
        />
      </div>

      {/* Chart 1: สัดส่วนการซ่อมแยกตามงาน (แถวที่ 4-11 ของทุกชีท) มีสีแตกต่างกันชัดเจน */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              1. สัดส่วนการซ่อม/ชำรุด แยกตามกลุ่มประเภทเครื่องมือ (ปีงบประมาณ {selectedYear === 'all' ? '2568-2569' : selectedYear})
            </h3>
            <p className="text-xs text-slate-500">
              จำแนกสถิติจำนวนครั้งที่ส่งซ่อมแยกตามสายงานแลป โดยใช้สีที่แตกต่างกันชัดเจน
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            รวม {repairData.totalRepairs} ครั้ง
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={repairData.byDepartment}
              margin={{ top: 20, right: 30, left: 0, bottom: 65 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="department"
                tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
              />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {repairData.byDepartment.map((entry, index) => {
                  const color =
                    DEPARTMENT_BAR_COLORS[entry.department] ||
                    ['#2563EB', '#D97706', '#EC4899', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'][index % 7];
                  return <Cell key={`repair-cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Color Legend Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100">
          {repairData.byDepartment.map((dept, idx) => {
            const color =
              DEPARTMENT_BAR_COLORS[dept.department] ||
              ['#2563EB', '#D97706', '#EC4899', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'][idx % 7];
            return (
              <div
                key={dept.department}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-medium text-slate-700 truncate">{dept.department}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">{dept.total} ครั้ง</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid 2 Charts: Monthly Trend & Yearly Trends (2568 Onwards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: แนวโน้มจำนวนครั้งเครื่องซ่อมแยกรายเดือน (ต.ค. - ก.ย.) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                2. แนวโน้มจำนวนครั้งการส่งซ่อมรายเดือน (ต.ค. - ก.ย.)
              </h3>
              <p className="text-xs text-slate-500">
                สถิติการชำรุดรายเดือน (ปีงบ {selectedYear === 'all' ? '2568-2569' : selectedYear})
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              รวม {repairData.totalRepairs} ครั้ง
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="จำนวนครั้งชำรุด"
                  stroke="#E11D48"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#E11D48', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, fill: '#0369A1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: แนวโน้มสรุปจำนวนการส่งซ่อมและเครื่องมือแทงชำรุดสะสม (ตั้งแต่ปีงบ 2568 เป็นต้นไป) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                3. แนวโน้มการส่งซ่อมและเครื่องมือแทงชำรุดสะสม (ตั้งแต่ปีงบ 2568 เป็นต้นไป)
              </h3>
              <p className="text-xs text-slate-500">
                เปรียบเทียบสถิติการส่งซ่อมกับการตัดแทงชำรุดสะสมตามข้อมูลจริงใน Google Sheets
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              ข้อมูลปี 68 - ปัจจุบัน
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyComparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="fiscalYear" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="totalRepairs"
                  name="จำนวนครั้งส่งซ่อม"
                  stroke="#D97706"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#D97706', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 8, fill: '#B45309' }}
                />
                <Line
                  type="monotone"
                  dataKey="writtenOff"
                  name="จำนวนเครื่องแทงชำรุด"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 8, fill: '#3730A3' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
