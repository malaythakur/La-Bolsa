"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import {Button} from "@/components/ui/button";
import {Loader2, TrendingUp, TrendingDown, ArrowRight} from "lucide-react";
import Link from "next/link";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import {useDebouce} from "@/hooks/useDebouce";
import WatchlistButton from "@/components/WatchlistButton";

export default function SearchCommand( {renderAs = 'button', label = 'Add stock', initialStocks}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  const isSearchMode =  !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0,10);


  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true)
    try{
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch {
    setStocks([])
    }
    finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebouce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch()
  }, [searchTerm])

  useEffect(() => {
    const handleWatchlistUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const symbol = customEvent.detail?.symbol;
      const isAdded = customEvent.detail?.isAdded;
      
      if (symbol) {
        setStocks(prevStocks => 
          prevStocks.map(stock => 
            stock.symbol === symbol ? { ...stock, isInWatchlist: isAdded } : stock
          )
        );
      }
    };

    window.addEventListener('watchlistChanged', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlistChanged', handleWatchlistUpdate);
  }, []);


  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
    setStocks(prevStocks => 
      prevStocks.map(stock => 
        stock.symbol === symbol ? { ...stock, isInWatchlist: isAdded } : stock
      )
    );
  };

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
    setHoveredIndex(-1);
  };

  return (
      <>
      {renderAs==='text' ? (
          <span onClick={()=> setOpen(true)} className="search-text">
            {label}
          </span>
      ): (
          <Button onClick={() => setOpen(true)} className="search-btn">
            {label}
          </Button>
      )}
    <CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
      <div className="search-field">
        <CommandInput
            placeholder="Search stocks by symbol or company name..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="search-input"
        />
        {loading && <Loader2 className="search-loader" />}
      </div>

      <CommandList className="search-list">
        {
          loading ? (
              <CommandEmpty className="search-list-empty">Loading stocks ...</CommandEmpty>
          ) : displayStocks?.length ===0 ? (
              <div className="search-list-indicator">
                {isSearchMode ? 'No results found' : 'No stocks available'}
              </div>
          ) : (
              <ul>
                <div className="search-count">
                  {isSearchMode ? '🔍 Search results' : '⭐ Popular stocks'}
                  {` `}({displayStocks?.length || 0})
                </div>

                {displayStocks?.map((stock, i) => {
                  const isPositive = Math.random() > 0.5;
                  return (
                    <li 
                      key={stock.symbol} 
                      className={`search-item ${
                        hoveredIndex === i ? 'bg-gray-700/50' : ''
                      }`}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(-1)}
                    >
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        onClick={handleSelectStock}
                        className="search-item-link group"
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="search-item-name group-hover:text-yellow-500 transition-colors truncate">
                              {stock.name}
                            </span>
                            {stock.isInWatchlist && (
                              <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-500 rounded-full font-medium whitespace-nowrap">
                                Watching
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-semibold text-gray-400">{stock.symbol}</span>
                            <span>•</span>
                            <span className="truncate">{stock.exchange}</span>
                            <span>•</span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded whitespace-nowrap">{stock.type}</span>
                          </div>
                        </div>
                        {hoveredIndex === i && (
                          <ArrowRight className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </Link>
                      <div className="flex-shrink-0">
                        <WatchlistButton
                          symbol={stock.symbol}
                          company={stock.name}
                          isInWatchlist={stock.isInWatchlist}
                          type="icon"
                          onWatchlistChange={handleWatchlistChange}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
          )
        }

      </CommandList>
    </CommandDialog>
      </>
  );
}
