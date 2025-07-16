import { Badge } from "@/components/ui/badge";

interface StockItemProps {
  stock: any;
}

export default function StockItem({ stock }: StockItemProps) {
  // Use real market data if available, otherwise fall back to mock data
  const marketData = stock.marketData;
  
  const priceData = marketData ? {
    price: marketData.price,
    change: marketData.change,
    changePercent: marketData.changePercent
  } : {
    price: 100.00,
    change: 0,
    changePercent: 0
  };

  const isPositive = priceData.changePercent >= 0;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  const bgColor = isPositive ? "bg-green-500" : "bg-red-500";

  const getCompanyName = (symbol: string) => {
    if (marketData?.name) {
      return marketData.name;
    }
    
    // Fallback names for common stocks
    const names: Record<string, string> = {
      AAPL: "Apple Inc.",
      MSFT: "Microsoft Corp.",
      TSLA: "Tesla Inc.",
      GOOGL: "Alphabet Inc.",
      AMZN: "Amazon.com Inc.",
      NVDA: "NVIDIA Corp.",
    };
    return names[symbol] || `${symbol} Corp.`;
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-[var(--dekr-dark-bg)]/50 rounded-lg">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${bgColor}`}>
          <span className="text-xs font-bold text-white">{stock.symbol}</span>
        </div>
        <div>
          <p className="text-sm font-medium">{getCompanyName(stock.symbol)}</p>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${changeColor}`}>
              {isPositive ? '+' : ''}{priceData.changePercent.toFixed(1)}%
            </span>
            {stock.appliedStrategies && stock.appliedStrategies.length > 0 && (
              <>
                <span className="text-xs text-[var(--dekr-muted)]">•</span>
                <span className="text-xs text-[var(--dekr-muted)]">
                  Strategy: {stock.appliedStrategies[0]}
                </span>
              </>
            )}
            {stock.targetPrice && (
              <>
                <span className="text-xs text-[var(--dekr-muted)]">•</span>
                <span className="text-xs text-[var(--dekr-muted)]">
                  Target: ${stock.targetPrice}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">${priceData.price.toFixed(2)}</p>
        <p className={`text-xs ${changeColor}`}>
          {isPositive ? '+' : ''}${priceData.change.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
