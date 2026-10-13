import { Article } from '../types';
import { cleanText } from './textUtils';

interface RssSource {
  publisher: string;
  publisherName: string;
  color: string;
  category: string;
  feedUrl: string;
  defaultImage: string;
}

const RSS_FEEDS: RssSource[] = [
  {
    publisher: 'প্রথম আলো',
    publisherName: 'prothomalo',
    color: '#0284c7',
    category: 'জাতীয়',
    feedUrl: 'https://www.prothomalo.com/feed',
    defaultImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    publisher: 'বিবিসি বাংলা',
    publisherName: 'bbcbangla',
    color: '#bb1919',
    category: 'আন্তর্জাতিক',
    feedUrl: 'https://feeds.bbci.co.uk/bengali/rss.xml',
    defaultImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  },
  {
    publisher: 'বিডিনিউজ২৪',
    publisherName: 'bdnews24',
    color: '#e11d48',
    category: 'জাতীয়',
    feedUrl: 'https://news.google.com/rss/search?q=site:bangla.bdnews24.com&hl=bn&gl=BD&ceid=BD:bn',
    defaultImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  },
  {
    publisher: 'কালের কণ্ঠ',
    publisherName: 'kalerkantho',
    color: '#dc2626',
    category: 'রাজনীতি',
    feedUrl: 'https://news.google.com/rss/search?q=site:kalerkantho.com&hl=bn&gl=BD&ceid=BD:bn',
    defaultImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    publisher: 'কালবেলা',
    publisherName: 'kalbela',
    color: '#ea580c',
    category: 'অর্থনীতি',
    feedUrl: 'https://news.google.com/rss/search?q=site:kalbela.com&hl=bn&gl=BD&ceid=BD:bn',
    defaultImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
  },
  {
    publisher: 'দৈনিক ইত্তেফাক',
    publisherName: 'ittefaq',
    color: '#15803d',
    category: 'জাতীয়',
    feedUrl: 'https://news.google.com/rss/search?q=site:ittefaq.com.bd&hl=bn&gl=BD&ceid=BD:bn',
    defaultImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    publisher: 'দৈনিক যুগান্তর',
    publisherName: 'jugantor',
    color: '#b91c1c',
    category: 'রাজনীতি',
    feedUrl: 'https://news.google.com/rss/search?q=site:jugantor.com&hl=bn&gl=BD&ceid=BD:bn',
    defaultImage: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80',
  },
];

const DYNAMIC_IMAGES = [
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590059208019-15224887b38c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
];

// 1. Primary Method: Fetch via rss2json API (Fastest and no CORS issues)
async function fetchViaRss2Json(source: RssSource): Promise<Article[]> {
  try {
    const targetUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.feedUrl)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) return [];

    return data.items.map((item: any, index: number) => {
      let rawTitle = cleanText(item.title || '');
      // Clean up google rss title suffix e.g. "Title - Prothom Alo"
      rawTitle = rawTitle.replace(/\s*-\s*(প্রথম আলো|Prothom Alo|কালের কণ্ঠ|কালবেলা|বিডিনিউজ২৪|বিবিসি বাংলা|দৈনিক ইত্তেফাক|দৈনিক যুগান্তর).*/i, '');

      let rawDesc = cleanText(item.description || item.content || '');
      rawDesc = rawDesc.replace(/<[^>]+>/g, '').trim();

      let imgUrl = item.thumbnail || item.enclosure?.link || source.defaultImage;
      if (!imgUrl || imgUrl.includes('placeholder')) {
        imgUrl = DYNAMIC_IMAGES[index % DYNAMIC_IMAGES.length];
      }

      const link = item.link || item.guid || '#';

      return {
        id: `rss2json-${source.publisherName}-${index}-${Date.now()}`,
        title: rawTitle,
        excerpt: rawDesc.slice(0, 180) || `${rawTitle} সম্পর্কিত বিস্তারিত আপডেট।`,
        content: [
          rawDesc || rawTitle,
          `সংবাদটি সরাসরি ${source.publisher}-এর অফিসিয়াল অনলাইন প্ল্যাটফর্ম থেকে প্রকাশিত লাইভ ফিড। বিস্তারিত ও সর্বশেষ আপডেট জানতে মূল লিংকে ভিজিট করুন।`
        ],
        category: source.category,
        categorySlug: source.category === 'আন্তর্জাতিক' ? 'international' : source.category === 'রাজনীতি' ? 'politics' : source.category === 'অর্থনীতি' ? 'economy' : 'national',
        author: `${source.publisher} অনলাইন`,
        timeAgo: 'লাইভ আপডেট',
        views: `${Math.floor(Math.random() * 500) + 150} বার পড়া হয়েছে`,
        image: imgUrl,
        publisherName: source.publisherName,
        publisherBengali: source.publisher,
        publisherColor: source.color,
        isLiveSynced: true,
        isLead: index === 0 && source.publisherName === 'prothomalo',
        isTrending: index < 4,
        tags: [source.publisher, source.category, 'লাইভ সংবাদ'],
        sourceUrl: link,
      };
    }).filter((a: Article) => a.title && a.title.length > 5);
  } catch (err) {
    return [];
  }
}

// 2. Secondary Method: Fetch XML via CORS proxies
async function fetchXmlViaProxy(url: string): Promise<string | null> {
  const proxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  ];

  for (const getProxyUrl of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(getProxyUrl(url), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = await res.text();
        if (text && (text.includes('<rss') || text.includes('<feed') || text.includes('<xml') || text.includes('<item'))) {
          return text;
        }
      }
    } catch (e) {
      // try next
    }
  }
  return null;
}

function parseRssXml(xmlStr: string, source: RssSource): Article[] {
  const articles: Article[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 10);

    items.forEach((item, index) => {
      let rawTitle = cleanText(item.querySelector('title')?.textContent || '');
      rawTitle = rawTitle.replace(/\s*-\s*(প্রথম আলো|Prothom Alo|কালের কণ্ঠ|কালবেলা|বিডিনিউজ২৪|বিবিসি বাংলা|দৈনিক ইত্তেফাক|দৈনিক যুগান্তর).*/i, '');

      let rawDesc = cleanText(item.querySelector('description')?.textContent || '');
      rawDesc = rawDesc.replace(/<[^>]+>/g, '').trim();

      const link = item.querySelector('link')?.textContent || '#';

      if (!rawTitle || rawTitle.length < 5) return;

      let imgUrl = source.defaultImage;
      const mediaThumbnail = item.querySelector('thumbnail') || item.querySelector('media\\:thumbnail');
      if (mediaThumbnail?.getAttribute('url')) {
        imgUrl = mediaThumbnail.getAttribute('url')!;
      } else {
        const enclosure = item.querySelector('enclosure');
        if (enclosure?.getAttribute('type')?.startsWith('image') && enclosure.getAttribute('url')) {
          imgUrl = enclosure.getAttribute('url')!;
        }
      }

      articles.push({
        id: `xmlproxy-${source.publisherName}-${index}-${Date.now()}`,
        title: rawTitle,
        excerpt: rawDesc.slice(0, 180) || `${rawTitle} সম্পর্কিত খবর।`,
        content: [
          rawDesc || rawTitle,
          `সংবাদটি সরাসরি ${source.publisher}-এর অফিসিয়াল পোর্টাল থেকে লাইভ প্রাপ্ত।`
        ],
        category: source.category,
        categorySlug: source.category === 'আন্তর্জাতিক' ? 'international' : source.category === 'রাজনীতি' ? 'politics' : 'national',
        author: `${source.publisher} ডেস্ক`,
        timeAgo: 'লাইভ আপডেট',
        views: `${Math.floor(Math.random() * 600) + 200} বার পড়া হয়েছে`,
        image: imgUrl,
        publisherName: source.publisherName,
        publisherBengali: source.publisher,
        publisherColor: source.color,
        isLiveSynced: true,
        isLead: index === 0 && source.publisherName === 'prothomalo',
        isTrending: index < 3,
        tags: [source.publisher, source.category, 'লাইভ খবর'],
        sourceUrl: link,
      });
    });
  } catch (e) {
    console.warn('Browser XML parsing error:', e);
  }
  return articles;
}

// Public Client RSS Live News Fetcher
export async function fetchClientLiveNews(): Promise<Article[]> {
  try {
    // Attempt fast parallel rss2json fetching for all feeds
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (source) => {
        let items = await fetchViaRss2Json(source);
        if (items.length === 0) {
          const xml = await fetchXmlViaProxy(source.feedUrl);
          if (xml) {
            items = parseRssXml(xml, source);
          }
        }
        return items;
      })
    );

    const allArticles: Article[] = [];
    results.forEach((res) => {
      if (res.status === 'fulfilled' && res.value.length > 0) {
        allArticles.push(...res.value);
      }
    });

    return allArticles;
  } catch (err) {
    console.warn('Client RSS fetch failed:', err);
    return [];
  }
}
