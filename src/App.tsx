import React, { useState, useEffect } from 'react';
import { MainTab, GlobalFilterState, SyncSettings } from './types';
import { getStoredSettings, saveStoredSettings } from './services/sheetSync';
import { Navbar } from './components/Navbar';
import { GlobalFiltersBar } from './components/GlobalFiltersBar';
import { TabRegistrySummary } from './components/TabRegistrySummary';
import { TabNewInstallations } from './components/TabNewInstallations';
import { TabRepairSummary } from './components/TabRepairSummary';
import { TabPMSummary } from './components/TabPMSummary';
import { TabCalibrationSummary } from './components/TabCalibrationSummary';
import { SettingsModal } from './components/SettingsModal';
import { EmbedInfoModal } from './components/EmbedInfoModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('registry');
  const [filters, setFilters] = useState<GlobalFilterState>({
    searchQuery: '',
    department: 'ทั้งหมด',
    category: 'ทั้งหมด',
    fiscalYear: 'ทั้งหมด',
    status: 'ทั้งหมด',
  });

  const [settings, setSettings] = useState<SyncSettings>(getStoredSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Real-time Auto-sync polling every 15 seconds + on window focus / visibility change
  useEffect(() => {
    if (!settings.autoSync) return;

    // Periodic polling every 15 seconds
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 15000);

    // Refresh immediately when user returns to the dashboard tab
    const handleFocus = () => {
      setRefreshKey((prev) => prev + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.autoSync]);

  const handleSaveSettings = (newSettings: SyncSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Global Interactive Filters Bar (Present on all pages) */}
        <GlobalFiltersBar filters={filters} onFilterChange={setFilters} />

        {/* Tab 1: สรุปทะเบียนเครื่องมือห้องปฏิบัติการ */}
        {activeTab === 'registry' && (
          <TabRegistrySummary filters={filters} settings={settings} refreshTrigger={refreshKey} />
        )}

        {/* Tab 2: แถบหลักลงรับติดตั้งเครื่องมือใหม่ */}
        {activeTab === 'new_install' && (
          <TabNewInstallations filters={filters} settings={settings} refreshTrigger={refreshKey} />
        )}

        {/* Tab 3: เครื่องมือส่งซ่อม/ชำรุด */}
        {activeTab === 'repairs' && (
          <TabRepairSummary filters={filters} settings={settings} refreshTrigger={refreshKey} />
        )}

        {/* Tab 4: การเข้ามา PM เครื่องมือของบริษัท */}
        {activeTab === 'pm' && (
          <TabPMSummary filters={filters} settings={settings} refreshTrigger={refreshKey} />
        )}

        {/* Tab 5: ผลการสอบเทียบเครื่องมือ */}
        {activeTab === 'calibration' && (
          <TabCalibrationSummary filters={filters} settings={settings} refreshTrigger={refreshKey} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-200">
              DNRH Laboratory Equipment Management System & Dashboard
            </p>
            <p className="text-[11px] text-slate-500">
              กลุ่มงานเทคนิคการแพทย์และธนาคารเลือด โรงพยาบาลเทพรัตน์นครราชสีมา (DNRH)
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsEmbedModalOpen(true)}
              className="text-teal-400 hover:underline"
            >
              ฝังใน Google Sites
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-indigo-400 hover:underline"
            >
              การตั้งค่าลิงก์ Google Sheets
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <EmbedInfoModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
      />
    </div>
  );
}
