'use client'

import { useState } from 'react';
import { Bell, TrendingUp, TrendingDown, Clock, Target, CheckCircle2 } from 'lucide-react';
import { markNotificationAsRead } from '@/lib/actions/alertNotification.actions';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NotificationHistory({ notifications: initialNotifications }: { notifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );
    
    const result = await markNotificationAsRead(notificationId);
    if (result.success) {
      toast.success('Marked as read');
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
          <Bell className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Alert History</h3>
        <p className="text-sm text-gray-500">Triggered alerts will appear here</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            filter === 'all'
              ? 'text-yellow-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All Alerts
          {filter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />
          )}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            filter === 'unread'
              ? 'text-yellow-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-yellow-500 text-black rounded-full font-semibold">
              {unreadCount}
            </span>
          )}
          {filter === 'unread' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No {filter} alerts</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`group relative overflow-hidden rounded-lg border transition-all hover:shadow-lg ${
                notification.read
                  ? 'bg-gray-800/30 border-gray-700/50'
                  : 'bg-gray-800 border-yellow-500/20 shadow-yellow-500/5'
              }`}
            >
              {/* Accent Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  notification.alertType === 'upper'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              />

              <div className="p-4 pl-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/stocks/${notification.symbol}`}
                        className="font-semibold text-gray-100 hover:text-yellow-500 transition-colors"
                      >
                        {notification.symbol}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {notification.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Target className="h-3 w-3" />
                      <span className="uppercase">{notification.alertName}</span>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                      <span className="text-xs text-yellow-500 font-medium">New</span>
                    </div>
                  )}
                </div>

                {/* Price Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {notification.alertType === 'upper' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-400">
                        {notification.alertType === 'upper' ? 'Above' : 'Below'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        ${notification.threshold.toFixed(2)}
                      </span>
                      <span className="text-gray-600">→</span>
                      <span
                        className={`text-base font-bold ${
                          notification.alertType === 'upper'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        ${notification.triggeredPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(notification.triggeredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="text-xs text-yellow-500 hover:text-yellow-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
