import React, { useState } from 'react';
import { X, Plus, Save, RotateCcw, Link as LinkIcon, Info, Check } from 'lucide-react';
import { SyncSettings, SheetConfig } from '../types';
import { INITIAL_SHEET_CONFIGS } from '../data/fallbackData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SyncSettings;
  onSaveSettings: (newSettings: SyncSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [configs, setConfigs] = useState<SheetConfig[]>(settings.sheetConfigs);
  const [newYearInput, setNewYearInput] = useState<string>('2570');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUrlChange = (
    index: number,
    field: keyof Omit<SheetConfig, 'fiscalYear'>,
    value: string
  ) => {
    const updated = [...configs];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setConfigs(updated);
  };

  const handleAddNewYear = () => {
    const yr = parseInt(newYearInput, 10);
    if (!yr || isNaN(yr)) return;

    if (configs.some((c) => c.fiscalYear === yr)) {
      alert(`ปีงบประมาณ ${yr} มีอยู่ในรายการเรียบร้อยแล้ว`);
      return;
    }

    const newConfig: SheetConfig = {
      fiscalYear: yr,
      registryUrl: '',
      newInstallUrl: '',
      repairUrl: '',
      pmUrl: '',
      calibrationUrl: '',
    };

    setConfigs([...configs, newConfig].sort((a, b) => a.fiscalYear - b.fiscalYear));
    setNewYearInput(String(yr + 1));
  };

  const handleRemoveYear = (yr: number) => {
    if (confirm(`คุณต้องการลบตั้งค่าปีงบประมาณ ${yr} หรือไม่?`)) {
      setConfigs(configs.filter((c) => c.fiscalYear !== yr));
    }
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      sheetConfigs: configs,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    if (confirm('ต้องการล้างค่าและรีเซ็ตลิงก์กลับเป็นค่าเริ่มต้นมาตรฐานใช่หรือไม่?')) {
      setConfigs(INITIAL_SHEET_CONFIGS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">ตั้งค่าเชื่อมโยงข้อมูล Google Sheets สด (Sync Settings)</h3>
              <p className="text-xs text-slate-400">
                เพิ่ม/แก้ไขลิงก์ CSV สำหรับแต่ละหัวข้อในแต่ละปีงบประมาณ และเพิ่มปีงบใหม่ได้ตามต้องการ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">💡 วิธีนำลิงก์จาก Google Sheets มาใส่:</span>
              <p className="leading-relaxed">
                คุณสามารถนำลิงก์ Google Sheets ปกติ (เช่น <code className="bg-teal-100 px-1 py-0.5 rounded font-mono">https://docs.google.com/spreadsheets/d/.../edit?gid=...</code>) หรือลิงก์ส่งออก CSV มาวางในช่องด้านล่างได้ทันที ระบบจะแปลงเป็นจุดดึงข้อมูลสด (.csv) อัตโนมัติ หากช่องใดว่างอยู่ระบบจะใช้ฐานข้อมูลประวัติจริงของปีนั้นๆ เพื่อไม่ให้แดชบอร์ดว่างเปล่า
              </p>
            </div>
          </div>

          {/* Add New Fiscal Year Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">เพิ่มปีงบประมาณใหม่:</span>
              <input
                type="number"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                placeholder="เช่น 2570"
                className="w-28 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={handleAddNewYear}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มช่องตั้งค่าปีงบ {newYearInput}</span>
            </button>
          </div>

          {/* List of Sheet Configs per Fiscal Year */}
          <div className="space-y-5">
            {configs.map((config, index) => (
              <div
                key={config.fiscalYear}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-sm font-extrabold text-teal-700 flex items-center gap-2">
                    📅 ตั้งค่าลิงก์ประจำปีงบประมาณ {config.fiscalYear}
                  </span>
                  <button
                    onClick={() => handleRemoveYear(config.fiscalYear)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition"
                  >
                    ลบปีงบนี้
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* 1. ทะเบียนติดตั้งเครื่องใหม่ */}
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      1. ทะเบียนติดตั้งเครื่องใหม่ QF-MT-02-41 (ปีงบ {config.fiscalYear})
                    </label>
                    <input
                      type="text"
                      value={config.newInstallUrl || ''}
                      onChange={(e) => handleUrlChange(index, 'newInstallUrl', e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit?gid=..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* 2. สรุปงานซ่อมเครื่องมือ */}
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      2. สรุปงานซ่อมเครื่องมือ (ปีงบ {config.fiscalYear})
                    </label>
                    <input
                      type="text"
                      value={config.repairUrl || ''}
                      onChange={(e) => handleUrlChange(index, 'repairUrl', e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit?gid=..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* 3. สรุปการเข้ามา PM ของบริษัท */}
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      3. สรุปการเข้ามา PM ของบริษัท (ปีงบ {config.fiscalYear})
                    </label>
                    <input
                      type="text"
                      value={config.pmUrl || ''}
                      onChange={(e) => handleUrlChange(index, 'pmUrl', e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit?gid=..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* 4. ผลการสอบเทียบเครื่องมือ */}
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      4. แบบบันทึกสอบเทียบ QF-MT-02-25-01 (ปีงบ {config.fiscalYear})
                    </label>
                    <input
                      type="text"
                      value={config.calibrationUrl || ''}
                      onChange={(e) => handleUrlChange(index, 'calibrationUrl', e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit?gid=..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตกลับเป็นค่าเริ่มต้น</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition duration-200 ${
                savedSuccess
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกเรียบร้อยแล้ว!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-teal-400" />
                  <span>บันทึกการตั้งค่าลิงก์</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
