'use client'

import { TrendingUp, TrendingDown, Bell, Eye } from 'lucide-react';

interface Stock {
  changePercent: number;
}

interface Alert {
  triggered: boolean;
}

interface Props {
  watchlist: Stock[];
  alerts: Alert[];
  notifications: unknown[];
}

export default function WatchlistStats({ watchlist, alerts, notifications }: Props) {
  const totalStocks = watchlist.length;
  const activeAlerts = alerts.filter(a => !a.triggered).length;
  const triggeredAlerts = notifications.length;
  
  const gainers = watchlist.filter(s => s.changePercent > 0).length;
  const losers = watchlist.filter(s => s.changePercent < 0).length;
  
  const avgChange = watchlist.length > 0
    ? watchlist.reduce((sum, s) => sum + s.changePercent, 0) / watchlist.length
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-6">
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Total Stocks</span>
          <Eye className="h-4 w-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-100">{totalStocks}</div>
        <div className="text-xs text-gray-500 mt-1">
          <span className="text-green-500">{gainers}↑</span> / <span className="text-red-500">{losers}↓</span>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Avg Change</span>
          {avgChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className={`text-2xl font-bold ${avgChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
        </div>
        <div className="text-xs text-gray-500 mt-1">Today&apos;s average</div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Active Alerts</span>
          <Bell className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="text-2xl font-bold text-yellow-500">{activeAlerts}</div>
        <div className="text-xs text-gray-500 mt-1">Monitoring prices</div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Triggered</span>
          <Bell className="h-4 w-4 text-green-500" />
        </div>
        <div className="text-2xl font-bold text-green-500">{triggeredAlerts}</div>
        <div className="text-xs text-gray-500 mt-1">Alerts triggered</div>
      </div>
    </div>
  );
}
