'use client'

import { useEffect, useState } from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';
import FullscreenChart from '@/components/FullscreenChart';
import WatchlistButton from '@/components/WatchlistButton';
import QuickStats from '@/components/QuickStats';
import StockNews from '@/components/StockNews';
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from '@/lib/constants';

export default function StockDetailsClient({ symbol }: { symbol: string }) {
  const [mounted, setMounted] = useState(false);
  const scriptUrl = 'https://s3.tradingview.com/external-embedding/embed-widget-';

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('contentWindow')) return;
      originalError(...args);
    };

    const timer = setTimeout(() => setMounted(true), 100);
    return () => {
      clearTimeout(timer);
      console.error = originalError;
    };
  }, [symbol]);

  if (!mounted) return <div className="h-screen" />;

  return (
    <div className="space-y-6 p-6">
      <QuickStats symbol={symbol} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            height={170}
          />
          <FullscreenChart
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
            height={600}
          />
          <FullscreenChart
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(symbol)}
            height={600}
          />
        </div>
        <div className="space-y-6">
          <WatchlistButton symbol={symbol} />
          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
            height={440}
          />
          <TradingViewWidget
            scriptUrl={`${scriptUrl}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
            height={464}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradingViewWidget
          scriptUrl={`${scriptUrl}market-quotes.js`}
          config={{
            width: '100%',
            height: 200,
            symbolsGroups: [{
              name: 'Indices',
              symbols: [
                { name: 'FOREXCOM:SPXUSD', displayName: 'S&P 500' },
                { name: 'FOREXCOM:NSXUSD', displayName: 'NASDAQ' },
                { name: 'FOREXCOM:DJI', displayName: 'Dow Jones' }
              ]
            }],
            showSymbolLogo: true,
            colorTheme: 'dark',
            isTransparent: true,
            locale: 'en'
          }}
          height={200}
        />
        <StockNews symbol={symbol} />
      </div>
    </div>
  );
}
