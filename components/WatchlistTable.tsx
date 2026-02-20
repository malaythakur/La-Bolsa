'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowUpDown, Bell, Search, Trash2, AlertTriangle } from 'lucide-react';
import WatchlistButton from './WatchlistButton';
import AlertModal from './AlertModal';
import { WATCHLIST_TABLE_HEADER } from '@/lib/constants';
import { removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Alert {
  symbol: string;
  triggered: boolean;
}

interface Stock {
  symbol: string;
  company: string;
  currentPrice?: number;
  changePercent?: number;
  priceFormatted?: string;
  changeFormatted?: string;
  marketCap?: string;
  peRatio?: string;
}

export default function WatchlistTable({ watchlist, alerts }: WatchlistTableProps & { alerts?: Alert[] }) {
  const [alertModal, setAlertModal] = useState<{ open: boolean; stock?: StockWithData }>({ open: false });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getAlertCount = (symbol: string) => {
    return alerts?.filter(a => a.symbol === symbol && !a.triggered).length || 0;
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStocks(sortedWatchlist.map(s => s.symbol));
    } else {
      setSelectedStocks([]);
    }
  };

  const handleSelectStock = (symbol: string, checked: boolean) => {
    if (checked) {
      setSelectedStocks(prev => [...prev, symbol]);
    } else {
      setSelectedStocks(prev => prev.filter(s => s !== symbol));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStocks.length === 0) return;
    
    setIsDeleting(true);
    try {
      await Promise.all(selectedStocks.map(symbol => removeFromWatchlist(symbol)));
      toast.success(`Removed ${selectedStocks.length} stock(s) from watchlist`);
      setSelectedStocks([]);
      window.dispatchEvent(new Event('watchlistChanged'));
      window.dispatchEvent(new Event('alertsChanged'));
    } catch (error) {
      toast.error('Failed to remove stocks');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const filteredWatchlist = watchlist.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedWatchlist = [...filteredWatchlist].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const key = sortConfig.key as keyof StockWithData;
    let aValue: string | number | Date | undefined = a[key];
    let bValue: string | number | Date | undefined = b[key];

    if (sortConfig.key === 'changePercent' || sortConfig.key === 'currentPrice') {
      aValue = parseFloat(String(aValue ?? 0));
      bValue = parseFloat(String(bValue ?? 0));
    }

    if (!aValue || !bValue) return 0;
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <>
      {/* Search Bar and Bulk Actions */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search stocks by symbol or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>
        {selectedStocks.length > 0 && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-500 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selectedStocks.length}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedStocks.length === sortedWatchlist.length && sortedWatchlist.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                <button onClick={() => handleSort('company')} className="flex items-center gap-1 hover:text-yellow-500">
                  Company <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Symbol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                <button onClick={() => handleSort('currentPrice')} className="flex items-center gap-1 hover:text-yellow-500">
                  Price <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                <button onClick={() => handleSort('changePercent')} className="flex items-center gap-1 hover:text-yellow-500">
                  Change <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Market Cap</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">P/E Ratio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Alerts</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedWatchlist.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No stocks found matching &quot;{searchQuery}&quot;
                </td>
              </tr>
            ) : (
              sortedWatchlist.map((stock) => {
                const alertCount = getAlertCount(stock.symbol);
                const isSelected = selectedStocks.includes(stock.symbol);
                return (
                  <tr key={stock.symbol} className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-gray-800/30' : ''}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectStock(stock.symbol, e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/stocks/${stock.symbol}`} className="text-gray-200 hover:text-yellow-500">
                        {stock.company}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{stock.symbol}</td>
                    <td className="px-4 py-4 text-gray-300">{stock.priceFormatted}</td>
                    <td className={`px-4 py-4 ${(stock.changePercent ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.changeFormatted}
                    </td>
                    <td className="px-4 py-4 text-gray-300">{stock.marketCap}</td>
                    <td className="px-4 py-4 text-gray-300">{stock.peRatio}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setAlertModal({ open: true, stock })}
                          className="add-alert"
                        >
                          <Plus className="h-4 w-4" />
                          Add Alert
                        </button>
                        {alertCount > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                            <Bell className="h-3 w-3" />
                            {alertCount}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <WatchlistButton
                        symbol={stock.symbol}
                        company={stock.company}
                        isInWatchlist={true}
                        type="icon"
                        showTrashIcon={true}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {alertModal.open && alertModal.stock && (
        <AlertModal
          open={alertModal.open}
          setOpen={(open) => setAlertModal({ open, stock: undefined })}
          symbol={alertModal.stock.symbol}
          company={alertModal.stock.company}
          currentPrice={alertModal.stock.currentPrice}
        />
      )}

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gray-800 border-gray-600 text-gray-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-100">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Remove from Watchlist?
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove <span className="font-semibold text-yellow-500">{selectedStocks.length} stock{selectedStocks.length > 1 ? 's' : ''}</span> from your watchlist?
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 font-medium">⚠️ Warning: All price alerts for these stocks will also be deleted.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
