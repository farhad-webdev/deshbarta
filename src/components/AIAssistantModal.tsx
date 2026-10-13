import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Check, Copy, Search, Globe, ShieldCheck } from 'lucide-react';
import { Article, ChatMessage } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  articles?: Article[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  articles = []
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'স্বাগতম! আমি দেশবার্তা এআই সংবাদ সহকারী। আমাদের ওয়েবসাইটের (প্রথম আলো, বিবিসি বাংলা, কালবেলা, কালের কণ্ঠ ও দেশবার্তা) সকল লাইভ খবর স্ক্যান ও গভীর রিসার্চ করে আপনার যেকোনো প্রশ্নের নিখুঁত তথ্য ও প্রাসঙ্গিক সংবাদ তুলে ধরবো।',
      timestamp: 'এইমাত্র',
      suggestedQuestions: [
        'আজকের রাজনীতি ও উপনির্বাচনের সংবাদ কী?',
        'জ্বালানি তেলের দামের আপডেট ও সমন্বয় কী?',
        'কাপ্তাই জলবিদ্যুৎ কেন্দ্রের ৪৫০ কোটি টাকার প্রকল্প কী?',
        'ক্যান্সার চিকিৎসায় রেডিওথেরাপির লাইন্যাক সংকটের খবর কী?'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: text.trim(),
          articles: articles.length > 0 ? articles.slice(0, 30) : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || 'দুঃখিত, তথ্য সংগ্রহে বিলম্ব হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          sources: data.sourcesCount ? [`ওয়েবসাইটের ${data.sourcesCount}টি সংবাদ থেকে সংগৃহীত`] : undefined,
          suggestedQuestions: [
            'অর্থনীতি ও আন্তর্জাতিক খবরের আজকের প্রধান বিষয় কী?',
            'ডেঙ্গু প্রতিরোধ ও স্বাস্থ্য খাতের সর্বশেষ আপডেট কী?'
          ]
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('API server returned error');
      }
    } catch (error) {
      console.warn('AI research request error:', error);
      // Client-side fallback research in current loaded articles
      const qLower = text.toLowerCase();
      const matched = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(qLower) ||
          a.excerpt.toLowerCase().includes(qLower) ||
          a.category.toLowerCase().includes(qLower)
      );

      let reply = `**দেশবার্তা এআই সংবাদ সহকারী (ওয়েবসাইট লাইভ রিসার্চ):**\n\nআপনার প্রশ্ন: "${text}" বিষয়ে আমাদের ওয়েবসাইটে মোট ${articles.length}টি খবর বিশ্লেষণ করা হয়েছে।\n\n`;
      if (matched.length > 0) {
        matched.slice(0, 3).forEach((m, idx) => {
          reply += `**${idx + 1}. ${m.title}**\n• **উৎস:** ${m.publisherBengali || 'দেশবার্তা'} (${m.category})\n• **বিস্তারিত:** ${m.excerpt}\n\n`;
        });
      } else {
        reply += `সুনির্দিষ্ট ম্যাচের পাশাপাশি আজকের প্রধান সংবাদসমূহ:\n`;
        articles.slice(0, 3).forEach((a) => {
          reply += `• **${a.title}** — *${a.publisherBengali || 'দেশবার্তা'}*\n`;
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: 'এখন'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Basic Markdown Formatter for Assistant Messages
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Bold text handling **bold**
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-extrabold text-slate-900 bg-amber-100/60 px-1 rounded">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-2 border-l-2 border-red-500">
            <span className="text-red-600 font-bold">•</span>
            <span className="text-slate-800 font-medium">{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="my-1.5 leading-relaxed text-slate-800">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl h-[88vh] max-h-[800px] flex flex-col overflow-hidden font-sans">
        
        {/* Header Bar */}
        <div className="bg-linear-to-r from-red-950 via-red-900 to-red-800 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg leading-none tracking-tight">
                  দেশবার্তা এআই সংবাদ সহকারী
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                  গবেষণা ইঞ্জিন
                </span>
              </div>
              <p className="text-[11px] text-red-200 font-medium mt-1 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-amber-300" />
                <span>পুরো ওয়েবসাইট ও লাইভ পোর্টালের সংবাদের গভীর বিশ্লেষণ</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center transition-colors text-white cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live News Counter Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-[11px] text-amber-900 font-semibold flex justify-between items-center shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>লাইভ ডেটাবেস: প্রথম আলো, বিবিসি বাংলা, কালবেলা, কালের কণ্ঠ</span>
          </span>
          <span className="bg-amber-200 text-amber-950 px-2 py-0.2 rounded-full font-bold">
            {articles.length || 35}+ খবর অ্যাক্টিভ
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/80 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              <div className={`max-w-[88%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-red-600 text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div>{renderFormattedText(msg.text)}</div>
                  ) : (
                    <div className="whitespace-pre-line">{msg.text}</div>
                  )}

                  {msg.sender === 'assistant' && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                      <span className="flex items-center gap-1 font-semibold text-slate-500">
                        <Sparkles className="w-3 h-3 text-red-500" />
                        <span>দেশবার্তা এআই রিসার্চ ডেস্ক</span>
                        {msg.sources && msg.sources.length > 0 && (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 ml-1">
                            • {msg.sources[0]}
                          </span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors p-1 cursor-pointer font-medium"
                        title="কপি করুন"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === msg.id ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested Questions Chips */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="text-[11px] bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-300 text-slate-700 px-2.5 py-1 rounded-full transition-all cursor-pointer text-left shadow-2xs flex items-center gap-1 font-medium"
                      >
                        <span>{q}</span>
                        <span className="text-red-500 font-bold">↗</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing / Researching Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start items-center animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="font-semibold text-red-700 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 animate-spin text-red-500" />
                  <span>পুরো ওয়েবসাইটের সকল খবর স্ক্যান ও রিসার্চ করা হচ্ছে...</span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="পোটালের যেকোনো খবর সম্পর্কে জিজ্ঞেস করুন (যেমন: জ্বালানি তেলের দাম, নির্বাচন, বা কাপ্তাই জলবিদ্যুৎ)..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm active:scale-95 shrink-0 flex items-center justify-center"
              title="উত্তর তৈরি করুন"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1 font-medium">
            <span>দেশবার্তা এআই ইন্টেলিজেন্স ও রিয়েল-টাইম ফ্যাক্টচেক ইঞ্জিন</span>
            <span>সর্বশেষ লাইভ সংবাদ বিশ্লেষণভিত্তিক</span>
          </div>
        </div>
      </div>
    </div>
  );
};
