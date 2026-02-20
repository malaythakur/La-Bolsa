import { Star } from 'lucide-react';
import SearchCommand from '@/components/SearchCommand';
import WatchlistTableClient from '@/components/WatchlistTableClient';
import AlertsListClient from '@/components/AlertsListClient';
import NotificationHistory from '@/components/NotificationHistory';
import WatchlistStats from '@/components/WatchlistStats';
import TopPerformers from '@/components/TopPerformers';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import { getWatchlistWithData } from '@/lib/actions/watchlist.actions';
import { getUserAlerts } from '@/lib/actions/alert.actions';
import { getAlertNotifications } from '@/lib/actions/alertNotification.actions';
import { AlertItem } from '@/database/models/alert.model';

export default async function WatchlistPage() {
    const [initialStocks, watchlistData, alerts, notifications] = await Promise.all([
        searchStocks(),
        getWatchlistWithData(),
        getUserAlerts(),
        getAlertNotifications(),
    ]);

    const isEmpty = watchlistData.length === 0;

    if (isEmpty) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center space-y-8 max-w-lg">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                        <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500/30">
                            <Star className="h-16 w-16 text-yellow-500" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-gray-100">Start Building Your Watchlist</h2>
                        <p className="text-gray-400 text-lg">
                            Track your favorite stocks and get real-time updates on price movements
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <SearchCommand 
                            renderAs="button" 
                            label="Search Stocks" 
                            initialStocks={initialStocks}
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono">⌘K</span>
                            <span>Quick search</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                            <div className="text-yellow-500 font-semibold mb-2">📊 Track Prices</div>
                            <p className="text-sm text-gray-400">Monitor real-time stock prices and changes</p>
                        </div>
                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                            <div className="text-yellow-500 font-semibold mb-2">🔔 Set Alerts</div>
                            <p className="text-sm text-gray-400">Get notified when prices hit your targets</p>
                        </div>
                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                            <div className="text-yellow-500 font-semibold mb-2">📈 Analyze Trends</div>
                            <p className="text-sm text-gray-400">View performance and make informed decisions</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center px-6">
                        <h1 className="text-3xl font-bold">Watchlist</h1>
                        <SearchCommand 
                            renderAs="button" 
                            label="Add Stock" 
                            initialStocks={initialStocks}
                        />
                    </div>
                    <WatchlistStats watchlist={watchlistData} alerts={alerts} notifications={notifications} />
                    <TopPerformers watchlist={watchlistData} />
                    <div className="bg-gray-900 rounded-lg p-6">
                        <WatchlistTableClient initialWatchlist={watchlistData} />
                    </div>
                    <div className="bg-gray-900 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-100 mb-4">Alert History</h2>
                        <NotificationHistory notifications={notifications} />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-gray-900 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-100">Active Alerts</h2>
                            <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-semibold">
                                {alerts.filter((a: AlertItem) => !a.triggered).length}
                            </span>
                        </div>
                        <AlertsListClient initialAlerts={alerts} />
                    </div>
                </div>
            </div>
        </div>
    );
}
