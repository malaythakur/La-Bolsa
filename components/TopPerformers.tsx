'use client'

import { TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function TopPerformers({ watchlist }: { watchlist: any[] }) {
  if (watchlist.length === 0) return null;

  const sorted = [...watchlist].sort((a, b) => b.changePercent - a.changePercent);
  const topGainer = sorted[0];
  const topLoser = sorted[sorted.length - 1];

  if (!topGainer || !topLoser) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-6">
      {/* Top Gainer */}
      <div className="bg-gradient-to-br from-green-500/10 to-gray-900 rounded-lg p-4 border border-green-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <span className="text-sm font-medium text-gray-400">Top Gainer</span>
        </div>
        <Link href={`/stocks/${topGainer.symbol}`} className="block group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-100 group-hover:text-yellow-500 transition-colors">
                {topGainer.symbol}
              </h3>
              <p className="text-xs text-gray-500">{topGainer.company}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-500">
                +{topGainer.changePercent.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">{topGainer.priceFormatted}</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Top Loser */}
      <div className="bg-gradient-to-br from-red-500/10 to-gray-900 rounded-lg p-4 border border-red-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-sm font-medium text-gray-400">Top Loser</span>
        </div>
        <Link href={`/stocks/${topLoser.symbol}`} className="block group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-100 group-hover:text-yellow-500 transition-colors">
                {topLoser.symbol}
              </h3>
              <p className="text-xs text-gray-500">{topLoser.company}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-red-500">
                {topLoser.changePercent.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">{topLoser.priceFormatted}</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
