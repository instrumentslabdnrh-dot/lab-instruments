import React from 'react';
import { ExternalLink, Database } from 'lucide-react';

interface RawDataButtonProps {
  url: string;
  label?: string;
}

export const RawDataButton: React.FC<RawDataButtonProps> = ({
  url,
  label = 'ดูข้อมูลดิบใน Google Sheets (Raw Data)',
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-white text-xs sm:text-sm font-semibold shadow-md shadow-slate-900/10 border border-slate-700/60 transition duration-150 group"
    >
      <Database className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
      <span>{label}</span>
      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300 ml-1" />
    </a>
  );
};
