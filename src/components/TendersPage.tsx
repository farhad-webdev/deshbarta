import React, { useState } from 'react';
import { 
  FileText, 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  CheckCircle2, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  Bell, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  Download,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Article } from '../types';

export interface TenderNotice {
  id: string;
  title: string;
  organization: string;
  tenderType: 'govt' | 'semi-govt' | 'autonomous' | 'private' | 'e-gp';
  tenderNumber: string;
  publishingDate: string;
  deadline: string;
  estimatedCost: string;
  securityMoney: string;
  location: string;
  category: 'construction' | 'supply' | 'ict' | 'transport' | 'maintenance' | 'general';
  sourcePortalName?: string;
  excerpt: string;
  fullDetails: string[];
  documentUrl?: string;
  articleRef?: Article;
}

// Date parsing and deadline expiry helper functions
export const bnToEnNums = (str: string): string => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (d) => bn.indexOf(d).toString());
};

export const parseTenderDeadline = (deadlineStr: string): Date | null => {
  if (!deadlineStr) return null;
  const str = bnToEnNums(deadlineStr.toLowerCase().trim());

  const monthsMap: { [key: string]: number } = {
    'জানুয়ারি': 0, 'জানুয়ারি': 0, 'january': 0, 'jan': 0,
    'ফেব্রুয়ারি': 1, 'ফেব্রুয়ারি': 1, 'february': 1, 'feb': 1,
    'মার্চ': 2, 'march': 2, 'mar': 2,
    'এপ্রিল': 3, 'april': 3, 'apr': 3,
    'মে': 4, 'may': 4,
    'জুন': 5, 'june': 5, 'jun': 5,
    'জুলাই': 6, 'july': 6, 'jul': 6,
    'আগস্ট': 7, 'august': 7, 'aug': 7,
    'সেপ্টেম্বর': 8, 'september': 8, 'sep': 8,
    'অক্টোবর': 9, 'october': 9, 'oct': 9,
    'নভেম্বর': 10, 'november': 10, 'nov': 10,
    'ডিসেম্বর': 11, 'december': 11, 'dec': 11,
  };

  let foundMonth: number | null = null;
  for (const [mName, mIdx] of Object.entries(monthsMap)) {
    if (str.includes(mName)) {
      foundMonth = mIdx;
      break;
    }
  }

  const numberMatches = str.match(/\d+/g);
  if (!numberMatches || foundMonth === null) {
    return null;
  }

  const yearMatch = numberMatches.find((n) => n.length === 4);
  const dayMatch = numberMatches.find((n) => n.length <= 2 && parseInt(n, 10) >= 1 && parseInt(n, 10) <= 31);

  if (yearMatch && dayMatch && foundMonth !== null) {
    const year = parseInt(yearMatch, 10);
    const day = parseInt(dayMatch, 10);
    return new Date(year, foundMonth, day, 23, 59, 59);
  }

  return null;
};

export const isTenderExpired = (deadlineStr: string): boolean => {
  if (!deadlineStr) return false;
  if (deadlineStr.includes('মেয়াদ শেষ') || deadlineStr.includes('সমাপ্ত') || deadlineStr.includes('expired')) {
    return true;
  }
  const dateObj = parseTenderDeadline(deadlineStr);
  if (!dateObj) return false;
  const now = new Date();
  return dateObj.getTime() < now.getTime();
};

export const getTenderDaysLeft = (deadlineStr: string): { text: string; isUrgent: boolean; isExpired: boolean } => {
  if (isTenderExpired(deadlineStr)) {
    return { text: 'মেয়াদ উত্তীর্ণ', isUrgent: false, isExpired: true };
  }
  const dateObj = parseTenderDeadline(deadlineStr);
  if (!dateObj) {
    return { text: deadlineStr, isUrgent: false, isExpired: false };
  }
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { text: 'আজই শেষ দিন', isUrgent: true, isExpired: false };
  } else if (diffDays === 1) {
    return { text: '১ দিন বাকি', isUrgent: true, isExpired: false };
  } else if (diffDays <= 5) {
    return { text: `${diffDays} দিন বাকি`, isUrgent: true, isExpired: false };
  } else {
    return { text: `${diffDays} দিন বাকি`, isUrgent: false, isExpired: false };
  }
};

export const MOCK_TENDER_NOTICES: TenderNotice[] = [
  {
    id: 'tender-1',
    title: 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর (এলজিইডি) কর্তৃক গ্রামীণ সড়ক উন্নয়ন ও কার্পেটিং কাজ',
    organization: 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর (LGED)',
    tenderType: 'govt',
    tenderNumber: 'LGED/EE/2026/T-412',
    publishingDate: '১০ অক্টোবর ২০২৬',
    deadline: '২৫ নভেম্বর ২০২৬',
    estimatedCost: '৫.৫০ কোটি টাকা',
    securityMoney: '১৫,০০,০০০ টাকা',
    location: 'ঢাকা ও গাজীপুর জেলা',
    category: 'construction',
    excerpt: 'এলজিইডির আওতাধীন গ্রামীণ সড়ক সংস্কার, মেকাডাম ও কার্পেটিং কাজের জন্য ই-জিপি পোর্টালে অনলাইন টেন্ডার আহ্বান করা হয়েছে।',
    fullDetails: [
      'কাজের বিবরণী: প্রায় ১৫ কিলোমিটার গ্রামীণ পাকা রাস্তা পুনর্নির্মাণ ও ড্রেন নির্মাণ।',
      'যোগ্যতা: রেজিস্টার্ড ঠিকাদার প্রতিষ্ঠান যাদের সরকারি বা স্বায়ত্তশাসিত সংস্থায় অনুরূপ কাজের ন্যূনতম ৩ কোটি টাকার অভিজ্ঞতা রয়েছে।',
      'টেন্ডার জমাদানের শেষ তারিখ: ২৫ নভেম্বর ২০২৬, দুপুর ১২:০০ ঘটিকা।',
      'সিকিউরিটি মানি: পে-অর্ডার/ব্যাংক গ্যারান্টি হিসেবে ১৫,০০,০০০ টাকা জমা দিতে হবে।',
      'বিশেষ দ্রষ্টব্য: ই-জিপি (e-GP) পোর্টালে (www.eprocure.gov.bd) টেন্ডার আইডি (Tender ID: 984102) এর মাধ্যমে দরপত্র জমা দিতে হবে।'
    ],
    documentUrl: 'https://www.eprocure.gov.bd'
  },
  {
    id: 'tender-2',
    title: 'বাংলাদেশ রেলওয়ে পশ্চিমাঞ্চলের জন্য নতুন রেলওয়ে কোচ ও যন্ত্রাংশ সরবরাহ ও রক্ষণাবেক্ষণ',
    organization: 'বাংলাদেশ রেলওয়ে (Bangladesh Railway)',
    tenderType: 'govt',
    tenderNumber: 'BR/MECH/2026/SUP-88',
    publishingDate: '০৮ অক্টোবর ২০২৬',
    deadline: '৩০ নভেম্বর ২০২৬',
    estimatedCost: '১২.৮০ কোটি টাকা',
    securityMoney: '৪০,০০,০০০ টাকা',
    location: 'রাজশাহী ও সৈয়দপুর ওয়ার্কশপ',
    category: 'supply',
    excerpt: 'বাংলাদেশ রেলওয়ের চলমান বগি ও ইঞ্জিনের জন্য উচ্চমানের যন্ত্রাংশ এবং খুচরা যন্ত্রাংশ সরবরাহের আন্তর্জাতিক ও উন্মুক্ত টেন্ডার।',
    fullDetails: [
      'সরবরাহের বিবরণী: উচ্চমানের ব্রেক শু, বিয়ারিং, স্প্রিং এবং ইলেকট্রনিক সিগন্যাালিং উপাদান।',
      'অভিজ্ঞতা: আন্তর্জাতিক বা দেশীয় খ্যাতিসম্পন্ন ম্যানুফ্যাকচারার বা অনুমোদিত ডিস্ট্রিবিউটরগণ দরপত্রে অংশ নিতে পারবেন।',
      'দরপত্র দাখিলের শেষ সময়: ৩০ নভেম্বর ২০২৬, বিকাল ৩:০০ টা।',
      'দরপত্র দলিল মূল্য: ৫,০০০ টাকা (অফেরতযোগ্য)।'
    ],
    documentUrl: 'https://bangladeshrailway.gov.bd'
  },
  {
    id: 'tender-3',
    title: 'জাতীয় রাজস্ব বোর্ড (NBR) এর সেন্ট্রাল ডাটা সেন্টার এবং নেটওয়ার্ক আপগ্রেডেশন প্রজেক্ট',
    organization: 'জাতীয় রাজস্ব বোর্ড (NBR)',
    tenderType: 'e-gp',
    tenderNumber: 'NBR/ICT/2026/DC-15',
    publishingDate: '১২ অক্টোবর ২০২৬',
    deadline: '২০ নভেম্বর ২০২৬',
    estimatedCost: '৩.২৫ কোটি টাকা',
    securityMoney: '১০,০০,০০০ টাকা',
    location: 'সেগুনবাগিচা, ঢাকা',
    category: 'ict',
    excerpt: 'এনবিআরের সেন্ট্রাল সার্ভার রুম আধুনিকায়ন, ফাইবার অপটিক নেটওয়ার্ক ও সাইবার সিকিউরিটি ফায়ারওয়াল সংগ্রহের ই-টেন্ডার।',
    fullDetails: [
      'প্রযুক্তিগত বৈশিষ্ট্য: এন্টারপ্রাইজ গ্রেড সার্ভার, কোর সুইচ, এবং এসডিএন সিকিউরিটি সফটওয়্যার ইনস্টলেশন।',
      'আইসিটি লাইসেন্স: বিটিআরসি লাইসেন্সপ্রাপ্ত ও আইএসপি/সফটওয়্যার ভেন্ডর প্রতিষ্ঠান হতে হবে।',
      'প্রি-বিড মিটিং: ১৮ অক্টোবর ২০২৬, সকাল ১১:০০ টা।',
      'জমাদানের শেষ সময়: ২০ নভেম্বর ২০২৬।'
    ],
    documentUrl: 'https://www.nbr.gov.bd'
  },
  {
    id: 'tender-4',
    title: 'ঢাকা ওয়াসা কর্তৃক নতুন পানি শোধনাগার পাম্প হাউজ ও পাইপলাইন মেরামত ও সরবরাহ',
    organization: 'ঢাকা ওয়াসা (WASA)',
    tenderType: 'autonomous',
    tenderNumber: 'WASA/ENG/2026/W-104',
    publishingDate: '০৫ অক্টোবর ২০২৬',
    deadline: '১৫ নভেম্বর ২০২৬',
    estimatedCost: '৪.২০ কোটি টাকা',
    securityMoney: '১২,০০,০০০ টাকা',
    location: 'ঢাকা উত্তর সিটি কর্পোরেশন এলাকা',
    category: 'maintenance',
    excerpt: 'পানির পাইপলাইন মেরামত, ভারী পাইপ মোটর প্রতিস্থাপন এবং রক্ষণাবেক্ষণ কাজের জন্য উন্মুক্ত দরপত্র আহ্বান।',
    fullDetails: [
      'কাজের পরিধি: ৪৫০ মিমি ডায়ামিটারের পাইপলাইন প্রতিস্থাপন এবং পাম্প মেইনটেন্যান্স।',
      'অভিজ্ঞতা: পাবলিক ইউটিলিটি সার্ভিসে ন্যূনতম ৫ বছরের কাজের অভিজ্ঞতা আবশ্যক।',
      'দরপত্র জমাদানের শেষ তারিখ: ১৫ নভেম্বর ২০২৬।'
    ],
    documentUrl: 'https://dwasa.org.bd'
  },
  {
    id: 'tender-5',
    title: 'বেসরকারি করপোরেট অফিস বিল্ডিং ও মাল্টিপারপাস কনফারেন্স হল ইন্টেরিয়র ডেকোরেশন ও ফার্নিচার সরবরাহ',
    organization: 'স্কয়ার গ্রুপ অব ইন্ডাস্ট্রিজ (প্রাইভেট)',
    tenderType: 'private',
    tenderNumber: 'SQUARE/PRV/2026/INT-05',
    publishingDate: '১৪ অক্টোবর ২০২৬',
    deadline: '২৮ অক্টোবর ২০২৬',
    estimatedCost: '৮৫ লাখ টাকা',
    securityMoney: '৩,০০,০০০ টাকা',
    location: 'পান্থপথ, ঢাকা',
    category: 'construction',
    excerpt: 'স্কয়ার গ্রুপের নতুন কর্পোরেট ফ্লোরের আধুনিক ইন্টেরিয়র ডিজাইন, ফলস ছাদ, লাইটিং এবং অফিস ওয়ার্কস্টেশন ফার্নিচার সরবরাহ।',
    fullDetails: [
      'কাজের বিবরণী: আধুনিক এস্থেটিকস ইন্টেরিয়র, একিউস্টিক ওয়াল প্যানেলিং এবং সেন্ট্রাল এসি ডাক্টিং কভারিং।',
      'অংশগ্রহণকারী: স্বনামধন্য ইন্টেরিয়র ফার্ম ও ডিজাইন স্টুডিও।',
      'জমাদানের শেষ সময়: ২৮ অক্টোবর ২০২৬।'
    ],
    documentUrl: '#'
  },
  {
    id: 'tender-6',
    title: 'বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) কর্তৃক বৈজ্ঞানিক ল্যাবরেটরি ইক্যুইপমেন্ট ও কেমিক্যাল সরবরাহ',
    organization: 'বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI)',
    tenderType: 'semi-govt',
    tenderNumber: 'BARI/SCI/2026/LAB-22',
    publishingDate: '০১ অক্টোবর ২০২৬',
    deadline: '১০ নভেম্বর ২০২৬',
    estimatedCost: '১.৯০ কোটি টাকা',
    securityMoney: '৫,০০,০০০ টাকা',
    location: 'গাজীপুর সদর',
    category: 'supply',
    excerpt: 'উন্নত গবেষণাগারের জন্য স্পেকট্রোফটোমিটার, পিএইচ মিটার, সেন্ট্রিফিউজ মেশিন ও বায়োকেমিক্যাল রিএজেন্ট সরবরাহ।',
    fullDetails: [
      'সরবরাহ সামগ্রী: আন্তর্জাতিক মানসম্পন্ন ল্যাব যন্ত্রপাতি ও কেমিক্যাল রিএজেন্ট।',
      'ওয়ারেন্টি: যন্ত্রপাতিতে ন্যূনতম ২ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি থাকতে হবে।',
      'দরপত্র জমাদানের শেষ তারিখ: ১০ নভেম্বর ২০২৬।'
    ],
    documentUrl: 'https://bari.gov.bd'
  }
];

interface TendersPageProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onGoHome: () => void;
}

export const TendersPage: React.FC<TendersPageProps> = ({ articles, onSelectArticle, onGoHome }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hideExpiredTenders, setHideExpiredTenders] = useState<boolean>(true);
  const [selectedTender, setSelectedTender] = useState<TenderNotice | null>(null);
  const [emailAlert, setEmailAlert] = useState<string>('');
  const [alertSubmitted, setAlertSubmitted] = useState<boolean>(false);

  // Filter tenders based on type, category, search query, and expiry status
  const filteredTenders = MOCK_TENDER_NOTICES.filter((tender) => {
    // Expiry filter
    if (hideExpiredTenders && isTenderExpired(tender.deadline)) {
      return false;
    }
    // Type filter
    if (selectedType !== 'all' && tender.tenderType !== selectedType) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && tender.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = tender.title.toLowerCase().includes(q);
      const matchOrg = tender.organization.toLowerCase().includes(q);
      const matchNumber = tender.tenderNumber.toLowerCase().includes(q);
      const matchLocation = tender.location.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchNumber && !matchLocation) {
        return false;
      }
    }
    return true;
  });

  const handleEmailSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailAlert.trim()) {
      setAlertSubmitted(true);
      setTimeout(() => {
        setAlertSubmitted(false);
        setEmailAlert('');
      }, 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Hero Banner (Matching JobsPage Palette: Slate to Red-950) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
              <FileText className="w-4 h-4 text-red-400 animate-pulse" />
              <span>ই-জিপি ও উন্মুক্ত টেন্ডার হাব</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              সরকারি ও বেসরকারি <span className="text-red-400">টেন্ডার বিজ্ঞপ্তি</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              দেশের সকল সরকারি, স্বায়ত্তশাসিত ও করপোরেট প্রতিষ্ঠানের ই-টেন্ডার (e-GP), সিভিল কনস্ট্রাকশন, সাপ্লাই ও প্রকিউরমেন্ট বিজ্ঞপ্তির রিয়েল-টাইম আপডেট।
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3.5 rounded-2xl text-center">
              <span className="block text-2xl sm:text-3xl font-black text-red-400">
                {MOCK_TENDER_NOTICES.filter(t => !isTenderExpired(t.deadline)).length}
              </span>
              <span className="text-xs text-slate-300 font-medium">চলমান টেন্ডার</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3.5 rounded-2xl text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400">e-GP</span>
              <span className="text-xs text-slate-300 font-medium">অনলাইন প্রকিউরমেন্ট</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Type Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'সকল টেন্ডার' },
              { id: 'govt', label: 'সরকারি (Govt)' },
              { id: 'e-gp', label: 'ই-জিপি (e-GP)' },
              { id: 'autonomous', label: 'স্বায়ত্তশাসিত' },
              { id: 'private', label: 'বেসরকারি (Private)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="টেন্ডার বা সংস্থার নাম খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
        </div>

        {/* Secondary Category & Expiry Filter Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> ক্যাটাগরি:
            </span>
            {[
              { id: 'all', label: 'সব খাত' },
              { id: 'construction', label: 'নির্মাণ ও সিভিল' },
              { id: 'supply', label: 'সাপ্লাই ও প্রকিউরমেন্ট' },
              { id: 'ict', label: 'আইসিটি ও প্রযুক্তি' },
              { id: 'maintenance', label: 'রক্ষণাবেক্ষণ' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Hide Expired Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideExpiredTenders}
                onChange={(e) => setHideExpiredTenders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-700">চলমান টেন্ডার ফিল্টার (মেয়াদ আছে)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tenders Grid */}
      {filteredTenders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">কোনো টেন্ডার পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সক্রিয় টেন্ডার বিজ্ঞপ্তি নেই অথবা মেয়াদ শেষ হয়ে গেছে।
          </p>
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedCategory('all');
              setSearchQuery('');
              setHideExpiredTenders(false);
            }}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer inline-block"
          >
            সব টেন্ডার দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTenders.map((tender) => {
            const deadlineInfo = getTenderDaysLeft(tender.deadline);
            return (
              <div 
                key={tender.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  {/* Top Badge & Tender Number */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-extrabold">
                      <Building2 className="w-3.5 h-3.5" />
                      {tender.organization}
                    </span>
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                      {tender.tenderNumber}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 
                    onClick={() => setSelectedTender(tender)}
                    className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors cursor-pointer leading-snug line-clamp-2"
                  >
                    {tender.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {tender.excerpt}
                  </p>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 pb-1 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 font-medium block">আনুমানিক প্রাক্কলন:</span>
                      <span className="font-bold text-slate-800">{tender.estimatedCost}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 font-medium block">জামানত (Security):</span>
                      <span className="font-bold text-slate-800">{tender.securityMoney}</span>
                    </div>
                  </div>

                  {/* Location & Category & Source */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs text-slate-500 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {tender.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                        {tender.tenderType.toUpperCase()} Tender
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-slate-700 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>উৎস ও দরপত্র পোর্টাল: <strong className="text-red-600">{tender.sourcePortalName || tender.organization}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Deadline & Action */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${deadlineInfo.isUrgent ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-[11px] text-slate-500 block leading-none">শেষ তারিখ: {tender.deadline}</span>
                      <span className={`text-xs font-bold mt-0.5 inline-block ${
                        deadlineInfo.isUrgent 
                          ? 'text-amber-600' 
                          : deadlineInfo.isExpired 
                          ? 'text-slate-400' 
                          : 'text-emerald-600'
                      }`}>
                        {deadlineInfo.text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {tender.documentUrl && tender.documentUrl !== '#' && (
                      <a
                        href={tender.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
                        title="অফিসিয়াল দরপত্র পোর্টালে যান"
                      >
                        <span>অফিসিয়াল লিংক</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedTender(tender)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>বিস্তারিত</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Email Alert Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold">
            <Bell className="w-3.5 h-3.5 text-red-400" />
            <span>টেন্ডার অ্যালার্ট সাবস্ক্রিপশন</span>
          </div>
          <h3 className="text-xl font-black">নতুন টেন্ডার প্রকাশের সাথে সাথে নোটিফিকেশন পান</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            আপনার ইমেইল ঠিকানা দিয়ে সাবস্ক্রাইব করুন। প্রতিদিনের নতুন সরকারি ও বেসরকারি টেন্ডার নোটিশ আপনার ইনবক্সে পৌঁছে যাবে।
          </p>
        </div>

        <form onSubmit={handleEmailSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
          <input
            type="email"
            required
            placeholder="আপনার ইমেইল লিখুন..."
            value={emailAlert}
            onChange={(e) => setEmailAlert(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 w-full sm:w-72"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            সাবস্ক্রাইব
          </button>
        </form>

        {alertSubmitted && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>ধন্যবাদ! সফলভাবে টেন্ডার অ্যালার্ট সাবস্ক্রাইব করা হয়েছে।</span>
          </div>
        )}
      </div>

      {/* Tender Detail Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white relative">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="bg-red-500/30 text-red-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  {selectedTender.tenderType} TENDER
                </span>
                <span className="text-xs font-mono bg-white/10 px-3 py-1 rounded-lg text-slate-200">
                  {selectedTender.tenderNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black leading-tight text-white">
                {selectedTender.title}
              </h2>
              <button
                onClick={() => setSelectedTender(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Organization & Location Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">প্রতিষ্ঠান / সংস্থা:</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedTender.organization}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">কাজের স্থান:</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedTender.location}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">আনুমানিক প্রাক্কলন মূল্য:</span>
                  <p className="font-bold text-red-600 text-sm">{selectedTender.estimatedCost}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">জামানত (Earnest Money):</span>
                  <p className="font-bold text-emerald-600 text-sm">{selectedTender.securityMoney}</p>
                </div>
              </div>

              {/* Deadline & Publish Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-red-50/60 border border-red-100 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span>প্রকাশের তারিখ: <strong className="text-slate-900">{selectedTender.publishingDate}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>জমাদানের শেষ তারিখ: <strong className="text-amber-700">{selectedTender.deadline}</strong></span>
                </div>
              </div>

              {/* Full Details / Terms */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  টেন্ডারের বিস্তারিত শর্তাবলী ও স্পেসিফিকেশন
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  {selectedTender.fullDetails.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={selectedTender.documentUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ই-জিটি / অফিশিয়াল ওয়েবসাইটে টেন্ডার দেখুন</span>
                </a>
                <button
                  onClick={() => setSelectedTender(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
