import React from 'react';
import { Clock } from 'lucide-react';
import { Article } from '../types';

interface TrendingSidebarProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  articles,
  onSelectArticle,
}) => {
  const bengaliDigits = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'];

  // Display exactly 6 news items as requested
  const trendingList = articles.slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col w-full h-full">
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <h3 className="font-bold text-base sm:text-lg text-slate-900">
            আজকের আলোচিত
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
            ৬টি প্রধান খবর
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (articles.length > 0) onSelectArticle(articles[0]);
          }}
          className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
        >
          সব দেখুন
        </button>
      </div>

      {/* List of Trending Stories (Exactly 6 items) */}
      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[580px] sm:max-h-[640px] custom-scrollbar flex-1">
        {trendingList.map((article, idx) => {
          return (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="p-3 sm:p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer group flex items-start gap-3"
            >
              {/* Rank Badge */}
              <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {bengaliDigits[idx] || (idx + 1)}
              </div>

              {/* Thumbnail */}
              <div className="w-20 h-16 sm:w-22 sm:h-16 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase mb-0.5" style={{ color: article.categoryColor || '#dc2626' }}>
                  {article.category}
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{article.timeAgo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
