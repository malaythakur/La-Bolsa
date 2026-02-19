'use client'

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

type QuickStatsProps = {
  symbol: string;
};

type StatsData = {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
};

export default function QuickStats({ symbol }: QuickStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const hasShownError = useRef(false);

  useEffect(() => {
    hasShownError.current = false;
    setLoading(true);
    
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/quote/${symbol}`);
        if (res.ok) {
          const data = await res.json();
          if (data.error || data.price === 0) {
            if (!hasShownError.current) {
              toast.error(`Live data unavailable for ${symbol}`);
              hasShownError.current = true;
            }
            setStats(null);
          } else {
            setStats(data);
          }
        } else {
          if (!hasShownError.current) {
            toast.error(`Live data unavailable for ${symbol}`);
            hasShownError.current = true;
          }
        }
      } catch (error) {
        if (!hasShownError.current) {
          toast.error(`Live data unavailable for ${symbol}`);
          hasShownError.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) return <div className="h-24 bg-gray-900 rounded-lg animate-pulse" />;
  if (!stats) return null;

  const isPositive = stats.change >= 0;

  return (
    <div className="bg-gray-900 rounded-lg p-4 grid grid-cols-4 gap-4">
      <div>
        <p className="text-xs text-gray-400">Price</p>
        <p className="text-lg font-bold text-white">${stats.price.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Change</p>
        <p className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{stats.changePercent.toFixed(2)}%
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Volume</p>
        <p className="text-lg font-bold text-white">{(stats.volume / 1000000).toFixed(2)}M</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Range</p>
        <p className="text-sm font-bold text-white">${stats.low.toFixed(2)} - ${stats.high.toFixed(2)}</p>
      </div>
    </div>
  );
}
