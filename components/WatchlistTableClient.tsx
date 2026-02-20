'use client'

import { useState, useEffect, useCallback } from 'react';
import WatchlistTable from './WatchlistTable';
import QuickActions from './QuickActions';
import { getUserAlerts } from '@/lib/actions/alert.actions';
import { getWatchlistWithData } from '@/lib/actions/watchlist.actions';

const isMarketOpen = () => {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcTime = utcHours * 60 + utcMinutes;
  const marketOpen = 14 * 60 + 30;
  const marketClose = 21 * 60;
  return utcTime >= marketOpen && utcTime < marketClose;
};

export default function WatchlistTableClient({ initialWatchlist }: { initialWatchlist: any[] }) {
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchAlerts = useCallback(async () => {
    const userAlerts = await getUserAlerts();
    setAlerts(userAlerts);
  }, []);

  const refreshWatchlist = useCallback(async () => {
    const data = await getWatchlistWithData();
    setWatchlist(data);
  }, []);

  const handleManualRefresh = async () => {
    await Promise.all([refreshWatchlist(), fetchAlerts()]);
  };

  useEffect(() => {
    fetchAlerts();

    const handleAlertsChanged = () => fetchAlerts();
    const handleWatchlistChanged = () => refreshWatchlist();
    
    window.addEventListener('alertsChanged', handleAlertsChanged);
    window.addEventListener('watchlistChanged', handleWatchlistChanged);
    
    return () => {
      window.removeEventListener('alertsChanged', handleAlertsChanged);
      window.removeEventListener('watchlistChanged', handleWatchlistChanged);
    };
  }, [fetchAlerts, refreshWatchlist]);

  const updatePrices = useCallback(async () => {
    try {
      const updatedWatchlist = await Promise.all(
        watchlist.map(async (stock) => {
          try {
            const response = await fetch(`/api/quote/${stock.symbol}`);
            const data = await response.json();

            if (data.price) {
              return {
                ...stock,
                currentPrice: data.price,
                changePercent: data.changePercent,
                priceFormatted: `$${data.price.toFixed(2)}`,
                changeFormatted: `${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
              };
            }
            return stock;
          } catch (error) {
            console.error(`Error fetching ${stock.symbol}:`, error);
            return stock;
          }
        })
      );

      setWatchlist(updatedWatchlist);
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }, [watchlist]);

  useEffect(() => {
    if (!isMarketOpen()) return;
    
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  return (
    <>
      <QuickActions onRefresh={handleManualRefresh} watchlist={watchlist} />
      <WatchlistTable watchlist={watchlist} alerts={alerts} />
    </>
  );
}
