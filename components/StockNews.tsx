'use client'

import { useEffect, useState } from 'react';
import { getNews } from '@/lib/actions/finnhub.actions';

export default function StockNews({ symbol }: { symbol: string }) {
  const [news, setNews] = useState<MarketNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const articles = await getNews([symbol]);
        setNews(articles);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [symbol]);

  if (loading) {
    return <div className="h-[350px] bg-[#141414] rounded-lg animate-pulse" />;
  }

  return (
    <div className="h-[350px] bg-[#141414] rounded-lg p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-white">Top Stories</h3>
      <div className="space-y-4">
        {news.length === 0 ? (
          <p className="text-gray-400">No news available for {symbol}</p>
        ) : (
          news.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-[#1a1a1a] rounded hover:bg-[#222] transition-colors"
            >
              <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
                {article.headline}
              </h4>
              <p className="text-xs text-gray-400">
                {new Date(article.datetime * 1000).toLocaleDateString()}
              </p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
