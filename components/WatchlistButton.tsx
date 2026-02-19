'use client'

export default function WatchlistButton({ symbol, company, isInWatchlist = false, showTrashIcon, type, onWatchlistChange }: Partial<WatchlistButtonProps> & { symbol: string }) {
  return (
    <button className="w-full px-4 py-2 bg-yellow-500 text-gray-900 font-medium rounded hover:bg-yellow-400 transition-colors">
      Add to Watchlist
    </button>
  );
}
