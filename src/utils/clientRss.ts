import { Article } from '../types';
import { cleanText } from './textUtils';

// RSS Feed URLs for Client-Side Fallback on Vercel / Static Hosting
const RSS_FEEDS = [
  {
    publisher: 'বিবিসি বাংলা',
    publisherName: 'bbcbangla',
    color: '#bb1919',
    category: 'আন্তর্জাতিক',
    feedUrl: 'https://feeds.bbci.co.uk/bengali/rss.xml',
    defaultImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  },
  {
    publisher: 'প্রথম আলো',
    publisherName: 'prothomalo',
    color: '#0284c7',
    category: 'জাতীয়',
    feedUrl: 'https://www.prothomalo.com/feed',
    defaultImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
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
];

// Helper to fetch XML text via CORS proxies
async function fetchXmlViaProxy(url: string): Promise<string | null> {
  const proxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];

  for (const getProxyUrl of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(getProxyUrl(url), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('<rss') || text.includes('<feed') || text.includes('<xml') || text.includes('<item')) {
          return text;
        }
      }
    } catch (e) {
      // try next proxy
    }
  }
  return null;
}

// Simple XML Item Parser in Browser
function parseRssXml(xmlStr: string, source: typeof RSS_FEEDS[0]): Article[] {
  const articles: Article[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 15);

    items.forEach((item, index) => {
      const rawTitle = item.querySelector('title')?.textContent || '';
      const rawDesc = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';

      const cleanTitleStr = cleanText(rawTitle);
      const cleanDescStr = cleanText(rawDesc);

      if (!cleanTitleStr || cleanTitleStr.length < 5) return;

      // Extract image URL from enclosure, media:thumbnail, or description img tag
      let imgUrl = source.defaultImage;
      const mediaThumbnail = item.querySelector('thumbnail') || item.querySelector('media\\:thumbnail');
      if (mediaThumbnail?.getAttribute('url')) {
        imgUrl = mediaThumbnail.getAttribute('url')!;
      } else {
        const enclosure = item.querySelector('enclosure');
        if (enclosure?.getAttribute('type')?.startsWith('image') && enclosure.getAttribute('url')) {
          imgUrl = enclosure.getAttribute('url')!;
        } else {
          const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch?.[1]) {
            imgUrl = imgMatch[1];
          }
        }
      }

      const idStr = `client-${source.publisherName}-${index}-${Date.now()}`;

      articles.push({
        id: idStr,
        title: cleanTitleStr,
        excerpt: cleanDescStr.slice(0, 180) || `${cleanTitleStr} সম্পর্কিত বিস্তারিত খবর।`,
        content: [
          cleanDescStr || cleanTitleStr,
          `সংবাদটি সংগৃহীত হয়েছে ${source.publisher}-এর অফিশিয়াল বুলেটিন থেকে। বিস্তারিত জানতে মূল পোর্টালে চোখ রাখুন।`
        ],
        category: source.category,
        categorySlug: source.category === 'আন্তর্জাতিক' ? 'international' : source.category === 'রাজনীতি' ? 'politics' : 'national',
        author: `${source.publisher} ডেস্ক`,
        timeAgo: pubDate ? 'আজকের লাইভ' : 'এইমাত্র আপডেট',
        views: `${Math.floor(Math.random() * 800) + 200} বার পড়া হয়েছে`,
        image: imgUrl,
        publisherName: source.publisherName,
        publisherBengali: source.publisher,
        publisherColor: source.color,
        isLiveSynced: true,
        isLead: index === 0 && source.publisherName === 'prothomalo',
        isTrending: index < 3,
        tags: [source.publisher, source.category, 'লাইভ খবর'],
        sourceUrl: link || '#',
      });
    });
  } catch (e) {
    console.warn('Browser XML parsing error:', e);
  }
  return articles;
}

// Public client-side RSS news fetcher fallback
export async function fetchClientLiveNews(): Promise<Article[]> {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (source) => {
        const xml = await fetchXmlViaProxy(source.feedUrl);
        if (xml) {
          return parseRssXml(xml, source);
        }
        return [];
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
    console.warn('Client RSS fallback failed:', err);
    return [];
  }
}
