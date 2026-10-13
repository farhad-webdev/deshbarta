import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  BD_CITIES,
  fetchLivePrayerTimes,
  getFallbackPrayerTimings,
  computeWaqtState,
  PrayerTime
} from '../utils/prayerTimes';

interface PrayerTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({ isOpen, onClose }) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('dhaka');
  const [timings, setTimings] = useState<Record<string, string>>(() =>
    getFallbackPrayerTimings(new Date(), 'dhaka')
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());

  const currentCityObj = BD_CITIES.find((c) => c.id === selectedCityId) || BD_CITIES[0];

  // Load live prayer times when modal opens or city changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadTimes = async () => {
      setIsLoading(true);
      const data = await fetchLivePrayerTimes(currentCityObj.nameEng, currentCityObj.id);
      if (isMounted) {
        setTimings(data);
        setIsLoading(false);
        setIsLiveSynced(true);
      }
    };

    loadTimes();

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedCityId, currentCityObj.nameEng, currentCityObj.id]);

  // Real-time second tick timer for live Waqt and countdown update
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const waqtState = computeWaqtState(timings, now);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    const data = await fetchLivePrayerTimes(currentCityObj.nameEng, currentCityObj.id);
    setTimings(data);
    setIsLoading(false);
    setIsLiveSynced(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800/80 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>নামাজের সময়সূচি</span>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-medium">
                  লাইভ
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                ইসলামিক ফাউন্ডেশন বাংলাদেশ • রিয়েল-টাইম সময়
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-800 flex items-center justify-center text-emerald-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* City Selector Bar */}
        <div className="bg-slate-50 text-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>জেলা/এলাকা:</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded border border-slate-300 focus:outline-hidden cursor-pointer"
            >
              {BD_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameBn} ({c.nameEng})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isLoading}
              title="রিফ্রেশ করুন"
              className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Current Waqt Highlight Container */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>বর্তমান ওয়াক্ত</span>
          </div>

          <div className="text-2xl font-black text-slate-900 tracking-tight py-0.5">
            {waqtState.currentBn} — <span className="text-emerald-700">{waqtState.currentTimeFormatted}</span>
          </div>

          <div className="text-xs font-medium text-slate-600 bg-white py-1 px-3 rounded border border-slate-200 inline-block">
            পরবর্তী ওয়াক্ত: <strong className="text-slate-800">{waqtState.nextBn}</strong> ({waqtState.nextTimeFormatted})
            <span className="text-red-600 ml-1.5 font-bold">• বাকি: {waqtState.remText}</span>
          </div>
        </div>

        {/* 5 Prayers Live List */}
        <div className="p-3 divide-y divide-slate-100 overflow-y-auto max-h-[300px]">
          {waqtState.list.map((waqt: PrayerTime) => (
            <div
              key={waqt.id}
              className={`py-2.5 px-3 rounded-lg flex items-center justify-between transition-colors ${
                waqt.isCurrent
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    waqt.isCurrent ? 'bg-white' : 'bg-slate-300'
                  }`}
                />
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${waqt.isCurrent ? 'font-bold text-white' : 'font-medium text-slate-900'}`}>
                    {waqt.bengaliName}
                  </span>
                  {waqt.isCurrent && (
                    <span className="text-[10px] bg-emerald-800 text-emerald-100 px-1.5 py-0.5 rounded">
                      চলমান
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm ${waqt.isCurrent ? 'font-bold text-white' : 'font-bold text-slate-800'}`}>
                  {waqt.timeFormatted}
                </span>
                {waqt.isCurrent && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>* ভৌগোলিক দূরত্বের কারণে অঞ্চলভেদে ১–৭ মিনিট তারতম্য হতে পারে।</span>
          {isLiveSynced && (
            <span className="text-emerald-700 font-medium shrink-0">
              লাইভ ডেটা সিঙ্কড
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
