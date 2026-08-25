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
import { Award, Calendar, CheckCircle2, XCircle, AlertCircle, TrendingUp, HelpCircle, RefreshCw, Clock } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RawDataButton } from './RawDataButton';
import {
  FALLBACK_CALIBRATION_SUMMARY,
  RAW_SHEET_URLS,
} from '../data/fallbackData';
import { GlobalFilterState, SyncSettings, CalibrationYearData } from '../types';
import { fetchCsvText, parseCalibrationCsvText } from '../services/sheetSync';

interface TabCalibrationSummaryProps {
  filters: GlobalFilterState;
  settings?: SyncSettings;
  refreshTrigger?: number;
}

export const TabCalibrationSummary: React.FC<TabCalibrationSummaryProps> = ({ filters, settings, refreshTrigger }) => {
  // Requirement: Default to displaying the current fiscal year (e.g. 2568)
  const [selectedYear, setSelectedYear] = useState<string>('2568');
  const [liveCalibrationData, setLiveCalibrationData] = useState<CalibrationYearData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const customUrl = settings?.sheetConfigs?.[0]?.calibrationUrl || RAW_SHEET_URLS.calibration;

    if (customUrl && customUrl.trim()) {
      setIsLoading(true);
      fetchCsvText(customUrl, 'สรุป').then((text) => {
        if (!isMounted) return;
        if (text) {
          const parsed = parseCalibrationCsvText(text);
          if (parsed && parsed.length > 0) {
            setLiveCalibrationData(parsed);
            setIsLive(true);
            setIsLoading(false);
            return;
          }
        }
        setLiveCalibrationData(null);
        setIsLive(false);
        setIsLoading(false);
      });
    } else {
      setLiveCalibrationData(null);
      setIsLive(false);
    }

    return () => {
      isMounted = false;
    };
  }, [settings, refreshTrigger]);

  const allYearData = liveCalibrationData || FALLBACK_CALIBRATION_SUMMARY;

  // Find exact year data or fallback
  const yearData =
    allYearData.find((x) => String(x.fiscalYear) === selectedYear) ||
    allYearData.find((x) => x.fiscalYear === 2568) ||
    FALLBACK_CALIBRATION_SUMMARY[3];

  // Comparison Bar Chart Dataset for the selected fiscal year
  const comparisonData = [
    { name: '1. แผนที่ต้องสอบเทียบ', count: yearData.totalPlanned, percent: 100, color: '#2563EB' },
    { name: '2. ได้รับการสอบเทียบ', count: yearData.calibratedCount, percent: yearData.calibratedPercent, color: '#0D9488' },
    { name: '3. ไม่ได้สอบเทียบ', count: yearData.uncalibratedCount, percent: yearData.uncalibratedPercent, color: '#F59E0B' },
    { name: '4. สอบเทียบผ่าน', count: yearData.passedCount, percent: yearData.passedPercent, color: '#10B981' },
    { name: '5. สอบเทียบไม่ผ่าน', count: yearData.failedCount, percent: yearData.failedPercent, color: '#EF4444' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
          <p className="font-bold text-teal-300">{data.name}</p>
          <p className="text-slate-100 mt-1">
            จำนวน: <span className="font-extrabold text-white">{data.count}</span> เครื่อง
          </p>
          <p className="text-slate-300 text-[11px]">
            คิดเป็นสัดส่วน: <span className="font-bold text-amber-300">{data.percent}%</span>
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
              <Award className="w-6 h-6 text-indigo-600" />
              <span>ปุ่มที่ 5: สรุปผลการสอบเทียบเครื่องมือ (Calibration Summary)</span>
            </h2>
            {isLoading ? (
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                กำลังดึงข้อมูลสด...
              </span>
            ) : isLive ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                เชื่อมข้อมูลสด Google Sheets (อัปเดตเรียลไทม์)
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                ใช้ข้อมูลประวัติระบบ
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            รายงานแผนและผลการสอบเทียบเครื่องมือวัด ประจำปีงบประมาณ 2565 - 2569 (แสดงผลเริ่มต้นเป็นปีงบปัจจุบัน)
          </p>
        </div>

        {/* ปุ่มลิ้งไปยังข้อมูลดิบ */}
        <RawDataButton url={RAW_SHEET_URLS.calibration} label="เปิดดูข้อมูลดิบ Google Sheets" />
      </div>

      {/* Fiscal Year Filter Dropdown & Summary Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-slate-800 text-sm">
            เลือกปีงบประมาณที่ต้องการแสดงข้อมูล (เริ่มต้นเป็นปีปัจจุบัน):
          </span>
        </div>

        {/* Fiscal Year Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {['2565', '2566', '2567', '2568', '2569'].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 ${
                selectedYear === yr
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ปีงบประมาณ {yr} {yr === '2568' ? '(ปีปัจจุบัน)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Key Metric Boxes required by prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. จำนวนเครื่องมือทั้งหมด แถวที่ 3 */}
        <MetricCard
          title="1. เครื่องมือตามแผน"
          value={`${yearData.totalPlanned}`}
          subtitle="แถวที่ 3 (แผนรวมทั้งหมด)"
          icon={<Award className="w-6 h-6 text-blue-600" />}
          colorScheme="blue"
          badgeText="100%"
        />

        {/* 2. จำนวนเครื่องมือได้สอบเทียบ แถวที่ 4 */}
        <MetricCard
          title="2. ได้รับการสอบเทียบ"
          value={`${yearData.calibratedCount}`}
          subtitle={`คิดเป็น ${yearData.calibratedPercent}% ของแผน`}
          icon={<CheckCircle2 className="w-6 h-6 text-teal-600" />}
          colorScheme="teal"
          badgeText={`${yearData.calibratedPercent}%`}
        />

        {/* 3. จำนวนเครื่องมือไม่ได้สอบเทียบ แถวที่ 5 */}
        <MetricCard
          title="3. ไม่ได้รับการสอบเทียบ"
          value={`${yearData.uncalibratedCount}`}
          subtitle={`คิดเป็น ${yearData.uncalibratedPercent}% ของแผน`}
          icon={<HelpCircle className="w-6 h-6 text-amber-600" />}
          colorScheme="amber"
          badgeText={`${yearData.uncalibratedPercent}%`}
        />

        {/* 4. จำนวนที่เครื่องมือผ่าน แถวที่ 6 */}
        <MetricCard
          title="4. สอบเทียบผ่านเกณฑ์"
          value={`${yearData.passedCount}`}
          subtitle={`คิดเป็น ${yearData.passedPercent}% ของที่สอบ`}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          colorScheme="emerald"
          badgeText={`${yearData.passedPercent}% Pass`}
        />

        {/* 5. จำนวนที่เครื่องมือไม่ผ่าน แถวที่ 7 */}
        <MetricCard
          title="5. สอบเทียบไม่ผ่าน"
          value={`${yearData.failedCount}`}
          subtitle={`คิดเป็น ${yearData.failedPercent}% ของที่สอบ`}
          icon={<XCircle className="w-6 h-6 text-rose-600" />}
          colorScheme="rose"
          badgeText={`${yearData.failedPercent}% Fail`}
        />
      </div>

      {/* Chart 1: Comparison Bar Chart for Items 1-5 with DISTINCT Clear Bar Colors */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              1. แผนภูมิกราฟเปรียบเทียบข้อมูลแผนและผลลัพธ์การสอบเทียบ (ปีงบประมาณ {selectedYear})
            </h3>
            <p className="text-xs text-slate-500">
              เปรียบเทียบจำนวนเครื่องมือ 5 ข้อหลัก (แผน, ได้สอบเทียบ, ไม่ได้สอบเทียบ, ผ่าน, ไม่ผ่าน) โดยใช้สีแท่งกราฟที่แตกต่างกันชัดเจน
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            ปีงบประมาณ {selectedYear}
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
              />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cal-bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3 pt-3 border-t border-slate-100">
          {comparisonData.map((item) => (
            <div
              key={item.name}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-bold text-slate-700 truncate">{item.name}</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900">{item.count} เครื่อง</div>
              <div className="text-[10px] text-slate-500 font-medium">({item.percent}%)</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Line Chart Trend for Calibrated & Passed Count across Fiscal Years */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>2. แนวโน้มการได้รับการสอบเทียบและการผ่านเกณฑ์สะสม (ปีงบ 2565 - 2569)</span>
            </h3>
            <p className="text-xs text-slate-500">
              ติดตามพัฒนาการจำนวนเครื่องมือที่เข้าสอบเทียบและผ่านเกณฑ์มาตรฐานสะสมรายปี
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={allYearData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="fiscalYear" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="totalPlanned"
                name="แผนสอบเทียบ"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="calibratedCount"
                name="ได้สอบเทียบ"
                stroke="#0D9488"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="passedCount"
                name="สอบเทียบผ่าน"
                stroke="#10B981"
                strokeWidth={3}
                strokeDasharray="4 4"
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
