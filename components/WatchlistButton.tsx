'use client'

import { useState, useCallback } from 'react';
import { Star, AlertTriangle, Trash2 } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function WatchlistButton({ 
  symbol, 
  company, 
  isInWatchlist = false, 
  showTrashIcon = false, 
  type = 'button',
  onWatchlistChange 
}: WatchlistButtonProps) {
  const [added, setAdded] = useState(isInWatchlist);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRemove = async () => {
    setIsProcessing(true);
    const previousState = added;
    setAdded(false);

    try {
      const result = await removeFromWatchlist(symbol);
      if (result.success) {
        toast.success('Removed from watchlist');
        onWatchlistChange?.(symbol, false);
        window.dispatchEvent(new CustomEvent('watchlistChanged', { detail: { symbol, isAdded: false } }));
        window.dispatchEvent(new Event('alertsChanged'));
      } else {
        setAdded(previousState);
        toast.error(result.error || 'Failed to remove from watchlist');
      }
    } catch (error) {
      setAdded(previousState);
      toast.error('Failed to remove from watchlist');
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  const handleAdd = async () => {
    setIsProcessing(true);
    const previousState = added;
    setAdded(true);

    try {
      const result = await addToWatchlist(symbol, company);
      if (result.success) {
        toast.success('Added to watchlist');
        onWatchlistChange?.(symbol, true);
        window.dispatchEvent(new CustomEvent('watchlistChanged', { detail: { symbol, isAdded: true } }));
      } else {
        setAdded(previousState);
        toast.error(result.error || 'Failed to add to watchlist');
      }
    } catch (error) {
      setAdded(previousState);
      toast.error('Failed to add to watchlist');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (added) {
      setShowConfirmDialog(true);
    } else {
      handleAdd();
    }
  }, [added]);

  if (type === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-all disabled:opacity-50 group"
          title={added ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {showTrashIcon && added ? (
            <Trash2 className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
          ) : (
            <Star 
              className={`h-5 w-5 transition-all ${
                added 
                  ? 'fill-yellow-500 text-yellow-500 group-hover:scale-110' 
                  : 'text-gray-400 group-hover:text-yellow-500 group-hover:scale-110'
              }`} 
            />
          )}
        </button>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-gray-800 border-gray-600 text-gray-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-100">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Remove from Watchlist?
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to remove <span className="font-semibold text-yellow-500">{symbol}</span> from your watchlist?
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 font-medium">⚠️ Warning: All price alerts for this stock will also be deleted.</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isProcessing}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemove}
                disabled={isProcessing}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isProcessing ? 'Removing...' : 'Remove'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <button 
        onClick={handleClick}
        disabled={isProcessing}
        className="w-full px-4 py-2 bg-yellow-500 text-gray-900 font-medium rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
      >
        {added ? 'Remove from Watchlist' : 'Add to Watchlist'}
      </button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gray-800 border-gray-600 text-gray-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-100">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Remove from Watchlist?
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove <span className="font-semibold text-yellow-500">{symbol}</span> from your watchlist?
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 font-medium">⚠️ Warning: All price alerts for this stock will also be deleted.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemove}
              disabled={isProcessing}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isProcessing ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
