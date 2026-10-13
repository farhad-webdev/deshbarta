import React, { useState } from 'react';
import { Bookmark, Clock, MessageSquare, ArrowRight, ChevronDown } from 'lucide-react';
import { Article } from '../types';

interface NewsGridProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  savedArticleIds: string[];
  onToggleSave: (article: Article) => void;
}

export const NewsGrid: React.FC<NewsGridProps> = ({
  articles,
  onSelectArticle,
  savedArticleIds,
  onToggleSave,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'all' | 'politics' | 'economy' | 'crime'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Sub filter tabs
  const subTabs = [
    { id: 'all', label: 'সব বিভাগ' },
    { id: 'politics', label: 'রাজনীতি' },
    { id: 'economy', label: 'অর্থনীতি' },
    { id: 'crime', label: 'অপরাধ' },
  ];

  // Only reset subtab and visibleCount when switching subtabs, or when article count drops to 0
  const prevArticlesLenRef = React.useRef(articles.length);
  React.useEffect(() => {
    // Only reset if articles went from 0 to populated (initial load)
    if (prevArticlesLenRef.current === 0 && articles.length > 0) {
      setVisibleCount(6);
    }
    prevArticlesLenRef.current = articles.length;
  }, [articles.length]);

  // Filter based on selected sub tab
  const filteredArticles = articles.filter((a) => {
    if (selectedSubTab === 'all') return true;
    return (
      a.categorySlug === selectedSubTab ||
      a.category?.toLowerCase().includes(selectedSubTab.toLowerCase()) ||
      `${a.title} ${a.excerpt}`.toLowerCase().includes(selectedSubTab.toLowerCase())
    );
  });

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const remainingCount = filteredArticles.length - visibleCount;
  const hasMore = remainingCount > 0;

  return (
    <section className="mb-10">
      {/* Header with Title and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-5 border-b-2 border-red-600 gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            তাজা সংবাদ ও বিশেষ প্রতিবেদন
          </h2>
          <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            লাইভ আপডেট ({filteredArticles.length}টি)
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
          {subTabs.map((tab) => {
            const isActive = selectedSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedSubTab(tab.id as any);
                  setVisibleCount(6);
                }}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {displayedArticles.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center my-4 space-y-3">
          <p className="text-slate-600 font-medium text-sm">
            এই মুহূর্তে উক্ত ফিল্টারে কোনো সংবাদ পাওয়া যায়নি।
          </p>
          <button
            type="button"
            onClick={() => setSelectedSubTab('all')}
            className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            সব সংবাদ দেখুন
          </button>
        </div>
      )}

      {/* 2-Columns Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {displayedArticles.map((article) => {
          const isSaved = savedArticleIds.includes(article.id);
          return (
            <article
              key={article.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div>
                {/* Image Header with Category & Bookmark */}
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  {/* Category / Publisher Pill */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1">
                    <span
                      className="text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs"
                      style={{ backgroundColor: article.categoryColor || '#dc2626' }}
                    >
                      {article.publisherBengali || article.category}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(article);
                    }}
                    className={`absolute top-3 right-3 z-10 p-1.5 rounded-full backdrop-blur-xs transition-colors shadow-xs cursor-pointer ${
                      isSaved
                        ? 'bg-red-600 text-white'
                        : 'bg-white/80 text-slate-700 hover:bg-white hover:text-red-600'
                    }`}
                    title={isSaved ? 'সংরক্ষিত তালিকা থেকে মুছুন' : 'সংরক্ষণ করুন'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  <img
                    src={article.image}
                    alt={article.title}
                    onClick={() => onSelectArticle(article)}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 cursor-pointer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5">
                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
                    <span>{article.author}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {article.timeAgo}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectArticle(article)}
                    className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-red-600 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
                  >
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.commentsCount} মন্তব্য</span>
                </span>

                <button
                  type="button"
                  onClick={() => onSelectArticle(article)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold group-hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>বিস্তারিত পড়ুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <span>আরও সংবাদ দেখুন (+৬টি)</span>
            <ChevronDown className="w-4 h-4 text-white" />
          </button>

          {remainingCount > 6 && (
            <button
              type="button"
              onClick={() => setVisibleCount(filteredArticles.length)}
              className="inline-flex items-center gap-1.5 px-5 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow"
            >
              <span>সব সংবাদ একসাথে দেখুন ({filteredArticles.length}টি)</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
