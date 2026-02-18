'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY!;

const fetchJSON = async (url: string, revalidateSeconds?: number) => {
  const options: RequestInit = revalidateSeconds
    ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
    : { cache: 'no-store' };

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
  try {
    const { from, to } = getDateRange(5);

    if (symbols && symbols.length > 0) {
      const cleanSymbols = symbols.map((s) => s.trim().toUpperCase()).filter(Boolean);
      const articles: MarketNewsArticle[] = [];
      const maxRounds = 6;

      for (let round = 0; round < maxRounds; round++) {
        const symbolIndex = round % cleanSymbols.length;
        const symbol = cleanSymbols[symbolIndex];
        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
        const news: RawNewsArticle[] = await fetchJSON(url);

        const validArticle = news.find(validateArticle);
        if (validArticle) {
          articles.push(formatArticle(validArticle, true, symbol, round));
        }
        if (articles.length >= 6) break;
      }

      return articles.sort((a, b) => b.datetime - a.datetime);
    }

    const url = `${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
    const news: RawNewsArticle[] = await fetchJSON(url);

    const seen = new Set<string>();
    const unique = news.filter((article) => {
      if (!validateArticle(article)) return false;
      const key = `${article.id}-${article.url}-${article.headline}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.slice(0, 6).map((article, i) => formatArticle(article, false, undefined, i));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news');
  }
};
