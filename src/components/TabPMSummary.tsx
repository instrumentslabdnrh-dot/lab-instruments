import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ShieldCheck, Calendar, CheckCircle2, Building, Award, Clock, RefreshCw } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RawDataButton } from './RawDataButton';
import { FALLBACK_PM_DATA_MAP, RAW_SHEET_URLS, DEPARTMENT_BAR_COLORS } from '../data/fallbackData';
import { GlobalFilterState, SyncSettings } from '../types';
import { fetchCsvText, parsePmCsvText } from '../services/sheetSync';

interface TabPMSummaryProps {
  filters: GlobalFilterState;
  settings?: SyncSettings;
  refreshTrigger?: number;
}

export const TabPMSummary: React.FC<TabPMSummaryProps> = ({ filters, settings, refreshTrigger }) => {
  const [selectedYear, setSelectedYear] = useState<string>('2569');
  const [liveData, setLiveData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const baseSheetUrl = RAW_SHEET_URLS.pm;

    if (baseSheetUrl && baseSheetUrl.trim()) {
      setIsLoading(true);

      if (selectedYear === 'all') {
        Promise.all([
          fetchCsvText(baseSheetUrl, '2568'),
          fetchCsvText(baseSheetUrl, '2569'),
        ]).then(([text2568, text2569]) => {
          if (!isMounted) return;
          const p2568 = text2568 ? parsePmCsvText(text2568) : null;
          const p2569 = text2569 ? parsePmCsvText(text2569) : null;

          if (p2568 || p2569) {
            const depts2568 = p2568?.byDepartment || [];
            const depts2569 = p2569?.byDepartment || [];

            // Combine departments
            const combinedDepts = depts2568.map((d1) => {
              const d2 = depts2569.find((x) => x.department === d1.department);
              const avgRate = d2 ? Math.round((d1.ratePercent + d2.ratePercent) / 2) : d1.ratePercent;
              return {
                department: d1.department,
                ratePercent: avgRate,
                note: `ปี 68: ${d1.ratePercent}% | ปี 69: ${d2?.ratePercent ?? 0}%`,
              };
            });

            const overallAvg =
              combinedDepts.length > 0
                ? Math.round(combinedDepts.reduce((acc, cur) => acc + cur.ratePercent, 0) / combinedDepts.length)
                : 50;

            setLiveData({
              byDepartment: combinedDepts,
              onTimePercent: overallAvg,
              completenessPercent: overallAvg,
              completePercent: overallAvg,
            });
            setIsLive(true);
          } else {
            setLiveData(null);
            setIsLive(false);
          }
          setIsLoading(false);
        });
      } else {
        const sheetTabName = selectedYear;
        fetchCsvText(baseSheetUrl, sheetTabName).then((text) => {
          if (!isMounted) return;
          if (text) {
            const parsed = parsePmCsvText(text);
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
    } else {
      setLiveData(null);
      setIsLive(false);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedYear, settings, refreshTrigger]);

  const fallbackPm = FALLBACK_PM_DATA_MAP[selectedYear] || FALLBACK_PM_DATA_MAP['2569'];
  const pmData = liveData || fallbackPm;

  const configForYear = settings?.sheetConfigs?.find((c) => String(c.fiscalYear) === selectedYear);
  const rawSheetUrl =
    configForYear?.pmUrl ||
    (selectedYear === '2568'
      ? RAW_SHEET_URLS.pm2568
      : selectedYear === '2569'
      ? RAW_SHEET_URLS.pm2569
      : RAW_SHEET_URLS.pm);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
          <p className="font-bold text-teal-300">{label}</p>
          <p className="text-slate-200 mt-1">
            อัตราการเข้า PM ครบถ้วน:{' '}
            <span className="font-extrabold text-emerald-400">{val}%</span>
          </p>
          <p className="text-slate-400 text-[11px]">
            สถานะ: {val > 0 ? 'ตรงเวลาและครบตามรอบสัญญา' : 'อยู่ระหว่างรอบดำเนินการ PM ตามแผนงาน'}
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
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>ปุ่มที่ 4: สรุปการเข้ามาบำรุงรักษาเชิงป้องกัน (PM) ของบริษัทคู่สัญญา</span>
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
            ประเมินความตรงต่อเวลา ความครบถ้วนในการเข้าตรวจเช็ค PM และสัดส่วนแยกตามสายงาน
          </p>
        </div>

        {/* ปุ่มลิ้งไปยังข้อมูลดิบ */}
        <RawDataButton url={rawSheetUrl} label={`เปิดดูข้อมูลดิบ Google Sheets (${selectedYear === 'all' ? 'ทุกปี' : `ปี ${selectedYear}`})`} />
      </div>

      {/* Year Filter Dropdown & Summary Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-800 text-sm">
            เลือกปีงบประมาณเพื่อดูผลการเข้า PM บริษัท:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['2569', '2568', 'all'].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 ${
                selectedYear === yr
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
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
          title="ความตรงต่อเวลาเข้า PM"
          value={`${pmData.onTimePercent ?? 100}%`}
          subtitle={selectedYear === '2569' ? 'อยู่ระหว่างรอรอบเข้า PM ปี 2569' : 'บริษัทเข้าดำเนินการตามกำหนดนัด'}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          colorScheme={selectedYear === '2569' ? 'amber' : 'emerald'}
          badgeText={selectedYear === '2569' ? 'อยู่ระหว่างรอบ PM' : '100% Target Pass'}
        />
        <MetricCard
          title="ความครบถ้วนตามรายการ PM"
          value={`${pmData.completenessPercent ?? (pmData as any).completePercent ?? 100}%`}
          subtitle={selectedYear === '2569' ? 'รอการเข้าตรวจตามรอบสัญญา' : 'ตรวจเช็คครบตาม checklist สัญญา'}
          icon={<Award className="w-6 h-6 text-blue-600" />}
          colorScheme={selectedYear === '2569' ? 'amber' : 'blue'}
          badgeText={selectedYear === '2569' ? 'รอดำเนินการ' : 'Complete'}
        />
        <MetricCard
          title="จำนวนสายงานที่ครอบคลุม"
          value="6"
          subtitle="สายงานเครื่องมือวิเคราะห์หลัก"
          icon={<Building className="w-6 h-6 text-purple-600" />}
          colorScheme="purple"
          badgeText="6 สายงาน"
        />
        <MetricCard
          title="สถานะผลการ PM สรุป"
          value={selectedYear === '2569' ? 'อยู่ระหว่างรอบ' : selectedYear === '2568' ? 'ผ่าน 100%' : '50% เฉลี่ย'}
          subtitle={selectedYear === '2569' ? 'รอบสัญญา PM ปีงบประมาณ 2569' : 'ไม่มีรายงานค้าง PM หรือผิดนัด'}
          icon={selectedYear === '2569' ? <Clock className="w-6 h-6 text-amber-600" /> : <ShieldCheck className="w-6 h-6 text-teal-600" />}
          colorScheme={selectedYear === '2569' ? 'amber' : 'teal'}
        />
      </div>

      {/* Bar Chart Section: อัตราการเข้า PM แยกตามสายงาน ด้วยสีที่แตกต่างกันชัดเจน */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              สัดส่วนอัตราการเข้าตรวจเช็ค PM จำแนกตามสายงานเครื่องมือวิเคราะห์ (ปีงบประมาณ {selectedYear === 'all' ? '2568-2569' : selectedYear})
            </h3>
            <p className="text-xs text-slate-500">
              แสดงเปอร์เซ็นต์ความสำเร็จพร้อมสีประจำสายงานที่แตกต่างกันเพื่อให้ดูง่ายชัดเจน
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            selectedYear === '2569'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}>
            {selectedYear === '2569' ? 'สถานะ: อยู่ระหว่างรอบสัญญา PM' : 'เป้าหมาย: 100%'}
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pmData.byDepartment}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="department"
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={65}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ratePercent" radius={[8, 8, 0, 0]}>
                {pmData.byDepartment.map((entry, index) => {
                  const color =
                    DEPARTMENT_BAR_COLORS[entry.department] ||
                    ['#2563EB', '#D97706', '#EC4899', '#10B981', '#EF4444', '#8B5CF6'][index % 6];
                  return <Cell key={`pm-cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Breakdown Cards Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          {pmData.byDepartment.map((item, idx) => {
            const color =
              DEPARTMENT_BAR_COLORS[item.department] ||
              ['#2563EB', '#D97706', '#EC4899', '#10B981', '#EF4444', '#8B5CF6'][idx % 6];
            const isCompleted = item.ratePercent > 0;
            return (
              <div
                key={item.department}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate">{item.department}</p>
                    <p className="text-[11px] text-slate-500">{item.note || (isCompleted ? 'ครบถ้วนตามรอบ' : 'อยู่ระหว่างรอบสัญญา')}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-sm font-extrabold block ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {item.ratePercent}%
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isCompleted ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                  }`}>
                    {isCompleted ? 'ผ่านเกณฑ์' : 'รอดำเนินการ'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
