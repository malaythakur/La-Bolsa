import StockDetailsClient from '@/components/StockDetailsClient';

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  
  let normalizedSymbol = symbol.toUpperCase();
  
  // For Indian stocks, try NSE first, but many aren't available in TradingView widgets
  if (normalizedSymbol.endsWith('.NS')) {
    normalizedSymbol = normalizedSymbol.replace('.NS', '');
    // Don't add exchange prefix - let TradingView handle it
  } else if (normalizedSymbol.endsWith('.BO')) {
    normalizedSymbol = normalizedSymbol.replace('.BO', '');
  } else if (!normalizedSymbol.includes(':')) {
    // For US stocks without exchange, don't add prefix
    normalizedSymbol = normalizedSymbol;
  }

  return <StockDetailsClient symbol={normalizedSymbol} />;
}
