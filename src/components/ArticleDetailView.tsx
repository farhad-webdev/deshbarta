import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Copy, 
  Check,
  ExternalLink,
  Globe
} from 'lucide-react';
import { Article, Comment, Poll } from '../types';
import { RightSidebar } from './RightSidebar';

interface ArticleDetailViewProps {
  article: Article;
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  allArticles: Article[];
  relatedArticles: Article[];
  isSaved: boolean;
  onToggleSave: (article: Article) => void;
  comments: Comment[];
  onAddComment: (articleId: string, author: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onOpenAIAssistant: (initialPrompt?: string) => void;
  poll: Poll;
  onVotePoll: (optionId: string) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  onBack,
  onSelectArticle,
  allArticles,
  relatedArticles,
  isSaved,
  onToggleSave,
  comments,
  onAddComment,
  onLikeComment,
  onOpenAIAssistant,
  poll,
  onVotePoll,
}) => {
  const [articleFontSize, setArticleFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Web Speech API for reading the article out loud in Bengali
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না।');
      return;
    }

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
    } else {
      const fullText = `${article.title}। ${article.excerpt}। ${article.content.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlayingSpeech(false);
      utterance.onerror = () => setIsPlayingSpeech(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsPlayingSpeech(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(article.id, newCommentName.trim() || 'পাঠক', newCommentText.trim());
    setNewCommentText('');
  };

  const articleComments = comments.filter((c) => c.articleId === article.id);

  const getFontSizeClass = () => {
    if (articleFontSize === 'large') return 'text-lg sm:text-xl leading-[1.9]';
    if (articleFontSize === 'xlarge') return 'text-xl sm:text-2xl leading-[1.95]';
    return 'text-base sm:text-[17px] leading-[1.85]';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 12-Column Grid Layout matching Home page width */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Article Content Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Back to Home Button & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>মূল পাতায় ফিরে যান</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
              <span>হোম</span>
              <span className="text-slate-300">/</span>
              <span className="text-red-600 font-bold">{article.category}</span>
              <span className="text-slate-300">/</span>
              <span className="truncate max-w-[180px] sm:max-w-[280px] text-slate-700">{article.title}</span>
            </div>
          </div>

          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {article.isBreaking && (
                <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                  ব্রেকিং নিউজ
                </span>
              )}
              <span 
                className="text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs"
                style={{ backgroundColor: article.categoryColor || '#dc2626' }}
              >
                {article.publisherBengali || article.category}
              </span>
              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs transition-colors flex items-center gap-1"
                >
                  <span>মূল নিউজে যান</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">{article.readTime}</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.35] tracking-tight">
              {article.title}
            </h1>

            {/* Excerpt Lead */}
            <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed border-l-4 border-red-600 pl-4 sm:pl-5 py-3.5 bg-slate-50 border-y border-r border-slate-200/80 rounded-r-xl shadow-2xs">
              {article.excerpt}
            </p>

            {/* Author & Publishing Meta Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="font-bold text-slate-900">
                  প্রতিবেদক: <span className="text-red-600">{article.author}</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span>প্রকাশ: {article.publishedAt}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {article.timeAgo}
                </span>
                {article.views && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {article.views}
                    </span>
                  </>
                )}
              </div>

              {/* Reading Toolbar (Font Size, Audio Read, Bookmark, Share) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Font scale buttons */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setArticleFontSize('normal')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${articleFontSize === 'normal' ? 'bg-red-600 text-white font-bold' : 'hover:bg-slate-100'}`}
                    title="সাধারণ ফন্ট"
                  >
                    অ
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleFontSize('large')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${articleFontSize === 'large' ? 'bg-red-600 text-white font-bold' : 'hover:bg-slate-100'}`}
                    title="বড় ফন্ট"
                  >
                    অ+
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleFontSize('xlarge')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${articleFontSize === 'xlarge' ? 'bg-red-600 text-white font-bold' : 'hover:bg-slate-100'}`}
                    title="অনেক বড় ফন্ট"
                  >
                    অ++
                  </button>
                </div>

                {/* Audio Read-Aloud Button */}
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    isPlayingSpeech
                      ? 'bg-red-600 text-white border-red-600 animate-pulse'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
                  }`}
                  title="সংবাদটি অডিওতে শুনুন"
                >
                  {isPlayingSpeech ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
                  <span>{isPlayingSpeech ? 'থামুন' : 'শুনুন'}</span>
                </button>

                {/* Bookmark button */}
                <button
                  type="button"
                  onClick={() => onToggleSave(article)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                    isSaved
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-red-600 hover:bg-slate-100'
                  }`}
                  title={isSaved ? 'সংরক্ষিত তালিকা থেকে মুছুন' : 'সংরক্ষণ করুন'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>

                {/* Share / Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs relative"
                  title="লিংক কপি করুন"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Featured Photo */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto max-h-[520px] object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              {article.imageCaption && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-xs sm:text-sm text-slate-600 text-center font-medium">
                  ছবি: {article.imageCaption}
                </div>
              )}
            </div>
          </div>

          {/* Article Body Paragraphs - Perfectly Aligned Bengali Typography */}
          <div className={`space-y-6 text-slate-900 ${getFontSizeClass()} tracking-[0.01em] border-b border-slate-200 pb-8`}>
            {article.content.map((paragraph, index) => (
              <p key={index} className="text-left text-slate-800 leading-[1.85] font-normal">
                {paragraph}
              </p>
            ))}

            {/* Prominent Original Source Portal Card */}
            <div className="my-8 p-5 sm:p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      সংবাদটি যে নিউজ পোর্টাল থেকে এসেছে
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-red-500" />
                    <span>{article.publisherBengali || article.category}</span>
                    {article.publisherName && (
                      <span className="text-xs text-slate-400 font-normal">({article.publisherName})</span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    এই খবরের সম্পূর্ণ ভিডিও, ফটো ফিচার এবং লাইভ আপডেট সরাসরি {article.publisherBengali || article.category} পোর্টালে প্রকাশিত হয়েছে।
                  </p>
                </div>

                {article.sourceUrl && (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>মূল পোর্টালে সম্পূর্ণ খবর পড়ুন</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              সম্পর্কিত বিষয়সমূহ:
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Comments Section */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-100">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-lg text-slate-900">
                পাঠক মন্তব্য ({articleComments.length + (article.commentsCount || 0)})
              </h3>
            </div>

            {/* New Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  placeholder="আপনার নাম (ঐচ্ছিক)"
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:bg-white"
                />
              </div>
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="আপনার সুচিন্তিত মতামত লিখুন..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:bg-white resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-lg transition-colors cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>মন্তব্য প্রকাশ করুন</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {articleComments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  এখনও কোনো নতুন মন্তব্য যুক্ত হয়নি। আপনার মতামত সবার আগে জানান!
                </p>
              ) : (
                articleComments.map((comm) => (
                  <div key={comm.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {comm.author}
                      </span>
                      <span className="text-[11px] text-slate-400">{comm.timeAgo}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2">
                      {comm.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onLikeComment(comm.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${comm.userLiked ? 'text-red-600 fill-current' : ''}`} />
                        <span>{comm.likes} ভালো লেগেছে</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Related News (সম্পর্কিত খবর) */}
          <section>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-red-600 inline-block">
              আরও পড়ুন
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
                >
                  <div className="aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-red-600 uppercase mb-1 block">
                        {rel.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      {rel.timeAgo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4">
          <RightSidebar
            articles={allArticles}
            onSelectArticle={(art) => {
              onSelectArticle(art);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAIAssistant={onOpenAIAssistant}
            poll={poll}
            onVotePoll={onVotePoll}
          />
        </div>
      </div>
    </div>
  );
};
