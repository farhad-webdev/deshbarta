import React from 'react';
import { RefreshCw, ExternalLink, Radio, CheckCircle2 } from 'lucide-react';

interface LiveAutomationBarProps {
  isAutoSyncing: boolean;
  onManualSync: () => void;
  selectedSource: string;
  onSelectSource: (sourceId: string) => void;
  lastSyncTime?: string;
  totalLiveCount: number;
  isRealtimeEnabled?: boolean;
  onToggleRealtime?: () => void;
  countdownSeconds?: number;
  newArticlesCount?: number;
}

export const LiveAutomationBar: React.FC<LiveAutomationBarProps> = ({
  isAutoSyncing,
  onManualSync,
  selectedSource,
  onSelectSource,
  lastSyncTime,
  totalLiveCount,
  countdownSeconds,
}) => {
  const sources = [
    { id: 'all', name: 'সকল পোর্টাল', color: 'bg-red-600 text-white' },
    { id: 'prothomalo', name: 'প্রথম আলো', url: 'https://www.prothomalo.com/', color: 'bg-[#0284c7] text-white' },
    { id: 'bbcbangla', name: 'বিবিসি বাংলা', url: 'https://www.bbc.com/bengali', color: 'bg-[#bb1919] text-white' },
    { id: 'kalbela', name: 'কালবেলা', url: 'https://www.kalbela.com/', color: 'bg-[#ea580c] text-white' },
    { id: 'kalerkantho', name: 'কালের কণ্ঠ', url: 'https://www.kalerkantho.com/', color: 'bg-[#dc2626] text-white' },
  ];

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 relative shadow-sm">
      {/* 1. High-Tech Shimmering Top Progress Bar when Auto Syncing */}
      {isAutoSyncing && (
        <div className="w-full h-1 bg-slate-800 overflow-hidden relative">
          <div className="absolute inset-y-0 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 animate-pulse w-full shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Portal Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {sources.map((src) => {
            const isActive = selectedSource === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => onSelectSource(src.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? `${src.color} ring-2 ring-white/30 shadow-sm font-extrabold`
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{src.name}</span>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-amber-300 transition-colors p-0.5 text-slate-400 hover:text-amber-300"
                    title={`${src.name} অফিশিয়াল পোর্টাল ভিজিট করুন`}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Sync Status & Premium Preloader Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Article Count & Last Sync Badge */}
          <div className="text-[11px] text-slate-300 font-medium hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            {totalLiveCount > 0 && <span>{totalLiveCount}টি খবর সিঙ্কড</span>}
            {lastSyncTime && <span className="text-slate-400">({lastSyncTime})</span>}
            {typeof countdownSeconds === 'number' && (
              <span className="text-amber-400 font-bold border-l border-slate-700 pl-2">
                অটো রিফ্রেশ: {countdownSeconds}সে.
              </span>
            )}
          </div>

          {/* Premium Glowing Live Preloader vs Refresh Button */}
          {isAutoSyncing ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold px-3.5 py-1.5 rounded-lg shadow-md shadow-red-900/40 border border-red-400/50 text-xs animate-pulse">
              <div className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </div>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
              <span className="tracking-wide whitespace-nowrap">লাইভ খবর সিঙ্ক হচ্ছে...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onManualSync}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95 text-xs border border-red-500/40"
              title="নতুন সংবাদ আনতে রিফ্রেশ করুন"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
              <span>এখনই রিফ্রেশ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
