import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Clock, 
  Bookmark, 
  Newspaper, 
  Search, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  X,
  Calendar,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { BREAKING_TICKER_ITEMS } from '../data/mockNews';
import { useAuth } from '../context/AuthContext';
import { fetchLivePrayerTimes, computeWaqtState } from '../utils/prayerTimes';

interface HeaderProps {
  fontSizeScale: number;
  setFontSizeScale: (scale: number | ((prev: number) => number)) => void;
  savedArticlesCount: number;
  onOpenSavedDrawer: () => void;
  onOpenEPaper: () => void;
  onOpenWeather: () => void;
  onOpenPrayerTimes: () => void;
  onOpenAIAssistant: (initialPrompt?: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onGoHome: () => void;
  tickerItems?: string[];
}

export function toBengaliDigits(numStr: string | number): string {
  const map: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(numStr).replace(/[0-9]/g, (w) => map[w] || w);
}

function getLiveBengaliDateStr(): string {
  const now = new Date();
  try {
    const formatted = new Intl.DateTimeFormat('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now);
    return `${formatted} • ঢাকা, বাংলাদেশ`;
  } catch (e) {
    return 'ঢাকা, বাংলাদেশ';
  }
}

export const Header: React.FC<HeaderProps> = ({
  fontSizeScale,
  setFontSizeScale,
  savedArticlesCount,
  onOpenSavedDrawer,
  onOpenEPaper,
  onOpenWeather,
  onOpenPrayerTimes,
  onOpenAIAssistant,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onGoHome,
  tickerItems = BREAKING_TICKER_ITEMS,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  // Real-time live data state
  const [liveDateStr, setLiveDateStr] = useState<string>(getLiveBengaliDateStr());
  const [liveWeather, setLiveWeather] = useState<{ temp: string; condition: string }>({
    temp: '২৯° সে.',
    condition: 'রোদোজ্জ্বল'
  });
  const [livePrayer, setLivePrayer] = useState<{ waqtName: string; waqtTime: string }>({
    waqtName: 'আসর',
    waqtTime: '৪:০৫'
  });

  const activeTickerList = tickerItems.length > 0 ? tickerItems : BREAKING_TICKER_ITEMS;

  // Live Date ticker update
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDateStr(getLiveBengaliDateStr());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Live Weather fetch from Open-Meteo API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current_weather=true');
        if (res.ok) {
          const data = await res.json();
          const tempC = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;

          let cond = 'রোদোজ্জ্বল';
          if (code >= 1 && code <= 3) cond = 'আংশিক মেঘলা';
          else if (code >= 45 && code <= 48) cond = 'কুয়াশাচ্ছন্ন';
          else if (code >= 51 && code <= 67) cond = 'বৃষ্টিপাত';
          else if (code >= 80 && code <= 82) cond = 'গুড়ি গুড়ি বৃষ্টি';
          else if (code >= 95) cond = 'ঝড়ো আবহাওয়া';

          setLiveWeather({
            temp: `${toBengaliDigits(tempC)}° সে.`,
            condition: cond
          });
        }
      } catch {
        // Fallback default
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 300000); // refresh every 5 mins
    return () => clearInterval(weatherInterval);
  }, []);

  // Live Prayer Times fetch from Aladhan API or calculated fallback
  useEffect(() => {
    const fetchPrayer = async () => {
      try {
        const timings = await fetchLivePrayerTimes('Dhaka', 'dhaka');
        const waqtState = computeWaqtState(timings, new Date());
        setLivePrayer({
          waqtName: waqtState.currentBn,
          waqtTime: waqtState.currentTimeFormatted
        });
      } catch {
        // Quiet catch
      }
    };

    fetchPrayer();
    const prayerInterval = setInterval(fetchPrayer, 60000);
    return () => clearInterval(prayerInterval);
  }, []);

  // Auto-rotate breaking news ticker
  useEffect(() => {
    if (isTickerPaused) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % activeTickerList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isTickerPaused, activeTickerList.length]);

  const navCategories = [
    { id: 'all', label: 'সব খবর' },
    { id: 'top', label: 'শীর্ষ সংবাদ' },
    { id: 'politics', label: 'রাজনীতি' },
    { id: 'economy', label: 'অর্থনীতি' },
    { id: 'national', label: 'সারাদেশ' },
    { id: 'health', label: 'স্বাস্থ্য' },
    { id: 'crime', label: 'অপরাধ' },
    { id: 'international', label: 'আন্তর্জাতিক' },
    { id: 'sports', label: 'খেলাধুলা' },
    { id: 'technology', label: 'প্রযুক্তি' },
    { id: 'opinion', label: 'মতামত' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* 1. Top Utility Header Bar with REAL-TIME Live Data */}
      <div className="bg-[#f8fafc] border-b border-slate-200 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left items: Live Date, Live Weather, Live Prayer Waqt */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-6 py-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[12.5px] leading-normal tracking-wide">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{liveDateStr}</span>
            </div>

            <button
              onClick={onOpenWeather}
              type="button"
              className="flex items-center gap-1.5 font-semibold text-slate-800 text-[12.5px] leading-normal hover:text-amber-600 transition-colors cursor-pointer group"
              title="আবহাওয়ার বিস্তারিত দেখতে ক্লিক করুন"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-45 transition-transform shrink-0" />
              <span>{liveWeather.temp} {liveWeather.condition}</span>
            </button>

            <button
              onClick={onOpenPrayerTimes}
              type="button"
              className="flex items-center gap-1.5 font-semibold text-slate-800 text-[12.5px] leading-normal hover:text-blue-600 transition-colors cursor-pointer"
              title="আজকের পাঁচ ওয়াক্ত নামাজের সময়সূচি"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>নামাজের সময়: {livePrayer.waqtName} {livePrayer.waqtTime}</span>
            </button>
          </div>

          {/* Right items: Font Adjusters, Saved Articles, E-Paper, Auth */}
          <div className="flex items-center gap-2.5">
            {/* Font size zoom buttons */}
            <div className="flex items-center bg-white border border-slate-200 rounded px-1 py-0.5 text-[11px] font-semibold text-slate-600 shadow-xs">
              <button
                type="button"
                onClick={() => setFontSizeScale((prev) => Math.max(0.85, prev - 0.05))}
                className="px-1.5 py-0.5 hover:bg-slate-100 rounded transition-colors"
                title="ফন্ট সাইজ কমান"
              >
                অ-
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale(1)}
                className="px-1.5 py-0.5 hover:bg-slate-100 rounded transition-colors"
                title="স্বাভাবিক ফন্ট"
              >
                অ
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale((prev) => Math.min(1.25, prev + 0.05))}
                className="px-1.5 py-0.5 hover:bg-slate-100 rounded transition-colors"
                title="ফন্ট সাইজ বাড়ান"
              >
                অ+
              </button>
            </div>

            {/* Saved Articles */}
            <button
              type="button"
              onClick={onOpenSavedDrawer}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 transition-colors cursor-pointer"
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedArticlesCount > 0 ? 'fill-red-600 text-red-600' : 'text-slate-500'}`} />
              <span>সংরক্ষিত খবর ({savedArticlesCount})</span>
            </button>

            {/* E-Paper button */}
            <button
              type="button"
              onClick={onOpenEPaper}
              className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-2.5 py-0.5 rounded font-medium transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>ই-পেপার</span>
            </button>

            {/* User Auth Profile / Login Button */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-4 h-4 rounded-full" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className="font-semibold text-[11px] max-w-[80px] truncate">{user.displayName || 'পাঠক'}</span>
                <button
                  onClick={signOutUser}
                  title="লগআউট"
                  className="text-slate-400 hover:text-red-600 p-0.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-300 px-2 py-0.5 rounded font-semibold text-slate-700 transition-colors cursor-pointer text-[11.5px]"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>লগইন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Real-time Breaking News Ticker (জরুরি সংবাদ) */}
      <div 
        className="bg-[#fef2f2] border-b border-red-100 py-1.5 text-xs"
        onMouseEnter={() => setIsTickerPaused(true)}
        onMouseLeave={() => setIsTickerPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            {/* Red Badge */}
            <div className="flex items-center gap-1 bg-[#dc2626] text-white px-2.5 py-0.5 rounded-full font-bold shrink-0 text-[11px] shadow-xs">
              <span>জরুরি সংবাদ</span>
            </div>

            {/* Ticker Content */}
            <div className="flex-1 truncate font-medium text-slate-800">
              <span className="inline-block transition-opacity duration-300">
                {activeTickerList[tickerIndex] || activeTickerList[0]}
              </span>
            </div>
          </div>

          {/* Time & Controls */}
          <div className="flex items-center gap-2 shrink-0 text-slate-500 text-[11px]">
            <span className="hidden sm:inline">লাইভ ফিল্ড</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setTickerIndex((prev) => (prev - 1 + activeTickerList.length) % activeTickerList.length)}
                className="p-1 hover:bg-red-100 rounded text-slate-600"
                title="পূর্ববর্তী খবর"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTickerIndex((prev) => (prev + 1) % activeTickerList.length)}
                className="p-1 hover:bg-red-100 rounded text-slate-600"
                title="পরবর্তী খবর"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Brand Masthead & Search & AI Assistant */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={onGoHome}
          className="cursor-pointer group flex flex-col items-center md:items-start text-center md:text-left select-none"
        >
          <div className="flex items-center gap-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 group-hover:text-red-700 transition-colors">
              দেশ<span className="relative inline-block">বা<span className="text-red-600">র্তা</span><span className="absolute -top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></span></span>
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide mt-0.5">
            সত্য ও বস্তুনিষ্ঠ সংবাদের নির্ভীক প্রতীক
          </p>
        </div>

        {/* Search Bar & AI Button */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto justify-center md:justify-end">
          {/* Search Form */}
          <form 
            onSubmit={onSearchSubmit}
            className="relative flex items-center w-full sm:w-80 md:w-96"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সংবাদ খুঁজুন (যেমন: স্বাস্থ্য, রাজনীতি, অপরাধ)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-20 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Search className="w-3 h-3 text-slate-600" />
              <span>অনুসন্ধান</span>
            </button>
          </form>

          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={() => onOpenAIAssistant()}
            className="flex items-center gap-1.5 bg-linear-to-r from-[#991b1b] to-[#dc2626] hover:from-[#7f1d1d] hover:to-[#b91c1c] text-white px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 shrink-0 group cursor-pointer"
          >
            <span>এআই সংবাদ সহকারী</span>
          </button>
        </div>
      </div>

      {/* 4. Primary Category Navigation Bar */}
      <nav className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            {navCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#dc2626] text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
};
