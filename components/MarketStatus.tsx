'use client'

import { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';

export default function MarketStatus() {
  const [status, setStatus] = useState<'open' | 'closed' | 'pre' | 'after'>('closed');

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const day = now.getDay(); // Use local day instead of UTC
      
      // Weekend check (Saturday = 6, Sunday = 0)
      if (day === 0 || day === 6) {
        setStatus('closed');
        return;
      }

      // Convert to EST/EDT
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hours = estTime.getHours();
      const minutes = estTime.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      // NYSE times in EST
      const preMarketStart = 4 * 60; // 4:00 AM EST
      const marketOpen = 9 * 60 + 30; // 9:30 AM EST
      const marketClose = 16 * 60; // 4:00 PM EST
      const afterMarketEnd = 20 * 60; // 8:00 PM EST

      if (timeInMinutes >= marketOpen && timeInMinutes < marketClose) {
        setStatus('open');
      } else if (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
        setStatus('pre');
      } else if (timeInMinutes >= marketClose && timeInMinutes < afterMarketEnd) {
        setStatus('after');
      } else {
        setStatus('closed');
      }
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    open: { color: 'text-green-500', bg: 'bg-green-500', label: 'Market Open' },
    closed: { color: 'text-gray-500', bg: 'bg-gray-500', label: 'Market Closed' },
    pre: { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Pre-Market' },
    after: { color: 'text-blue-500', bg: 'bg-blue-500', label: 'After Hours' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg">
      <Circle className={`h-2 w-2 ${config.bg} ${status === 'open' ? 'animate-pulse' : ''}`} fill="currentColor" />
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
