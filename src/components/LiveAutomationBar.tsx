import React from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

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
}) => {
  const sources = [
    { id: 'all', name: 'সকল পোর্টাল', color: 'bg-slate-900 text-white' },
    { id: 'prothomalo', name: 'প্রথম আলো', url: 'https://www.prothomalo.com/', color: 'bg-[#0284c7] text-white' },
    { id: 'bbcbangla', name: 'বিবিসি বাংলা', url: 'https://www.bbc.com/bengali', color: 'bg-[#bb1919] text-white' },
    { id: 'kalbela', name: 'কালবেলা', url: 'https://www.kalbela.com/', color: 'bg-[#ea580c] text-white' },
    { id: 'kalerkantho', name: 'কালের কণ্ঠ', url: 'https://www.kalerkantho.com/', color: 'bg-[#dc2626] text-white' },
  ];

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Portal Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {sources.map((src) => {
            const isActive = selectedSource === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => onSelectSource(src.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  isActive
                    ? `${src.color} ring-2 ring-white/30 shadow-xs`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{src.name}</span>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-amber-300 transition-colors p-0.5"
                    title={`${src.name} অফিশিয়াল পোর্টাল ভিজিট করুন`}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Sync Status & Manual Refresh Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            {totalLiveCount > 0 && <span>{totalLiveCount}টি খবর সিঙ্কড</span>}
            {lastSyncTime && <span className="ml-1.5">({lastSyncTime})</span>}
          </div>

          <button
            type="button"
            onClick={onManualSync}
            disabled={isAutoSyncing}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-md transition-all shadow-xs cursor-pointer active:scale-95 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
            <span>{isAutoSyncing ? 'সিঙ্ক হচ্ছে...' : 'এখনই রিফ্রেশ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

