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
import { PlusCircle, Calendar, ShoppingBag, Truck, Gift, TrendingUp, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RawDataButton } from './RawDataButton';
import {
  FALLBACK_NEW_INSTALLATIONS,
  NEW_INSTALL_YEARLY_TREND,
  RAW_SHEET_URLS,
} from '../data/fallbackData';
import { GlobalFilterState, SyncSettings } from '../types';
import { fetchCsvText, parseNewInstallCsvText } from '../services/sheetSync';

interface TabNewInstallationsProps {
  filters: GlobalFilterState;
  settings?: SyncSettings;
  refreshTrigger?: number;
}

export const TabNewInstallations: React.FC<TabNewInstallationsProps> = ({ filters, settings, refreshTrigger }) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [liveDataMap, setLiveDataMap] = useState<{ [year: string]: any }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const baseSheetUrl = settings?.sheetConfigs?.[0]?.newInstallUrl || RAW_SHEET_URLS.newInstall;

    if (baseSheetUrl && baseSheetUrl.trim()) {
      setIsLoading(true);
      const allYears = ['2565', '2566', '2567', '2568', '2569'];

      Promise.all(
        allYears.map(async (yr) => {
          // Fetch specific tab for that fiscal year (e.g. 'ปีงบ2565', 'ปีงบ2568')
          const text = await fetchCsvText(baseSheetUrl, `ปีงบ${yr}`);
          if (text) {
            const parsed = parseNewInstallCsvText(text, parseInt(yr, 10));
            return { yr, data: parsed };
          }
          return { yr, data: null };
        })
      ).then((results) => {
        if (!isMounted) return;
        const newMap: { [yr: string]: any } = {};
        let anySuccess = false;
        let totalAllCount = 0;
        const allCats: { [k: string]: number } = {};
        const allAcqs: { [k: string]: number } = {};
        const allDepts: { [k: string]: number } = {};
        const allItems: any[] = [];
        const dynamicTrend: { fiscalYear: string; count: number }[] = [];

        results.forEach((res) => {
          if (res.data) {
            newMap[res.yr] = res.data;
            anySuccess = true;
            totalAllCount += res.data.totalCount || 0;
            dynamicTrend.push({ fiscalYear: res.yr, count: res.data.totalCount || 0 });

            if (Array.isArray(res.data.byCategory)) {
              res.data.byCategory.forEach((c: any) => {
                allCats[c.name] = (allCats[c.name] || 0) + (c.count || 0);
              });
            }
            if (Array.isArray(res.data.byAcquisition)) {
              res.data.byAcquisition.forEach((a: any) => {
                allAcqs[a.name] = (allAcqs[a.name] || 0) + (a.count || 0);
              });
            }
            if (Array.isArray(res.data.byDepartment)) {
              res.data.byDepartment.forEach((d: any) => {
                allDepts[d.name] = (allDepts[d.name] || 0) + (d.count || 0);
              });
            }
            if (Array.isArray(res.data.items)) {
              res.data.items.forEach((it: any) => {
                allItems.push({ ...it, fiscalYear: res.yr });
              });
            }
          }
        });

        if (anySuccess) {
          newMap['all'] = {
            fiscalYear: 0,
            totalCount: totalAllCount,
            byCategory: Object.keys(allCats).map((k) => ({ name: k, count: allCats[k] })),
            byAcquisition: Object.keys(allAcqs).map((k) => ({ name: k, count: allAcqs[k] })),
            byDepartment: Object.keys(allDepts).map((k) => ({ name: k, count: allDepts[k] })),
            items: allItems,
            dynamicTrend,
          };
          setLiveDataMap(newMap);
          setIsLive(true);
        } else {
          setIsLive(false);
        }
        setIsLoading(false);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [settings, refreshTrigger]);

  const dataKey = selectedYear === 'all' ? 'all' : selectedYear;
  const installData =
    liveDataMap[dataKey] ||
    FALLBACK_NEW_INSTALLATIONS[dataKey] ||
    FALLBACK_NEW_INSTALLATIONS['all'];

  const trendData =
    liveDataMap['all']?.dynamicTrend?.length > 0
      ? liveDataMap['all'].dynamicTrend
      : NEW_INSTALL_YEARLY_TREND;

  const CATEGORY_COLORS = ['#2563EB', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4'];
  const ACQUISITION_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

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

  const purchaseCount = installData.byAcquisition?.find((x: any) => x.name.includes('สั่งซื้อ'))?.count || 0;
  const placementCount =
    (installData.byAcquisition?.find((x: any) => x.name.includes('วางเครื่อง'))?.count || 0) +
    (installData.byAcquisition?.find((x: any) => x.name.includes('ซื้อน้ำยา'))?.count || 0);
  const supportCount = installData.byAcquisition?.find((x: any) => x.name.includes('สนับสนุน') || x.name.includes('บริจาค'))?.count || 0;

  const filteredItems = (installData.items || []).filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.model && item.model.toLowerCase().includes(q)) ||
      (item.vendor && item.vendor.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.acquisition && item.acquisition.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Raw Data Link */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-teal-600" />
              <span>ปุ่มที่ 2: ทะเบียนลงรับและติดตั้งเครื่องมือใหม่ (QF-MT-02-41)</span>
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
            สรุปการลงรับเครื่องมือใหม่แยกรายปีงบประมาณ วิธีการได้มา และแนวโน้มการจัดหาเครื่องมือ
          </p>
        </div>

        {/* ปุ่มลิ้งไปยังข้อมูลดิบ */}
        <RawDataButton url={RAW_SHEET_URLS.newInstall} label="เปิดดูข้อมูลดิบ Google Sheets" />
      </div>

      {/* Year Selector Bar & Main Stats */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span className="font-bold text-slate-800 text-sm">
            เลือกปีงบประมาณสำหรับการดูข้อมูล:
          </span>
        </div>

        {/* Year Selector Dropdown & Quick Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {['all', '2565', '2566', '2567', '2568', '2569'].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 ${
                selectedYear === yr
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {yr === 'all' ? 'รวมทุกปีงบประมาณ' : `ปีงบ ${yr}`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="ยอดลงรับติดตั้งรวม"
          value={`${installData.totalCount}`}
          subtitle={selectedYear === 'all' ? 'รวมทุกปีงบประมาณ' : `ประจำปีงบประมาณ ${selectedYear}`}
          icon={<PlusCircle className="w-6 h-6" />}
          colorScheme="teal"
          badgeText={selectedYear === 'all' ? '2565-2569' : `ปีงบ ${selectedYear}`}
        />
        <MetricCard
          title="จัดหาโดยการสั่งซื้อ"
          value={purchaseCount}
          subtitle="การงบประมาณสั่งซื้อของ รพ."
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          colorScheme="blue"
        />
        <MetricCard
          title="จัดหาแบบวางเครื่อง/น้ำยา"
          value={placementCount}
          subtitle="สัญญาบริการวางเครื่อง/ซื้อน้ำยา"
          icon={<Truck className="w-6 h-6 text-amber-600" />}
          colorScheme="amber"
        />
        <MetricCard
          title="จัดหาโดยการสนับสนุน"
          value={supportCount}
          subtitle="เงินบริจาค / โครงการสนับสนุน"
          icon={<Gift className="w-6 h-6 text-emerald-600" />}
          colorScheme="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: สัดส่วนแยกตามประเภท (คอลัมน์ C) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                1. สัดส่วนเครื่องมือลงรับใหม่ แยกตามประเภท (คอลัมน์ C)
              </h3>
              <p className="text-xs text-slate-500">
                {selectedYear === 'all'
                  ? 'ข้อมูลรวมทุกปีงบประมาณ'
                  : `เฉพาะปีงบประมาณ ${selectedYear}`}
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={installData.byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {installData.byCategory?.map((entry: any, index: number) => (
                      <Cell
                        key={`cat-cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: สัดส่วนแยกตามการได้มา (คอลัมน์ D) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                2. สัดส่วนแยกตามวิธีการได้มา (คอลัมน์ D)
              </h3>
              <p className="text-xs text-slate-500">
                สั่งซื้อ, วางเครื่อง, ซื้อน้ำยา, สนับสนุน
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={installData.byAcquisition} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {installData.byAcquisition?.map((entry: any, index: number) => (
                      <Cell
                        key={`acq-cell-${index}`}
                        fill={ACQUISITION_COLORS[index % ACQUISITION_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 3: แนวโน้มสรุปจำนวนเครื่องมือที่ลงรับใหม่แต่ละปีงบประมาณ (Line Chart) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <span>3. แนวโน้มจำนวนเครื่องมือที่ลงรับใหม่แยกตามปีงบประมาณ (พ.ศ. 2565 - 2569)</span>
            </h3>
            <p className="text-xs text-slate-500">
              สรุปผลรวมจำนวนจากคอลัมน์ H แสดงเป็นแผนภูมิกราฟเส้นเพื่อติดตามแนวโน้มจัดหา
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="fiscalYear" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="จำนวนเครื่องมือลงรับใหม่"
                stroke="#2563EB"
                strokeWidth={3.5}
                dot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 9, fill: '#0D9488' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Item Table Section */}
      {filteredItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                รายการเครื่องมือที่ลงรับและติดตั้ง ({filteredItems.length} รายการ)
              </h3>
              <p className="text-xs text-slate-500">
                ข้อมูลทะเบียนเครื่องมือจริงจาก Google Sheets {selectedYear === 'all' ? 'รวมทุกปีงบ' : `ปีงบ ${selectedYear}`}
              </p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารายการ, รุ่น, บริษัท..."
                className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4">ลำดับ</th>
                  <th className="py-3 px-4">วันที่ลงรับ</th>
                  <th className="py-3 px-4">ชื่อเครื่องมือ</th>
                  <th className="py-3 px-4">ประเภท</th>
                  <th className="py-3 px-4">การได้มา</th>
                  <th className="py-3 px-4">จำนวน</th>
                  <th className="py-3 px-4">บริษัท/ผู้จัดจำหน่าย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.slice(0, 100).map((it: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{it.seq || idx + 1}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap">{it.date || '-'}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      <div>{it.name}</div>
                      {it.model && <div className="text-[11px] text-slate-400">รุ่น: {it.model}</div>}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {it.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                        {it.acquisition}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{it.quantity || 1}</td>
                    <td className="py-2.5 px-4 text-slate-500">{it.vendor || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
