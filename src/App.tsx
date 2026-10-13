import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveAutomationBar } from './components/LiveAutomationBar';
import { LeadHero } from './components/LeadHero';
import { TrendingSidebar } from './components/TrendingSidebar';
import { NewsGrid } from './components/NewsGrid';
import { RightSidebar } from './components/RightSidebar';
import { Footer } from './components/Footer';
import { ArticleDetailView } from './components/ArticleDetailView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { EPaperModal } from './components/EPaperModal';
import { AudioBulletinPlayer } from './components/AudioBulletinPlayer';
import { SavedArticlesDrawer } from './components/SavedArticlesDrawer';
import { WeatherModal } from './components/WeatherModal';
import { PrayerTimesModal } from './components/PrayerTimesModal';
import { INITIAL_ARTICLES, INITIAL_POLL, INITIAL_COMMENTS } from './data/mockNews';
import { Article, Poll, Comment } from './types';
import { cleanText } from './utils/textUtils';
import { fetchClientLiveNews } from './utils/clientRss';

const sanitizeArticle = (a: Article): Article => ({
  ...a,
  title: cleanText(a.title),
  excerpt: cleanText(a.excerpt),
  content: Array.isArray(a.content)
    ? a.content.map(cleanText).filter(Boolean)
    : [cleanText((a.content as any) || '')].filter(Boolean),
  author: cleanText(a.author || ''),
  category: cleanText(a.category || ''),
});

export default function App() {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [fontSizeScale, setFontSizeScale] = useState<number>(1);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [poll, setPoll] = useState<Poll>(INITIAL_POLL);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Automation Feed state (Prothom Alo, BBC Bangla, Kalbela, Kaler Kantho)
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [liveCount, setLiveCount] = useState<number>(0);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState<boolean>(true);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(20);
  const [newArticlesCount, setNewArticlesCount] = useState<number>(0);

  // Modals & Drawers state
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isEPaperOpen, setIsEPaperOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isPrayerOpen, setIsPrayerOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>();
  const [isPlayingAudioBulletin, setIsPlayingAudioBulletin] = useState(false);

  // Load live news with server endpoint + client-side RSS fallback for Vercel/Static hosting
  const fetchLiveNews = async (isBackgroundAuto = false) => {
    if (!isBackgroundAuto) setIsAutoSyncing(true);
    let fetchedList: Article[] = [];
    let syncTimeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    try {
      const forceParam = isBackgroundAuto ? '' : '&force=true';
      const res = await fetch(`/api/news/live?t=${Date.now()}${forceParam}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          fetchedList = data.articles.map(sanitizeArticle);
          if (data.syncTime) syncTimeStr = data.syncTime;
        }
      }
    } catch (err) {
      console.warn('Server API fetch failed/timed out, attempting client RSS fallback:', err);
    }

    // Client-side fallback if server fetch yielded no articles (e.g. Vercel static deployment)
    if (fetchedList.length === 0) {
      const clientArticles = await fetchClientLiveNews();
      if (clientArticles.length > 0) {
        fetchedList = clientArticles.map(sanitizeArticle);
      }
    }

    if (fetchedList.length > 0) {
      setArticles(fetchedList);
      setLiveCount(fetchedList.length);
      setLastSyncTime(syncTimeStr);
    }

    setIsAutoSyncing(false);
  };

  const handleManualSync = async () => {
    setIsAutoSyncing(true);
    let fetchedList: Article[] = [];
    let syncTimeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    try {
      const res = await fetch(`/api/news/sync?t=${Date.now()}&force=true`, {
        method: 'POST',
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          fetchedList = data.articles.map(sanitizeArticle);
          if (data.syncTime) syncTimeStr = data.syncTime;
        }
      }
    } catch (err) {
      console.warn('Server sync failed, falling back to client RSS fetch:', err);
    }

    if (fetchedList.length === 0) {
      const clientArticles = await fetchClientLiveNews();
      if (clientArticles.length > 0) {
        fetchedList = clientArticles.map(sanitizeArticle);
      }
    }

    if (fetchedList.length > 0) {
      setArticles(fetchedList);
      setLiveCount(fetchedList.length);
      setLastSyncTime(syncTimeStr);
    }

    setIsAutoSyncing(false);
    setCountdownSeconds(20);
  };

  // Initial live news load
  useEffect(() => {
    fetchLiveNews(false);
  }, []);

  // Real-time automatic polling timer (every second countdown, auto-refreshes at 0)
  useEffect(() => {
    if (!isRealtimeEnabled) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          fetchLiveNews(true);
          return 20; // reset to 20s
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRealtimeEnabled]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deshbarta_saved_articles');
      if (stored) {
        setSavedArticleIds(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save bookmarks to localStorage
  const handleToggleSave = (article: Article) => {
    setSavedArticleIds((prev) => {
      let updated: string[];
      if (prev.includes(article.id)) {
        updated = prev.filter((id) => id !== article.id);
      } else {
        updated = [...prev, article.id];
      }
      try {
        localStorage.setItem('deshbarta_saved_articles', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleRemoveSaved = (articleId: string) => {
    setSavedArticleIds((prev) => {
      const updated = prev.filter((id) => id !== articleId);
      try {
        localStorage.setItem('deshbarta_saved_articles', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleClearAllSaved = () => {
    setSavedArticleIds([]);
    try {
      localStorage.removeItem('deshbarta_saved_articles');
    } catch (e) {
      // ignore
    }
  };

  // Poll voting
  const handleVotePoll = (optionId: string) => {
    setPoll((prev) => {
      const total = prev.totalVotes + 1;
      const updatedOptions = prev.options.map((opt) => {
        const isTarget = opt.id === optionId;
        const newVotes = isTarget ? opt.votes + 1 : opt.votes;
        const newPct = Math.round((newVotes / total) * 100);
        return {
          ...opt,
          votes: newVotes,
          percentage: newPct,
        };
      });

      return {
        ...prev,
        options: updatedOptions,
        totalVotes: total,
        userVotedOptionId: optionId,
      };
    });
  };

  // Comments
  const handleAddComment = (articleId: string, author: string, content: string) => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      articleId,
      author,
      content,
      timeAgo: 'এইমাত্র',
      likes: 1,
      userLiked: true,
    };
    setComments((prev) => [newComment, ...prev]);
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const liked = !c.userLiked;
          return {
            ...c,
            likes: liked ? c.likes + 1 : Math.max(0, c.likes - 1),
            userLiked: liked,
          };
        }
        return c;
      })
    );
  };

  // AI Assistant trigger
  const handleOpenAIAssistant = (initialPrompt?: string) => {
    setAiInitialPrompt(initialPrompt);
    setIsAIAssistantOpen(true);
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedArticle(null);
    setActiveCategory('all');
  };

  const getCategoryBengaliLabel = (cat: string) => {
    const map: Record<string, string> = {
      top: 'শীর্ষ সংবাদ',
      politics: 'রাজনীতি',
      economy: 'অর্থনীতি',
      national: 'সারাদেশ',
      health: 'স্বাস্থ্য',
      crime: 'অপরাধ',
      international: 'আন্তর্জাতিক',
      sports: 'খেলাধুলা',
      technology: 'প্রযুক্তি',
      opinion: 'মতামত',
    };
    return map[cat] || cat;
  };

  // Filter articles based on active category, source portal & search query
  const getFilteredArticles = () => {
    const filtered = articles.filter((art) => {
      // Source Portal Filter (prothomalo, bbcbangla, kalbela, kalerkantho)
      if (selectedSource !== 'all') {
        const matchesSource = 
          art.id.includes(selectedSource) ||
          art.publisherName?.toLowerCase().includes(selectedSource.toLowerCase()) ||
          art.publisherBengali?.toLowerCase().includes(selectedSource.toLowerCase()) ||
          art.tags?.some(t => t.toLowerCase().includes(selectedSource.toLowerCase()));
        if (!matchesSource) return false;
      }

      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'top') {
          const isTop = art.isLead || art.isTrending || art.views?.includes('হাজার') || art.views?.includes('শো');
          if (!isTop) return false;
        } else {
          const catMap: Record<string, string[]> = {
            politics: ['politics', 'রাজনীতি', 'দল', 'মন্ত্রী', 'নির্বাচন', 'সরকার', 'উপদেষ্টা', 'সংসদ', 'রাজনৈতিক', 'আইন', 'প্রশাসন', 'আন্দোলন'],
            economy: ['economy', 'অর্থনীতি', 'ব্যাংক', 'ব্যবসা', 'বাণিজ্য', 'বাজেট', 'মুদ্রা', 'দাম', 'টাকা', 'শেয়ার', 'ঋণ', 'জ্বালানি', 'তেল', 'কর', 'মূল্যস্ফীতি'],
            national: ['national', 'saradesh', 'bangladesh', 'সারাদেশ', 'জাতীয়', 'জাতীয়', 'জেলা', 'উপজেলা', 'বরিশাল', 'সিলেট', 'চট্টগ্রাম', 'খুলনা', 'রাজশাহী', 'রংপুর', 'ময়মনসিংহ', 'ঢাকা'],
            health: ['health', 'স্বাস্থ্য', 'হাসপাতাল', 'ডাক্তার', 'মেডিসিন', 'চিকিৎসা', 'ডেঙ্গু', 'মশা', 'রোগী', 'ক্যান্সার', 'রোগ', 'ঔষধ'],
            crime: ['crime', 'অপরাধ', 'পুলিশ', 'মামলা', 'আদালত', 'আটক', 'গ্রেপ্তার', 'র্যাব', 'হত্যা', 'ডাকাতি', 'চুরি', 'ছিনতাই', 'আসামি', 'সিআইডি'],
            international: ['international', 'আন্তর্জাতিক', 'বিশ্ব', 'যুক্তরাষ্ট্র', 'ভারত', 'চীন', 'ট্রাম্প', 'গাজা', 'ইউক্রেন', 'রাশিয়া', 'ইসরাইল', 'ফিলিস্তিন', 'বিবিসি'],
            sports: ['sports', 'খেলাধুলা', 'খেলা', 'ক্রিকেট', 'ফুটবল', 'ম্যাচ', 'বিশ্বকাপ', 'বিপিএল', 'উইকেট', 'গোল', 'রান', 'মেসী', 'রোনালদো', 'সাকিব'],
            technology: ['technology', 'tech', 'প্রযুক্তি', 'আইটি', 'স্মার্টফোন', 'এআই', 'গুগল', 'অ্যাপ', 'ইন্টারনেট', 'সফটওয়্যার', 'সাইবার', 'ডিজিটাল'],
            opinion: ['opinion', 'মতামত', 'কলাম', 'সম্পাদকীয়', 'বিশ্লেষণ', 'নিবন্ধ', 'ভাবনা'],
          };
          const synonyms = catMap[activeCategory] || [activeCategory];
          const matchesSlug = synonyms.some(s => art.categorySlug?.toLowerCase() === s.toLowerCase());
          const matchesCatName = synonyms.some(s => art.category?.toLowerCase().includes(s.toLowerCase()));
          const fullText = `${art.title} ${art.excerpt} ${(art.tags || []).join(' ')}`.toLowerCase();
          const matchesKeyword = synonyms.some(s => fullText.includes(s.toLowerCase()));

          if (!matchesSlug && !matchesCatName && !matchesKeyword) return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesExcerpt = art.excerpt.toLowerCase().includes(q);
        const matchesCategory = art.category.toLowerCase().includes(q);
        const matchesPublisher = art.publisherBengali?.toLowerCase().includes(q) || art.publisherName?.toLowerCase().includes(q);
        const matchesTag = art.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesCategory && !matchesPublisher && !matchesTag) {
          return false;
        }
      }

      return true;
    });

    // Fallback: If filtering by category returned fewer than 2 items, complement with standard news items marked with this category name so page is never empty
    if (activeCategory !== 'all' && filtered.length < 2) {
      const extraFallback = articles.slice(0, 8).map(art => ({
        ...art,
        category: getCategoryBengaliLabel(activeCategory),
        categorySlug: activeCategory
      }));
      return Array.from(new Set([...filtered, ...extraFallback]));
    }

    return filtered;
  };

  const leadArticle = articles.find((a) => a.isLead) || articles[0];
  const trendingArticles = articles.filter((a) => a.isTrending && a.id !== leadArticle?.id).length >= 6 
    ? articles.filter((a) => a.isTrending && a.id !== leadArticle?.id).slice(0, 6) 
    : articles.filter((a) => a.id !== leadArticle?.id).slice(0, 6);
  const gridArticles = getFilteredArticles().filter((a) => a.id !== leadArticle?.id);
  const savedArticles = articles.filter((a) => savedArticleIds.includes(a.id));

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-red-600 selection:text-white"
      style={{ fontSize: `${fontSizeScale * 100}%` }}
    >
      {/* 1. Complete Header */}
      <Header
        fontSizeScale={fontSizeScale}
        setFontSizeScale={setFontSizeScale}
        savedArticlesCount={savedArticleIds.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onOpenEPaper={() => setIsEPaperOpen(true)}
        onOpenWeather={() => setIsWeatherOpen(true)}
        onOpenPrayerTimes={() => setIsPrayerOpen(true)}
        onOpenAIAssistant={handleOpenAIAssistant}
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setSelectedArticle(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onGoHome={() => {
          setSelectedArticle(null);
          setActiveCategory('all');
          setSelectedSource('all');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Live Automation Bar (Prothom Alo, BBC Bangla, Kalbela, Kaler Kantho Feeds) */}
      <LiveAutomationBar
        isAutoSyncing={isAutoSyncing}
        onManualSync={handleManualSync}
        selectedSource={selectedSource}
        onSelectSource={(srcId) => {
          setSelectedSource(srcId);
          setSelectedArticle(null);
        }}
        lastSyncTime={lastSyncTime}
        totalLiveCount={liveCount}
        isRealtimeEnabled={isRealtimeEnabled}
        onToggleRealtime={() => setIsRealtimeEnabled(!isRealtimeEnabled)}
        countdownSeconds={countdownSeconds}
        newArticlesCount={newArticlesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedArticle ? (
          /* View 1: Detailed Article Reading Screen */
          <ArticleDetailView
            article={selectedArticle}
            onBack={() => {
              setSelectedArticle(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectArticle={(art) => {
              setSelectedArticle(art);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            allArticles={articles}
            relatedArticles={articles.filter((a) => a.id !== selectedArticle.id)}
            isSaved={savedArticleIds.includes(selectedArticle.id)}
            onToggleSave={handleToggleSave}
            comments={comments}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onOpenAIAssistant={handleOpenAIAssistant}
            poll={poll}
            onVotePoll={handleVotePoll}
          />
        ) : (
          /* View 2: Homepage Layout */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            {/* Search, Category, or Source Filter indicator */}
            {(searchQuery || selectedSource !== 'all' || activeCategory !== 'all') && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-amber-900 flex items-center justify-between shadow-2xs">
                <span className="font-medium">
                  {activeCategory !== 'all' ? (
                    <>ক্যাটাগরি বিভাগ: <strong className="text-red-700">"{getCategoryBengaliLabel(activeCategory)}"</strong> ({gridArticles.length}টি লাইভ খবর)</>
                  ) : selectedSource !== 'all' ? (
                    <>স্বয়ংক্রিয় সংবাদ ফিল্টার: <strong className="text-red-700">"{selectedSource}"</strong> ({gridArticles.length}টি খবর)</>
                  ) : (
                    <>অনুসন্ধান ফলাফল: <strong className="text-red-700">"{searchQuery}"</strong> ({gridArticles.length}টি খবর)</>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSource('all');
                    setActiveCategory('all');
                  }}
                  className="font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer transition-colors shrink-0 ml-2"
                >
                  সব খবর দেখুন
                </button>
              </div>
            )}

            {/* Loading state when fetching live news */}
            {articles.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs my-8 space-y-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="font-bold text-lg text-slate-800">
                  অটোমেটেড লাইভ নিউজ লোড করা হচ্ছে...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  প্রথম আলো, বিবিসি বাংলা, কালের কণ্ঠ ও কালবেলা থেকে সর্বশেষ লাইভ খবর সংগ্রহ করা হচ্ছে। অনুগ্রহ করে এক মুহূর্ত অপেক্ষা করুন।
                </p>
              </div>
            )}

            {/* Top Section: Lead Story (Hero) & Trending Today Sidebar */}
            {!searchQuery && selectedSource === 'all' && activeCategory === 'all' && leadArticle && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Lead Story (approx 65% width) */}
                <div className="lg:col-span-8 flex">
                  <LeadHero
                    article={leadArticle}
                    onSelectArticle={(art) => {
                      setSelectedArticle(art);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    isSaved={leadArticle ? savedArticleIds.includes(leadArticle.id) : false}
                    onToggleSave={handleToggleSave}
                  />
                </div>

                {/* Right: Trending Stories Sidebar (approx 35% width) */}
                <div className="lg:col-span-4 flex">
                  <TrendingSidebar
                    articles={trendingArticles}
                    onSelectArticle={(art) => {
                      setSelectedArticle(art);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bottom Section: তাজা সংবাদ ও বিশেষ প্রতিবেদন Grid + Right Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Content Column (approx 65-70% width) */}
              <div className="lg:col-span-8">
                <NewsGrid
                  articles={gridArticles}
                  onSelectArticle={(art) => {
                    setSelectedArticle(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  savedArticleIds={savedArticleIds}
                  onToggleSave={handleToggleSave}
                />
              </div>

              {/* Right Sidebar Column (approx 30-35% width) */}
              <div className="lg:col-span-4">
                <RightSidebar
                  articles={articles}
                  onSelectArticle={(art) => {
                    setSelectedArticle(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenAIAssistant={handleOpenAIAssistant}
                  poll={poll}
                  onVotePoll={handleVotePoll}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onCategoryClick={(slug) => {
          setActiveCategory(slug);
          setSelectedArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onGoHome={() => {
          setSelectedArticle(null);
          setActiveCategory('all');
          setSelectedSource('all');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Audio Bulletin Player */}
      <AudioBulletinPlayer
        isOpen={isPlayingAudioBulletin}
        onClose={() => setIsPlayingAudioBulletin(false)}
      />

      {/* Saved News Drawer */}
      <SavedArticlesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedArticles={savedArticles}
        onSelectArticle={(art) => {
          setSelectedArticle(art);
          setIsSavedDrawerOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRemoveSaved={handleRemoveSaved}
        onClearAll={handleClearAllSaved}
      />

      {/* E-Paper Modal */}
      <EPaperModal
        isOpen={isEPaperOpen}
        onClose={() => setIsEPaperOpen(false)}
      />

      {/* Weather Modal */}
      <WeatherModal
        isOpen={isWeatherOpen}
        onClose={() => setIsWeatherOpen(false)}
      />

      {/* Prayer Times Modal */}
      <PrayerTimesModal
        isOpen={isPrayerOpen}
        onClose={() => setIsPrayerOpen(false)}
      />

      {/* Deshbarta AI News Assistant & Fact-Checker Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        initialPrompt={aiInitialPrompt}
        articles={articles}
      />
    </div>
  );
}
