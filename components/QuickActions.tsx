'use client'

import { RefreshCw, Download, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import MarketStatus from './MarketStatus';

interface Stock {
  symbol: string;
  company: string;
  priceFormatted: string;
  changeFormatted: string;
  marketCap: string;
  peRatio: string;
}

export default function QuickActions({ onRefresh, watchlist }: { onRefresh: () => Promise<void>; watchlist: Stock[] }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
      if (seconds < 60) {
        setTimeAgo('Just now');
      } else {
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
          setTimeAgo(`${minutes}m ago`);
        } else {
          const hours = Math.floor(minutes / 60);
          setTimeAgo(`${hours}h ago`);
        }
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastUpdated(new Date());
      toast.success('Prices updated');
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    const headers = ['Symbol', 'Company', 'Price', 'Change %', 'Market Cap', 'P/E Ratio'];
    const rows = watchlist.map(stock => [
      stock.symbol,
      stock.company,
      stock.priceFormatted,
      stock.changeFormatted,
      stock.marketCap,
      stock.peRatio
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchlist-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Watchlist exported successfully');
  };

  const getTimeAgo = () => timeAgo;

  return (
    <div className="flex items-center justify-between mb-4 px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Updated {getTimeAgo()}</span>
        </div>
        <MarketStatus />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>
    </div>
  );
}
