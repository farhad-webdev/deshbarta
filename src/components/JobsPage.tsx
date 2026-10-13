import React, { useState } from 'react';
import { 
  Briefcase, 
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
  GraduationCap, 
  DollarSign, 
  AlertCircle,
  ChevronRight,
  FileText,
  UserCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Article } from '../types';

export interface JobCircular {
  id: string;
  title: string;
  organization: string;
  organizationType: 'govt' | 'bank' | 'teaching' | 'defense' | 'ngo' | 'private';
  logoUrl?: string;
  designation: string;
  vacancies: string;
  qualification: string;
  location: string;
  salary: string;
  deadline: string;
  deadlineDaysLeft?: number;
  publishedAt: string;
  applyUrl: string;
  excerpt: string;
  fullDetails: string[];
  articleRef?: Article;
}

// Date parsing and deadline expiry helper functions
export const bnToEnNums = (str: string): string => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (d) => bn.indexOf(d).toString());
};

export const parseDeadlineDate = (deadlineStr: string): Date | null => {
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

export const isJobExpired = (deadlineStr: string): boolean => {
  if (!deadlineStr) return false;
  if (deadlineStr.includes('মেয়াদ শেষ') || deadlineStr.includes('সমাপ্ত') || deadlineStr.includes('expired')) {
    return true;
  }
  const deadlineDate = parseDeadlineDate(deadlineStr);
  if (!deadlineDate) return false;

  const now = new Date();
  return deadlineDate.getTime() < now.getTime();
};

export const getDaysLeft = (deadlineStr: string): number | null => {
  const deadlineDate = parseDeadlineDate(deadlineStr);
  if (!deadlineDate) return null;
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Curated Real-World Bangladesh Job Circulars
export const MOCK_JOB_CIRCULARS: JobCircular[] = [
  {
    id: 'job-1',
    title: 'বাংলাদেশ ব্যাংকে সহকারী পরিচালক (এডি) পদে বিপুল সংখ্যক নিয়োগ বিজ্ঞপ্তি',
    organization: 'বাংলাদেশ ব্যাংক',
    organizationType: 'bank',
    designation: 'সহকারী পরিচালক (General)',
    vacancies: '২২৫ জন',
    qualification: 'যেকোনো বিষয়ে প্রথম শ্রেণী/সমমানের সিজিপিএসহ স্নাতকোত্তর বা ৪ বছর মেয়াদি স্নাতক',
    location: 'ঢাকা (প্রধান কার্যালয় ও শাখা অফিসসমূহ)',
    salary: '২২,০০০ - ৫৩,০৬০ টাকা (জাতীয় বেতন স্কেল ৯ম গ্রেড) + অন্যান্য সরকারি ভাতা',
    deadline: '২৮ অক্টোবর ২০২৬',
    publishedAt: 'আজ প্রকাশিত',
    applyUrl: 'https://erecruitment.bb.org.bd',
    excerpt: 'বাংলাদেশ ব্যাংকে নবম গ্রেডে সহকারী পরিচালক পদে মেধাভিত্তিক নিয়োগ পরীক্ষার অনলাইন আবেদন শুরু হয়েছে। টেলিটক পরীক্ষার ফিসহ অনলাইন প্রক্রিয়ায় আবেদন গ্রহণ করা হচ্ছে।',
    fullDetails: [
      'বাংলাদেশ ব্যাংকের মানবসম্পদ বিভাগ কর্তৃক প্রকাশিত নিয়োগ বিজ্ঞপ্তি অনুযায়ী সহকারী পরিচালক (সাধারণ) পদে মোট ২২৫ জনকে নিয়োগ দেওয়া হবে।',
      'আবেদনের বয়সসীমা: প্রার্থীর বয়স সর্বোচ্চ ৩০ বছর হতে হবে (মুক্তিযোদ্ধা কোটা ও শারীরিক প্রতিবন্ধীদের ক্ষেত্রে ৩২ বছর)।',
      'আবেদন ফি: প্রিলিমিনারি ও লিখিত পরীক্ষার ফি বাবদ ২০০ টাকা অনলাইন পেমেন্ট গেটওয়ের মাধ্যমে পরিশোধ করতে হবে।',
      'বাছাই প্রক্রিয়া: ২০০ নম্বরের প্রিলিমিনারি এমসিকিউ পরীক্ষা, ২০০ নম্বরের লিখিত পরীক্ষা এবং ৫০ নম্বরের মৌখিক পরীক্ষার মাধ্যমে চূড়ান্ত প্রার্থী নির্বাচন করা হবে।',
      'অনলাইন আবেদনের শেষ তারিখ: ২৮ অক্টোবর ২০২৬ রাত ১১:৫৯ মিনিট পর্যন্ত।'
    ]
  },
  {
    id: 'job-2',
    title: '৪৬তম বিসিএস প্রিলিমিনারি ও লিখিত পরীক্ষার পুনঃতফসিল ও আসন বিন্যাস প্রকাশ',
    organization: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    organizationType: 'govt',
    designation: 'বিসিএস (প্রশাসন, পুলিশ, পররাষ্ট্র, কর, স্বাস্থ্যসহ অন্যান্য ক্যাডার)',
    vacancies: '৩,১০০+ জন',
    qualification: 'স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক বা সমমানের ডিগ্রি',
    location: 'সারাদেশে ৮টি বিভাগীয় শহর',
    salary: '২২,০০০ - ৫৩,০৬০ টাকা (গ্রেড-৯)',
    deadline: '০৫ নভেম্বর ২০২৬',
    publishedAt: 'গতকাল',
    applyUrl: 'http://bpsc.teletalk.com.bd',
    excerpt: 'বিপিএসসি কতৃক ৪৬তম বিসিএস এর নতুন সময়সূচি জারি করা হয়েছে। দেশের ৮টি বিভাগীয় শহরের কেন্দ্রে একযোগে ২০০ নম্বরের এমসিকিউ পরীক্ষা অনুষ্ঠিত হবে।',
    fullDetails: [
      'বাংলাদেশ সরকারি কর্ম কমিশন (পিএসসি) ৪৬তম ক্যাডার পরীক্ষার সংশোধিত নির্দেশিকা প্রকাশ করেছে।',
      'পরীক্ষার হলে প্রবেশের নিয়মাবলী: সকাল ৯:৩০ মিনিটে হলের গেট বন্ধ হবে। প্রবেশপত্র, ২বি পেন্সিল ও বলপেন ব্যতীত অন্য কোনো ইলেক্ট্রনিক ডিভাইস গ্রহণ করা হবে না।',
      'মোট শূন্য পদ: ক্যাডার পদে ২,৭১০ জন এবং নন-ক্যাডার পদে ৪৪০ জনসহ সর্বমোট ৩,১০০+ পদ বরাদ্দ রয়েছে।'
    ]
  },
  {
    id: 'job-3',
    title: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ ২০২৬: ৩য় ধাপের পরীক্ষা ও লিখিত বিজ্ঞপ্তি',
    organization: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    organizationType: 'teaching',
    designation: 'সহকারী শিক্ষক (সরকারি প্রাথমিক বিদ্যালয়)',
    vacancies: '১৩,০০০+ জন',
    qualification: 'নূন্যতম ২য় বিভাগ বা সমমানের সিজিপিএসহ স্নাতক/সমমান ডিগ্রি',
    location: 'নিজ নিজ উপজেলা/থানা এলাকা',
    salary: '১১,০০০ - ২৬,৫ ৯০ টাকা (জাতীয় বেতন স্কেল ১৩শ গ্রেড)',
    deadline: '২০ অক্টোবর ২০২৬',
    publishedAt: '২ দিন আগে',
    applyUrl: 'http://dpe.teletalk.com.bd',
    excerpt: 'সরকারি প্রাথমিক বিদ্যালয়ে সহকারী শিক্ষক পদের নিয়োগ পরীক্ষার ৩য় ধাপের আবেদন ও এডমিট কার্ড ডাউনলোড শুরু হয়েছে। প্রার্থীরা মোবাইল এসএমএস বার্তা পাচ্ছেন।',
    fullDetails: [
      'প্রাথমিক শিক্ষা অধিদপ্তর কর্তৃক সারাদেশে প্রাথমিক বিদ্যালয়ে সহকারী শিক্ষক পদে নতুন সার্কুলারের চূড়ান্ত পর্ব শুরু হয়েছে।',
      'প্রার্থী বাছাই পদ্ধতি: ৮০ নম্বরের লিখিত এমসিকিউ পরীক্ষা এবং ২০ নম্বরের ভাইভা বোর্ড মূল্যায়নের ভিত্তিতে চূড়ান্ত ফল প্রকাশ করা হবে।',
      'উপজেলা ভিত্তিক মেধা তালিকা অনুসরণে শূন্য পদের বিপরীতে শিক্ষক পদে পদায়ন করা হবে।'
    ]
  },
  {
    id: 'job-4',
    title: 'বাংলাদেশ সেনাবাহিনীতে ৮৯তম বিএমএ দীর্ঘমেয়াদী কোর্সে অফিসার ক্যাডেট পদে নিয়োগ',
    organization: 'বাংলাদেশ সেনাবাহিনী',
    organizationType: 'defense',
    designation: 'অফিসার ক্যাডেট (কমিশনড অফিসার)',
    vacancies: 'নির্দিষ্ট নয় (বিপুল চাহিদা)',
    qualification: 'এইচএসসি/সমমান পরীক্ষায় নূন্যতম জিপিএ ৪.৫০ ও এসএসসি পরীক্ষায় জিপিএ ৫.০০',
    location: 'বাংলাদেশ মিলিটারি একাডেমি (বিএমএ), ভাটিয়ারী, চট্টগ্রাম',
    salary: 'প্রশিক্ষণকালীন ভাতা ও পরবর্তীতে সেনাসদস্যদের নির্ধারিত বেতন গ্রেড ও ফ্রি রেশনিং',
    deadline: '১৫ নভেম্বর ২০২৬',
    publishedAt: '৩ দিন আগে',
    applyUrl: 'https://joinbangladesharmy.army.mil.bd',
    excerpt: 'সেনাবাহিনীতে সরাসরি নিয়মিত কমিশন লাভের সুযোগ। ৮৯তম বিএমএ লং কোর্সে শারীরিক ও মানসিক যোগ্যতা সম্পন্ন পুরুষ ও মহিলা প্রার্থীদের নিকট আবেদন আহ্বান করা হচ্ছে।',
    fullDetails: [
      'শারীরিক যোগ্যতা: পুরুষ প্রার্থীদের ক্ষেত্রে উচ্চতা ৫ ফুট ৪ ইঞ্চি, ওজন ৫০ কেজি। মহিলা প্রার্থীদের ক্ষেত্রে উচ্চতা ৫ ফুট ২ ইঞ্চি, ওজন ৪৭ কেজি।',
      'আইএসএসবি (ISSB) পরীক্ষা: প্রাথমিক শারীরিক ও মৌখিক পরীক্ষায় উত্তীর্ণদের ৪ দিনব্যাপী আইএসএসবি পরীক্ষায় অংশগ্রহণ করতে হবে।',
      'সুযোগ-সুবিধা: বিনামূল্যে চিকিৎসা, উন্নত বাসস্থান, দেশে-বিদেশে উচ্চতর প্রশিক্ষণ ও জাতিসংঘ শান্তিরক্ষা মিশনে অংশগ্রহণের সুযোগ।'
    ]
  },
  {
    id: 'job-5',
    title: 'ব্র্যাক (BRAC) এনজিওতে ফিল্ড অফিসার ও প্রজেক্ট ম্যানেজার পদে নিয়োগ বিজ্ঞপ্তি',
    organization: 'ব্র্যাক (BRAC Bangladesh)',
    organizationType: 'ngo',
    designation: 'প্রজেক্ট কো-অর্ডিনেটর ও ফিল্ড ম্যানেজার',
    vacancies: '৮৫ জন',
    qualification: 'স্নাতক/স্নাতকোত্তর, সংশ্লিষ্ট ক্ষেত্রে ২ বছরের অভিজ্ঞতা',
    location: 'রংপুর, রাজশাহী, বরিশাল ও সিলেট বিভাগ',
    salary: '৩৫,০০০ - ৫৫,০০০ টাকা (অভিজ্ঞতা অনুযায়ী negotiable) + বোনাস ও প্রভিডেন্ট ফান্ড',
    deadline: '৩০ অক্টোবর ২০২৬',
    publishedAt: '৪ দিন আগে',
    applyUrl: 'https://careers.brac.net',
    excerpt: 'বিশ্বের বৃহত্তম বেসরকারি উন্নয়ন সংস্থা ব্র্যাকে মাইক্রোফাইন্যান্স ও লার্নিং প্রজেক্টের অধীন বিভিন্ন আঞ্চলিক কার্যালয়ে কর্মঠ কর্মকর্তা পদে দরখাস্ত আহ্বান করা হচ্ছে।',
    fullDetails: [
      'দায়িত্বসমূহ: মাঠ পর্যায়ে সুবিধাভোগীদের তালিকা প্রস্তুত, ঋণ বিতরণ তদারকি ও প্রজেক্ট রিপোর্ট প্রস্তুতকরণ।',
      'অন্যান্য সুবিধা: উৎসব ভাতা, গ্র্যাচুইটি, হেলথ ইন্স্যুরেন্স ও মোবাইল বিল ভাতা প্রদান করা হবে।'
    ]
  },
  {
    id: 'job-6',
    title: 'স্কয়ার ফার্মাসিউটিক্যালসে ট্রেইনি এক্সিকিউটিভ (কোয়ালিটি কন্ট্রোল) পদে নিয়োগ',
    organization: 'স্কয়ার ফার্মাসিউটিক্যালস লিমিটেড',
    organizationType: 'private',
    designation: 'ট্রেইনি এক্সিকিউটিভ (QC/R&D)',
    vacancies: '৩০ জন',
    qualification: 'রসায়ন/ফার্মেসি/বায়োকেমিস্ট্রিতে বিএসসি বা এমএসসি',
    location: 'পাবনা ও কালিয়াকৈর প্ল্যান্ট',
    salary: '৪০,০০০ - ৫০,০০০ টাকা + প্রভিডেন্ট ফান্ড, গ্র্যাচুইটি ও প্রফিট শেয়ার',
    deadline: '১২ নভেম্বর ২০২৬',
    publishedAt: 'আজ প্রকাশিত',
    applyUrl: 'https://squarepharma.com.bd/careers',
    excerpt: 'দেশের শীর্ষস্থানীয় ওষুধ প্রস্তুতকারক প্রতিষ্ঠান স্কয়ার ফার্মায় তরুণ ও উদ্যমী স্নাতকদের আকর্ষনীয় বেতন ভ্যকনসিতে ক্যারিয়ার গড়ার সুযোগ দেওয়া হচ্ছে।',
    fullDetails: [
      'শিক্ষাগত যোগ্যতা: খ্যাতনামা বিশ্ববিদ্যালয় হতে B.Pharm অথবা M.Sc in Chemistry/Applied Chemistry.',
      'আবেদনের নিয়ম: স্কয়ার ফার্মার অফিসিয়াল ক্যারিয়ার পোর্টালে সিভি আপলোড ও অনলাইন ফর্ম পূরণ করতে হবে।'
    ]
  },
  {
    id: 'job-7-expired',
    title: 'পল্লি বিদ্যুতায়ন বোর্ডে ডাটা এন্ট্রি অপারেটর ও জুনিয়র ইঞ্জিনিয়ার পদে নিয়োগ',
    organization: 'বাংলাদেশ পল্লি বিদ্যুতায়ন বোর্ড',
    organizationType: 'govt',
    designation: 'ডাটা এন্ট্রি অপারেটর',
    vacancies: '১২০ জন',
    qualification: 'এইচএসসি বা ডিপ্লোমা',
    location: 'ঢাকা',
    salary: '১৮,০০০ - ৩৮,৬৪০ টাকা',
    deadline: '০৫ সেপ্টেম্বর ২০২৬',
    publishedAt: 'গত মাসে',
    applyUrl: '#',
    excerpt: 'পল্লি বিদ্যুতায়ন বোর্ডে শূন্য পদে লোকবল নিয়োগের বিজ্ঞপ্তি প্রকাশ করা হয়েছিল। আবেদনের সময়সীমা শেষ হয়ে গেছে।',
    fullDetails: ['আবেদনের মেয়াদ ০৫ সেপ্টেম্বর ২০২৬ তারিখ শেষ হয়ে গেছে।']
  }
];

interface JobsPageProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onGoHome: () => void;
  savedArticleIds: string[];
  onToggleSave: (article: Article) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({
  articles,
  onSelectArticle,
  onGoHome,
  savedArticleIds,
  onToggleSave,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCircular, setSelectedCircular] = useState<JobCircular | null>(null);
  const [emailAlert, setEmailAlert] = useState<string>('');
  const [alertSubmitted, setAlertSubmitted] = useState<boolean>(false);
  const [hideExpiredJobs, setHideExpiredJobs] = useState<boolean>(true);

  // Combine curated circulars with live news articles tagged or categorized under 'jobs'/'চাকরি'
  const liveJobArticles = articles.filter((art) => {
    const text = `${art.title} ${art.excerpt} ${art.category} ${art.categorySlug} ${(art.tags || []).join(' ')}`.toLowerCase();
    return (
      art.categorySlug === 'jobs' ||
      art.category === 'চাকরি' ||
      text.includes('চাকরি') ||
      text.includes('নিয়োগ') ||
      text.includes('সার্কুলার') ||
      text.includes('circular') ||
      text.includes('বিসিএস') ||
      text.includes('কর্মসংস্থান')
    );
  });

  // Convert live news articles into JobCircular format if needed
  const convertedLiveCirculars: JobCircular[] = liveJobArticles.map((art) => ({
    id: `live-job-${art.id}`,
    title: art.title,
    organization: art.publisherBengali || art.author || 'নিয়োগকারী প্রতিষ্ঠান',
    organizationType: art.title.includes('ব্যাংক') ? 'bank' : art.title.includes('বিসিএস') || art.title.includes('সরকারি') ? 'govt' : 'private',
    designation: 'নিয়োগপ্রাপ্ত পদ',
    vacancies: art.excerpt.match(/\d+\s*জন/)?.[0] || 'বিজ্ঞপ্তি দেখুন',
    qualification: 'বিজ্ঞপ্তি অনুযায়ী স্নাতক/এইচএসসি',
    location: 'বাংলাদেশ',
    salary: 'সরকারি/প্রতিষ্ঠানের নিয়মানুযায়ী',
    deadline: 'বিস্তারিত বিজ্ঞপ্তিতে দেখুন',
    publishedAt: art.timeAgo || 'সদ্য প্রকাশিত',
    applyUrl: art.sourceUrl || '#',
    excerpt: art.excerpt,
    fullDetails: art.content && art.content.length > 0 ? art.content : [art.excerpt],
    articleRef: art
  }));

  // Merge mock list + converted live circulars (removing duplicates by title)
  const allCirculars: JobCircular[] = [
    ...MOCK_JOB_CIRCULARS,
    ...convertedLiveCirculars.filter(lc => !MOCK_JOB_CIRCULARS.some(mc => mc.title === lc.title))
  ];

  // Filter logic
  const filteredCirculars = allCirculars.filter((job) => {
    // 1. Hide expired jobs if toggle is active
    if (hideExpiredJobs && isJobExpired(job.deadline)) {
      return false;
    }

    // 2. Type filter
    if (selectedType !== 'all') {
      if (selectedType === 'govt' && job.organizationType !== 'govt') return false;
      if (selectedType === 'bank' && job.organizationType !== 'bank') return false;
      if (selectedType === 'teaching' && job.organizationType !== 'teaching') return false;
      if (selectedType === 'defense' && job.organizationType !== 'defense') return false;
      if (selectedType === 'ngo' && job.organizationType !== 'ngo' && job.organizationType !== 'private') return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchOrg = job.organization.toLowerCase().includes(q);
      const matchDesig = job.designation.toLowerCase().includes(q);
      const matchExcerpt = job.excerpt.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchDesig && !matchExcerpt) return false;
    }

    return true;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailAlert.trim()) {
      setAlertSubmitted(true);
      setTimeout(() => setAlertSubmitted(false), 4000);
      setEmailAlert('');
    }
  };

  const getTypeBadge = (type: JobCircular['organizationType']) => {
    switch (type) {
      case 'govt':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded border border-emerald-200">সরকারি চাকরি</span>;
      case 'bank':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200">ব্যাংক চাকরি</span>;
      case 'teaching':
        return <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded border border-amber-200">শিক্ষক নিয়োগ</span>;
      case 'defense':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-200">ডিফেন্স ও পুলিশ</span>;
      case 'ngo':
        return <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded border border-teal-200">এনজিও</span>;
      default:
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded border border-purple-200">বেসরকারি</span>;
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Briefcase className="w-4 h-4 text-red-400" />
            <span>দেশবার্তা চাকরি ও ক্যারিয়ার হাব</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            বাংলাদেশের সকল আপডেট <span className="text-red-400">চাকরির খবর</span> ও নিয়োগ বিজ্ঞপ্তি
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            বিসিএস, সরকারি দপ্তর, ব্যাংক, শিক্ষক নিয়োগ, ডিফেন্স এবং শীর্ষ এনজিও ও কর্পোরেট প্রতিষ্ঠানের যাচাইকৃত খবর এক জায়গায়।
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-2xl">
            <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-1.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-500/30 transition-all">
              <Search className="w-5 h-5 text-slate-300 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="পদ, প্রতিষ্ঠান বা কিওয়ার্ড দিয়ে খুঁজুন (যেমন: বাংলাদেশ ব্যাংক, সহকারী শিক্ষক, বিসিএস)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-400 text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1"
                >
                  মুছুন
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedType === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>সব চাকরি ({filteredCirculars.length})</span>
          </button>

          <button
            onClick={() => setSelectedType('govt')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedType === 'govt'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>সরকারি চাকরি</span>
          </button>

          <button
            onClick={() => setSelectedType('bank')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedType === 'bank'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>ব্যাংক চাকরি</span>
          </button>

          <button
            onClick={() => setSelectedType('teaching')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedType === 'teaching'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>শিক্ষক নিয়োগ</span>
          </button>

          <button
            onClick={() => setSelectedType('defense')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedType === 'defense'
                ? 'bg-red-700 text-white shadow-md shadow-red-700/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>ডিফেন্স ও পুলিশ</span>
          </button>

          <button
            onClick={() => setSelectedType('ngo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedType === 'ngo'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>এনজিও ও বেসরকারি</span>
          </button>
        </div>

        {/* Filter Expired Toggle Button */}
        <button
          onClick={() => setHideExpiredJobs(!hideExpiredJobs)}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            hideExpiredJobs
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
          }`}
          title="মেয়াদোত্তীর্ণ সার্কুলার হাইড/শো করতে ক্লিক করুন"
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${hideExpiredJobs ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span>{hideExpiredJobs ? 'শুধুমাত্র চলমান নিয়োগ (মেয়াদোত্তীর্ণ মুক্ত)' : 'মেয়াদোত্তীর্ণ সহ সব চাকরি'}</span>
        </button>
      </div>

      {/* Circular Grid Container */}
      {filteredCirculars.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">কোনো চলমান চাকরির খবর পাওয়া যায়নি</h3>
          <p className="text-slate-500 text-sm">আপনার ফিল্টার পরিবর্তন করুন অথবা মেয়াদোত্তীর্ণ সার্কুলারগুলো দেখতে ফিল্টার অপশন পরিবর্তন করুন।</p>
          <button
            onClick={() => {
              setSelectedType('all');
              setSearchQuery('');
              setHideExpiredJobs(false);
            }}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            সব সার্কুলার দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCirculars.map((job) => {
            const daysLeft = getDaysLeft(job.deadline);
            const expired = isJobExpired(job.deadline);

            return (
              <div
                key={job.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Card Header & Badges */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-base shrink-0 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200 transition-colors">
                        <Briefcase className="w-5 h-5 text-slate-600 group-hover:text-red-600" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {job.organization}
                        </div>
                        <div className="mt-0.5">
                          {getTypeBadge(job.organizationType)}
                        </div>
                      </div>
                    </div>

                    {expired ? (
                      <span className="shrink-0 bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-slate-400" />
                        <span>মেয়াদ শেষ</span>
                      </span>
                    ) : daysLeft !== null && daysLeft <= 10 ? (
                      <span className="shrink-0 bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span>{daysLeft === 0 ? 'আজই শেষ দিন' : `${daysLeft} দিন বাকি`}</span>
                      </span>
                    ) : daysLeft !== null ? (
                      <span className="shrink-0 bg-amber-50 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{daysLeft} দিন বাকি</span>
                      </span>
                    ) : (
                      <span className="shrink-0 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>চলমান নিয়োগ</span>
                      </span>
                    )}
                  </div>

                {/* Circular Title */}
                <h2 
                  onClick={() => {
                    if (job.articleRef) {
                      onSelectArticle(job.articleRef);
                    } else {
                      setSelectedCircular(job);
                    }
                  }}
                  className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                >
                  {job.title}
                </h2>

                {/* Info Pills */}
                <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">পদবী:</span>
                    <span className="truncate">{job.designation}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">পদ সংখ্যা:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{job.vacancies}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">যোগ্যতা:</span>
                    <span className="truncate">{job.qualification}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="font-medium text-slate-800">আবেদনের শেষ সময়:</span>
                    <span className="font-semibold text-red-600">{job.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (job.articleRef) {
                      onSelectArticle(job.articleRef);
                    } else {
                      setSelectedCircular(job);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 group-hover:translate-x-0.5 transition-all"
                >
                  <span>বিস্তারিত ও সার্কুলার</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {job.applyUrl && job.applyUrl !== '#' && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded transition-colors shadow-xs"
                      title="অফিসিয়াল আবেদন পোর্টালে যান"
                    >
                      <span>আবেদন লিংক</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Free Job Alert Newsletter Box */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
            <span className="font-bold text-base text-amber-200 uppercase tracking-wide">ফ্রি জব এলার্ট 서비스</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">প্রতিদিনের সেরা সরকারি ও ব্যাংক চাকরির নোটিফিকেশন পান</h3>
          <p className="text-red-100 text-xs sm:text-sm max-full max-w-xl">
            কোনো আবেদন ফরমের শেষ তারিখ মিস করবেন না! আপনার ইমেইল প্রদান করে নিয়মিত নোটিফিকেশন পান।
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="আপনার ইমেইল এড্রেস লিখুন..."
            value={emailAlert}
            onChange={(e) => setEmailAlert(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full sm:w-72"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2 shadow-md"
          >
            <span>সাবস্ক্রাইব করুন</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </button>
        </form>
      </div>

      {alertSubmitted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-sm font-semibold animate-fade-in">
          ধন্যবাদ! আপনার ইমেইল সফলভাবে নিবন্ধিত হয়েছে। এখন থেকে প্রতিদিনের সেরা চাকরির খবর আপনার ইমেইলে পৌছে যাবে।
        </div>
      )}

      {/* Job Circular Detail Modal */}
      {selectedCircular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-red-600" />
                <span className="font-bold text-slate-800 text-sm">চাকরির বিস্তারিত সার্কুলার</span>
              </div>
              <button
                onClick={() => setSelectedCircular(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getTypeBadge(selectedCircular.organizationType)}
                  <span className="text-xs text-slate-500">{selectedCircular.publishedAt}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {selectedCircular.title}
                </h2>
                <p className="text-sm font-semibold text-red-600 mt-1">
                  {selectedCircular.organization}
                </p>
              </div>

              {/* Summary Table Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">পদবী:</span>
                  <span className="font-bold text-slate-800">{selectedCircular.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">পদ সংখ্যা:</span>
                  <span className="font-bold text-emerald-700">{selectedCircular.vacancies}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">শিক্ষাগত যোগ্যতা:</span>
                  <span className="font-bold text-slate-800">{selectedCircular.qualification}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">বেতন স্কেল:</span>
                  <span className="font-bold text-slate-800">{selectedCircular.salary}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">কর্মস্থল:</span>
                  <span className="font-bold text-slate-800">{selectedCircular.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">আবেদনের শেষ তারিখ:</span>
                  <span className="font-bold text-red-600">{selectedCircular.deadline}</span>
                </div>
              </div>

              {/* Details Paragraphs */}
              <div className="space-y-3 text-slate-700 text-sm leading-relaxed border-t border-slate-100 pt-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>বিজ্ঞপ্তির বিস্তারিত তথ্য ও নিয়মাবলী:</span>
                </h3>
                {selectedCircular.fullDetails.map((para, i) => (
                  <p key={i} className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {para}
                  </p>
                ))}
              </div>

              {/* External Apply Button Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  অফিসিয়াল পোর্টালে সরাসরি গিয়ে অনলাইনে আবেদন ফি জমাদান ও ছবি আপলোড সম্পন্ন করুন।
                </div>
                {selectedCircular.applyUrl && selectedCircular.applyUrl !== '#' && (
                  <a
                    href={selectedCircular.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                  >
                    <span>অনলাইনে আবেদন করুন</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
