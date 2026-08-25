import React from 'react';
import {
  FileText,
  PlusCircle,
  Wrench,
  ShieldCheck,
  Award,
  Settings,
  Share2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { MainTab } from '../types';

interface NavbarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenSettings: () => void;
  onOpenEmbedModal: () => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
  lastSyncedAt?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenEmbedModal,
  onRefreshData,
  isRefreshing = false,
  lastSyncedAt,
}) => {
  const tabs: { id: MainTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'registry',
      label: '1. สรุปทะเบียนเครื่องมือ',
      icon: FileText,
    },
    {
      id: 'new_install',
      label: '2. ลงรับติดตั้งเครื่องใหม่',
      icon: PlusCircle,
    },
    {
      id: 'repairs',
      label: '3. เครื่องมือส่งซ่อม/ชำรุด',
      icon: Wrench,
    },
    {
      id: 'pm',
      label: '4. การเข้ามา PM บริษัท',
      icon: ShieldCheck,
    },
    {
      id: 'calibration',
      label: '5. ผลการสอบเทียบเครื่องมือ',
      icon: Award,
    },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-xl border-b border-slate-800 sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 font-bold text-xl">
            🔬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                DNRH Lab Instruments Dashboard
              </h1>
              <span className="bg-teal-500/20 text-teal-300 text-xs px-2.5 py-0.5 rounded-full border border-teal-500/30 font-medium">
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              กลุ่มงานเทคนิคการแพทย์ โรงพยาบาลเทพรัตน์นครราชสีมา
            </p>
          </div>
        </div>

        {/* Header Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {/* Refresh Button */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="รีเฟรชอัปเดตข้อมูลจาก Google Sheet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition duration-150 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            <span>{isRefreshing ? 'กำลังดึงข้อมูล...' : 'อัปเดตข้อมูลสด'}</span>
          </button>

          {/* Settings / Sync URLs */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition duration-150"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ตั้งค่าลิงก์ Google Sheets</span>
          </button>

          {/* Embed in Google Sites Button */}
          <button
            onClick={onOpenEmbedModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-medium border border-teal-500/30 transition duration-150"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-400" />
            <span>นำไปฝัง Google Sites</span>
          </button>
        </div>
      </div>

      {/* 5 Main Navigation Buttons Bar */}
      <div className="bg-slate-950/80 backdrop-blur border-t border-slate-800/80 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center overflow-x-auto no-scrollbar py-2 gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg shadow-teal-500/25 ring-2 ring-teal-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
