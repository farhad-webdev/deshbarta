import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronLeft,
  ChevronRight,
  Printer,
  Share2,
  Calendar,
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Scissors,
  FileText,
  Eye,
  Check,
  Globe,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { EPAPER_PAGES } from '../data/mockNews';
import { EPaperArticle, EPaperPage } from '../types';

interface EPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EPaperModal: React.FC<EPaperModalProps> = ({ isOpen, onClose }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedEdition, setSelectedEdition] = useState('ঢাকা সংস্করণ');
  const [selectedDate, setSelectedDate] = useState('১২ অক্টোবর ২০২৬');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'spread'>('single');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Interactive Article Clip Modal
  const [activeArticle, setActiveArticle] = useState<EPaperArticle | null>(null);
  const [articleFontSize, setArticleFontSize] = useState<number>(16);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [clippedMessage, setClippedMessage] = useState<string | null>(null);

  // Clip Mode State
  const [isClippingMode, setIsClippingMode] = useState(false);

  const EDITIONS = [
    { id: 'dhaka', name: 'ঢাকা সংস্করণ' },
    { id: 'chattogram', name: 'চট্টগ্রাম সংস্করণ' },
    { id: 'sylhet', name: 'সিলেট সংস্করণ' },
    { id: 'rajshahi', name: 'রাজশাহী সংস্করণ' },
    { id: 'intl', name: 'আন্তর্জাতিক সংস্করণ' }
  ];

  const ARCHIVE_DATES = [
    '১২ অক্টোবর ২০২৬ (আজ)',
    '১১ অক্টোবর ২০২৬ (গতকাল)',
    '১০ অক্টোবর ২০২৬',
    '০৯ অক্টোবর ২০২৬',
    '০৮ অক্টোবর ২০২৬',
    '০৭ অক্টোবর ২০২৬'
  ];

  // Reset states on modal open
  useEffect(() => {
    if (isOpen) {
      setCurrentPageIndex(0);
      setZoomLevel(1);
      setActiveArticle(null);
      setIsClippingMode(false);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeArticle) {
          setActiveArticle(null);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        setCurrentPageIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPageIndex((prev) => Math.min(EPAPER_PAGES.length - 1, prev + 1));
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(1.8, prev + 0.1));
      } else if (e.key === '-') {
        setZoomLevel((prev) => Math.max(0.7, prev - 0.1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeArticle, onClose]);

  if (!isOpen) return null;

  const currentPage = EPAPER_PAGES[currentPageIndex] || EPAPER_PAGES[0];
  const secondSpreadPage =
    viewMode === 'spread' && currentPageIndex < EPAPER_PAGES.length - 1
      ? EPAPER_PAGES[currentPageIndex + 1]
      : null;

  // Search results within current edition
  const searchResults = searchQuery.trim()
    ? EPAPER_PAGES.flatMap((page) =>
        (page.articles || [])
          .filter(
            (art) =>
              art.headline.includes(searchQuery) ||
              art.content.some((p) => p.includes(searchQuery))
          )
          .map((art) => ({ article: art, pageNumber: page.pageNumber }))
      )
    : [];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSpeakArticle = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleClipShare = (headline: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`দেশবার্তা ই-পেপার: ${headline} - https://deshbarta.com/epaper`);
      setClippedMessage('খবরের তথ্য ও লিংক কপি করা হয়েছে!');
      setTimeout(() => setClippedMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-950 rounded-none sm:rounded-2xl border border-slate-800 shadow-2xl w-full max-w-7xl h-full sm:h-[95vh] flex flex-col overflow-hidden text-white font-sans">
        
        {/* Top Professional Header Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0 select-none">
          
          {/* Logo & Edition Selection */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white p-1.5 rounded-lg shadow-sm">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <div>
                <h3 className="font-extrabold text-base sm:text-xl tracking-tight leading-none flex items-center gap-1.5 font-serif-bangla">
                  <span className="text-red-500">দেশবার্তা</span>
                  <span className="text-slate-100 font-normal text-xs sm:text-sm bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                    ডিজিটাল ই-পেপার
                  </span>
                </h3>
              </div>
            </div>

            {/* Edition Dropdown */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-red-400" />
              <select
                value={selectedEdition}
                onChange={(e) => setSelectedEdition(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {EDITIONS.map((ed) => (
                  <option key={ed.id} value={ed.name} className="bg-slate-900 text-white">
                    {ed.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker Selector */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {ARCHIVE_DATES.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ই-পেপারে খবর খুঁজুন..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-full pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation & Controls Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Page Jumper Selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentPageIndex === 0}
                className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded transition-colors text-slate-300 cursor-pointer"
                title="পূর্ববর্তী পাতা (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={currentPageIndex}
                onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                className="bg-transparent text-slate-100 font-bold px-1.5 py-1 focus:outline-none cursor-pointer text-xs sm:text-sm"
              >
                {EPAPER_PAGES.map((page, idx) => (
                  <option key={page.pageNumber} value={idx} className="bg-slate-900 text-white">
                    পৃষ্ঠা {page.pageNumber} — {page.categoryName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setCurrentPageIndex((prev) => Math.min(EPAPER_PAGES.length - 1, prev + 1))}
                disabled={currentPageIndex === EPAPER_PAGES.length - 1}
                className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded transition-colors text-slate-300 cursor-pointer"
                title="পরবর্তী পাতা (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden xl:flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2 py-1 rounded transition-colors font-medium cursor-pointer ${
                  viewMode === 'single' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="একক পাতা"
              >
                একক
              </button>
              <button
                type="button"
                onClick={() => setViewMode('spread')}
                className={`px-2 py-1 rounded transition-colors font-medium cursor-pointer ${
                  viewMode === 'spread' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="দুই পাতা এক সাথে"
              >
                ডাবল
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.7, prev - 0.1))}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-300 cursor-pointer"
                title="জুম কমান (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-1.5 text-[11px] font-bold text-slate-200 hover:text-white cursor-pointer"
                title="জুম ১০০%"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(1.8, prev + 0.1))}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-300 cursor-pointer"
                title="জুম বাড়ান (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clipping Tool Toggle */}
            <button
              type="button"
              onClick={() => setIsClippingMode(!isClippingMode)}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                isClippingMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="খবর ক্রপ ও ক্লিপিং মোড"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ক্লিপিং</span>
            </button>

            {/* Print / Download */}
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-slate-200"
              title="প্রিন্ট / পিডিএফ সেভ করুন"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>পিডিএফ</span>
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden lg:flex p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="পূর্ণ পর্দা"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 border border-slate-700 flex items-center justify-center transition-colors text-white cursor-pointer ml-1 shadow-md"
              title="ই-পেপার বন্ধ করুন (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Modal Overlay (if user typed search query) */}
        {searchQuery.trim() && (
          <div className="bg-slate-900 border-b border-amber-500/30 p-3 max-h-48 overflow-y-auto shrink-0 z-20">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex justify-between items-center text-xs text-amber-400 font-semibold">
                <span>অনুসন্ধান ফলাফল ({searchResults.length} টি খবর পাওয়া গেছে)</span>
                <span className="text-slate-400">খবরে ক্লিক করে সরাসরি বিস্তারিত পড়ুন</span>
              </div>
              {searchResults.length === 0 ? (
                <p className="text-xs text-slate-400 italic">কোনো খবর পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.map(({ article, pageNumber }) => (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => {
                        setCurrentPageIndex(pageNumber - 1);
                        setActiveArticle(article);
                      }}
                      className="text-left bg-slate-950 hover:bg-slate-800 p-2 rounded border border-slate-800 transition-colors flex items-start gap-2 group cursor-pointer"
                    >
                      <span className="bg-red-900/80 text-red-200 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">
                        পৃষ্ঠা {pageNumber}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-red-400 line-clamp-1">
                          {article.headline}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {article.content[0]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Newspaper BroadSheet Stage */}
        <div className="relative flex-1 overflow-auto p-2 sm:p-6 md:p-8 flex justify-center items-start bg-slate-950/80 custom-scrollbar select-none">
          
          {/* Floating Left Page Turn Button */}
          <button
            type="button"
            onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentPageIndex === 0}
            className="fixed left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-slate-900/90 hover:bg-red-600 text-white rounded-full border border-slate-700 shadow-2xl flex items-center justify-center transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            title="পূর্ববর্তী পাতা"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Floating Right Page Turn Button */}
          <button
            type="button"
            onClick={() => setCurrentPageIndex((prev) => Math.min(EPAPER_PAGES.length - 1, prev + 1))}
            disabled={currentPageIndex === EPAPER_PAGES.length - 1}
            className="fixed right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-slate-900/90 hover:bg-red-600 text-white rounded-full border border-slate-700 shadow-2xl flex items-center justify-center transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            title="পরবর্তী পাতা"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Interactive Broadsheet Container */}
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className={`transition-transform duration-200 ease-out flex gap-6 ${
              viewMode === 'spread' ? 'max-w-6xl' : 'max-w-3xl'
            } w-full`}
          >
            {/* Page 1 (Primary Selected Page) */}
            <RenderBroadsheetPage
              page={currentPage}
              isClippingMode={isClippingMode}
              onSelectArticle={(art) => setActiveArticle(art)}
              selectedEdition={selectedEdition}
            />

            {/* Page 2 (Spread View Second Page if active) */}
            {viewMode === 'spread' && secondSpreadPage && (
              <RenderBroadsheetPage
                page={secondSpreadPage}
                isClippingMode={isClippingMode}
                onSelectArticle={(art) => setActiveArticle(art)}
                selectedEdition={selectedEdition}
              />
            )}
          </div>
        </div>

        {/* Bottom Page Gallery & Thumbnail Strip */}
        <div className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 overflow-x-auto select-none">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-semibold hidden sm:inline flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-red-500" />
              <span>পাতা গ্যালারি:</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
            {EPAPER_PAGES.map((page, idx) => {
              const isActive = currentPageIndex === idx;
              return (
                <button
                  key={page.pageNumber}
                  type="button"
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-red-600 border-red-500 text-white font-bold shadow-md ring-2 ring-red-400/50'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className={`text-xs px-1.5 py-0.2 rounded font-extrabold ${isActive ? 'bg-white text-red-600' : 'bg-slate-800 text-slate-300'}`}>
                    {page.pageNumber}
                  </span>
                  <span className="text-xs tracking-tight whitespace-nowrap">
                    {page.categoryName}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 hidden lg:block shrink-0">
            দেশবার্তা সংস্করণ: <span className="text-white font-semibold">{selectedEdition}</span>
          </div>
        </div>
      </div>

      {/* Interactive Article Clip Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#fdfbf7] text-slate-900 rounded-2xl shadow-2xl border border-amber-200/80 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden font-serif-bangla animate-in zoom-in-95 duration-150">
            
            {/* Modal Header Bar */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-3 font-sans shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded">
                  {activeArticle.category}
                </span>
                <span className="text-slate-300 font-medium hidden sm:inline">
                  দেশবার্তা ই-পেপার ক্লিপিং রিডার
                </span>
              </div>

              {/* Reader Options */}
              <div className="flex items-center gap-2">
                
                {/* Audio Listen Speech */}
                <button
                  type="button"
                  onClick={() => handleSpeakArticle(`${activeArticle.headline}। ${activeArticle.content.join(' ')}`)}
                  className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    isSpeaking ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="সংবাদটি শুনুন"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isSpeaking ? 'থামান' : 'শুনুন'}</span>
                </button>

                {/* Font Size Adjust */}
                <div className="flex items-center bg-slate-800 rounded-md p-0.5 text-xs text-slate-200">
                  <button
                    type="button"
                    onClick={() => setArticleFontSize((prev) => Math.max(14, prev - 2))}
                    className="px-1.5 py-0.5 hover:bg-slate-700 rounded cursor-pointer"
                    title="লেখা ছোট করুন"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleFontSize((prev) => Math.min(24, prev + 2))}
                    className="px-1.5 py-0.5 hover:bg-slate-700 rounded cursor-pointer"
                    title="লেখা বড় করুন"
                  >
                    A+
                  </button>
                </div>

                {/* Share/Clip */}
                <button
                  type="button"
                  onClick={() => handleClipShare(activeArticle.headline)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer"
                  title="শেয়ার / লিংক কপি করুন"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Close modal */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveArticle(null);
                    if (isSpeaking) {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    }
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* NotificationToast for Clipped Link */}
            {clippedMessage && (
              <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-sans font-bold flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  {clippedMessage}
                </span>
                <button type="button" onClick={() => setClippedMessage(null)}>✕</button>
              </div>
            )}

            {/* Article Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4 leading-relaxed custom-scrollbar">
              
              {activeArticle.subTitle && (
                <span className="text-red-700 font-bold text-xs sm:text-sm tracking-wide block border-b border-red-200 pb-1 font-sans">
                  {activeArticle.subTitle}
                </span>
              )}

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                {activeArticle.headline}
              </h2>

              {activeArticle.author && (
                <div className="text-xs text-slate-600 font-sans font-semibold border-y border-amber-200/80 py-1.5 flex items-center justify-between">
                  <span>প্রতিবেদক: {activeArticle.author}</span>
                  <span>দেশবার্তা ই-পেপার বিশেষ কভারেজ</span>
                </div>
              )}

              {activeArticle.imageUrl && (
                <div className="my-3 rounded-lg overflow-hidden border border-amber-200/80 shadow-md">
                  <img
                    src={activeArticle.imageUrl}
                    alt={activeArticle.headline}
                    className="w-full h-64 object-cover"
                  />
                  {activeArticle.imageCaption && (
                    <div className="bg-amber-100/60 p-2 text-xs text-slate-700 font-sans italic border-t border-amber-200">
                      ফটোগ্রাফি: {activeArticle.imageCaption}
                    </div>
                  )}
                </div>
              )}

              <div
                style={{ fontSize: `${articleFontSize}px` }}
                className="text-slate-900 leading-relaxed space-y-4 font-serif-bangla text-justify"
              >
                {activeArticle.content.map((p, i) => (
                  <p key={i} className={i === 0 ? 'first-letter:text-4xl first-letter:font-extrabold first-letter:text-red-700 first-letter:mr-2 first-letter:float-left' : ''}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Footer actions inside clip reader */}
            <div className="bg-amber-100/60 px-5 py-3 border-t border-amber-200 flex items-center justify-between font-sans text-xs shrink-0">
              <span className="text-slate-600 font-medium">
                © দেশবার্তা ডিজিটাল ই-পেপার সংস্করণ
              </span>
              <button
                type="button"
                onClick={() => handleClipShare(activeArticle.headline)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>ক্লিপ হিসেবে সেভ ও শেয়ার</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component to Render Individual Newspaper Broadsheet Page
interface RenderBroadsheetPageProps {
  page: EPaperPage;
  isClippingMode: boolean;
  onSelectArticle: (article: EPaperArticle) => void;
  selectedEdition: string;
}

const RenderBroadsheetPage: React.FC<RenderBroadsheetPageProps> = ({
  page,
  isClippingMode,
  onSelectArticle,
  selectedEdition
}) => {
  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 rounded-md shadow-2xl p-4 sm:p-8 md:p-10 border border-amber-200/90 transition-all select-none relative font-serif-bangla">
      
      {/* Newspaper Broadsheet Top Masthead (On Page 1 or All Pages) */}
      <div className="border-b-4 border-slate-950 pb-3 mb-4 text-center">
        <div className="flex flex-wrap justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-700 border-b border-slate-400 pb-1.5 mb-2 font-sans">
          <span>বর্ষ ১১ • সংখ্যা ২৭৪ • রেজিস্টার্ড নং ডিএ-৭৬২</span>
          <span className="font-bold text-slate-900">{selectedEdition} • {page.date}</span>
          <span>মূল্য: ১২ টাকা</span>
        </div>

        {/* Brand Main Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 my-1 font-serif-bangla">
          দেশ<span className="relative inline-block">বা<span className="text-red-600">র্তা</span><span className="absolute -top-1 right-1 w-3 sm:w-4 h-3 sm:h-4 bg-red-600 rounded-full"></span></span>
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-widest font-sans">
          সত্য ও বস্তুনিষ্ঠ সংবাদের নির্ভীক জাতীয় দৈনিক
        </p>
      </div>

      {/* Page Header Banner Ribbon */}
      <div className="bg-slate-950 text-white px-4 py-1.5 text-xs sm:text-sm font-extrabold flex justify-between items-center mb-6 rounded-xs font-sans tracking-wide">
        <span className="flex items-center gap-2">
          <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[11px]">
            {page.categoryName}
          </span>
          <span>{page.title}</span>
        </span>
        <span className="text-amber-400">পৃষ্ঠা নং: {page.pageNumber}</span>
      </div>

      {/* Broadsheet Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Columns (2 Columns) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Render Articles passed in page */}
          {(page.articles || []).slice(0, 2).map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className={`group relative p-3 rounded border transition-all cursor-pointer ${
                isClippingMode
                  ? 'border-dashed border-amber-500 bg-amber-50/80 hover:bg-amber-100'
                  : 'border-transparent hover:border-red-500 hover:bg-amber-100/40'
              }`}
            >
              {/* Hover Badge */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-10 font-sans flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>পড়তে ক্লিক করুন</span>
              </div>

              {art.subTitle && (
                <span className="text-xs font-bold text-red-700 block mb-1">
                  • {art.subTitle}
                </span>
              )}

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-snug group-hover:text-red-700 transition-colors">
                {art.headline}
              </h2>

              {art.imageUrl && (
                <div className="my-3 rounded overflow-hidden border border-slate-300">
                  <img
                    src={art.imageUrl}
                    alt={art.headline}
                    className="w-full h-52 sm:h-60 object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {art.imageCaption && (
                    <div className="bg-slate-100 p-2 text-[11px] text-slate-600 italic font-sans border-t border-slate-200">
                      {art.imageCaption}
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 font-serif-bangla columns-1 sm:columns-2 gap-4 text-justify mt-2">
                {art.content.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}

          {/* Fallback if no articles array in page */}
          {(!page.articles || page.articles.length === 0) && (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                {page.leadHeadline}
              </h2>
              <div className="rounded overflow-hidden border border-slate-300">
                <img
                  src={page.previewUrl}
                  alt={page.leadHeadline}
                  className="w-full h-60 object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column (1 Column) */}
        <div className="border-t md:border-t-0 md:border-l border-slate-300 md:pl-5 space-y-5 font-sans">
          
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-red-700 border-b-2 border-red-600 pb-1.5 flex items-center justify-between">
            <span>এই পাতার বিশেষ সংবাদ</span>
            <span className="text-[10px] font-normal text-slate-500">দেশবার্তা বিশেষ</span>
          </h3>

          {/* Secondary Articles */}
          {(page.articles || []).slice(2).map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="group p-2.5 rounded border border-slate-200 bg-white/70 hover:border-red-500 hover:bg-amber-50/60 transition-all cursor-pointer space-y-1.5"
            >
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                {art.category}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-700 leading-snug font-serif-bangla">
                {art.headline}
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 font-serif-bangla">
                {art.content[0]}
              </p>
            </div>
          ))}

          {/* Sub headlines list */}
          {page.subHeadlines.map((head, idx) => (
            <div
              key={idx}
              onClick={() =>
                onSelectArticle({
                  id: `sub-${idx}`,
                  headline: head,
                  category: page.categoryName,
                  content: [
                    'দেশবার্তা বিশেষ প্রতিনিধির তথ্য অনুযায়ী মাঠপর্যায়ে অনুসন্ধান শেষে সংগৃহীত পূর্ণাঙ্গ প্রতিবেদন। বিস্তারিত সংবাদ আপডেট ই-পেপারে নিয়মিত প্রকাশিত হচ্ছে।'
                  ]
                })
              }
              className="pb-3 border-b border-slate-200 group cursor-pointer hover:bg-amber-50/50 p-1 rounded"
            >
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug group-hover:text-red-600 font-serif-bangla">
                • {head}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-serif-bangla">
                দেশবার্তা বিশেষ প্রতিবেদক দল কর্তৃক সংগৃহীত সরাসরি তথ্য ও বিশ্লেষণ।
              </p>
            </div>
          ))}

          {/* E-Paper Classified / Ad Box */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-lg text-center shadow-xs space-y-1.5">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block bg-amber-200/60 py-0.5 rounded">
              বিজ্ঞাপন ও বিশেষ নোটিশ
            </span>
            <p className="text-[11px] text-slate-800 font-medium leading-tight">
              দেশবার্তা ই-পেপার ও প্রিন্ট সংস্করণে ক্লাসিফায়েড বিজ্ঞাপন প্রচারের জন্য যোগাযোগ করুন:
            </p>
            <p className="text-xs font-bold text-red-700 font-mono">
              ইমেইল: ads@deshbarta.com • ফোন: ০১৭০০-০০০০০০
            </p>
          </div>
        </div>
      </div>

      {/* Broadsheet Bottom Footer */}
      <div className="border-t-2 border-slate-950 mt-8 pt-3 flex flex-wrap justify-between items-center text-[10px] text-slate-600 font-semibold font-sans gap-2">
        <span>মুদ্রণ ও প্রকাশনা: দেশবার্তা প্রেস, তেজগাঁও শিল্প এলাকা, ঢাকা-১২০৮</span>
        <span className="text-slate-900 font-bold">www.deshbarta.com</span>
        <span>ভারপ্রাপ্ত সম্পাদক: মো. রফিকুল হাসান</span>
      </div>
    </div>
  );
};
