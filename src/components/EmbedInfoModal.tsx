import React, { useState } from 'react';
import { X, Copy, Check, Globe, Share2, Code } from 'lucide-react';

interface EmbedInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedInfoModal: React.FC<EmbedInfoModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);

  if (!isOpen) return null;

  const originUrl = window.location.origin;
  // Convert private dev URL (ais-dev-) to public shared URL (ais-pre-) for seamless iframe embedding in Google Sites
  const sharedUrl = originUrl.includes('ais-dev-')
    ? originUrl.replace('ais-dev-', 'ais-pre-')
    : originUrl;

  const publicIframeCode = `<iframe src="${sharedUrl}" width="100%" height="850" frameborder="0" allowfullscreen style="border-radius:16px; border:none; box-shadow:0 10px 25px rgba(0,0,0,0.1);"></iframe>`;

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyIframe = () => {
    navigator.clipboard.writeText(publicIframeCode);
    setCopiedIframe(true);
    setTimeout(() => setCopiedIframe(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">วิธีนำแดชบอร์ดไปฝังใน Google Sites</h3>
              <p className="text-xs text-slate-400">Embed this dashboard in Google Sites seamlessly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-slate-700 text-xs sm:text-sm">
          {/* Solution Alert for Red Icon / Refused Connection / Page Not Found Issue */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1.5">
            <div className="font-bold flex items-center gap-2 text-xs sm:text-sm text-teal-900">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping shrink-0" />
              <span>แนะนำวิธีฝังลง Google Sites ให้แสดงผลทันที 100%:</span>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              หากแทรกด้วยแท็บ "ใช้ URL" แล้วขึ้นสัญลักษณ์ 🚫 หรือ <em>"Page not found"</em> ให้สลับไปใช้แท็บ <strong className="bg-teal-200 px-1.5 py-0.5 rounded text-slate-900 font-bold">"ฝังโค้ด" (Embed Code)</strong> ใน Google Sites แล้ววางโค้ด HTML iframe ด้านล่าง จะแสดงผลได้ราบรื่นทันที!
            </p>
          </div>

          {/* Option 1: Recommended HTML Embed Code */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Code className="w-4 h-4 text-teal-600" />
                <span>วิธีที่ 1: ฝังด้วยโค้ด HTML iframe (แนะนำสูงสุดสำหรับ Google Sites)</span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full">
                แสดงผลได้ 100%
              </span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-xs pl-1">
              <li>กดปุ่ม <strong className="text-teal-700">"คัดลอกโค้ด HTML iframe"</strong> ด้านล่าง</li>
              <li>ในหน้า Google Sites เลือกเมนู <strong className="text-slate-800">"แทรก" (Insert) → "ฝัง" (Embed)</strong></li>
              <li>คลิกแท็บ <strong className="text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded font-bold">"ฝังโค้ด" (Embed Code)</strong></li>
              <li>วางโค้ด แล้วกด <strong className="text-slate-800">"ถัดไป" (Next)</strong> → กด <strong className="text-slate-800">"แทรก" (Insert)</strong></li>
            </ol>

            <div className="relative pt-1">
              <textarea
                readOnly
                rows={3}
                value={publicIframeCode}
                className="w-full p-3 bg-slate-900 text-teal-300 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none"
              />
              <button
                onClick={handleCopyIframe}
                className="absolute right-2.5 bottom-3.5 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-xs transition shadow-md"
              >
                {copiedIframe ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIframe ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ด HTML iframe'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Direct URL */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Globe className="w-4 h-4 text-slate-600" />
              <span>วิธีที่ 2: ฝังด้วย Public Shared URL (ใช้แท็บ "ใช้ URL")</span>
            </div>
            <p className="text-xs text-slate-600">
              ใช้ Public Shared URL ที่เปิดสิทธิ์การฝังภายนอก (<code className="font-mono text-teal-700 bg-teal-50 px-1 rounded">ais-pre-...</code>) เพื่อป้องกันอาการ Refused to connect
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={sharedUrl}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-none"
              />
              <button
                onClick={() => handleCopyUrl(sharedUrl)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0 transition"
              >
                {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl ? 'คัดลอกแล้ว!' : 'คัดลอก Public URL'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            ปิดหน้านี้
          </button>
        </div>
      </div>
    </div>
  );
};
