'use server';

import { cache } from 'react';
import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { getWatchlistSymbolsByEmail } from './watchlist.actions';

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
      const symbol = cleanSymbols[0];
      const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
      const news: RawNewsArticle[] = await fetchJSON(url);

      const seen = new Set<string>();
      const unique = news.filter((article) => {
        if (!validateArticle(article)) return false;
        const key = `${article.id}-${article.url}-${article.headline}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return unique.slice(0, 6).map((article, i) => formatArticle(article, true, symbol, i));
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

interface FinnhubSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

interface FinnhubSearchResponse {
  count: number;
  result: FinnhubSearchResult[];
}

interface StocksWithWatchlistStatus {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  isInWatchlist: boolean;
}

interface StockProfile {
  name: string;
  exchange: string;
}

const POPULAR_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC'];

export const searchStocks = cache(async (query: string = ''): Promise<StocksWithWatchlistStatus[]> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const watchlistSymbols = session?.user?.email 
      ? await getWatchlistSymbolsByEmail(session.user.email)
      : [];

    if (!query?.trim()) {
      const profiles = await Promise.all(
        POPULAR_SYMBOLS.map(async (symbol) => {
          const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
          const profile: StockProfile = await fetchJSON(url, 3600);
          return {
            symbol,
            name: profile.name || symbol,
            exchange: profile.exchange || 'US',
            type: 'Common Stock',
            isInWatchlist: watchlistSymbols.includes(symbol),
          };
        })
      );
      return profiles;
    }

    const trimmedQuery = query.trim();
    const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmedQuery)}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
    const data: FinnhubSearchResponse = await fetchJSON(url, 1800);

    const results: FinnhubSearchResult[] = data.result || [];
    return results.slice(0, 15).map((result) => ({
      symbol: result.symbol.toUpperCase(),
      name: result.description,
      exchange: result.displaySymbol || 'US',
      type: result.type || 'Stock',
      isInWatchlist: watchlistSymbols.includes(result.symbol.toUpperCase()),
    }));
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
});

export const getStockDetails = async (symbol: string) => {
  try {
    const [quote, profile, financials] = await Promise.all([
      fetchJSON(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`),
      fetchJSON(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`, 3600),
      fetchJSON(`${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`, 3600),
    ]);

    return {
      symbol,
      company: profile.name || symbol,
      currentPrice: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      marketCap: profile.marketCapitalization,
      peRatio: financials.metric?.peBasicExclExtraTTM,
    };
  } catch (error) {
    console.error('Error fetching stock details:', error);
    return null;
  }
};

