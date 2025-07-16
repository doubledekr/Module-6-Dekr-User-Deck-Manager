import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface StockSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (stock: any) => void;
}

export default function StockSearch({ isOpen, onClose, onSelectStock }: StockSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/stocks/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: !!debouncedQuery.trim(),
  });

  const handleSelectStock = (stock: any) => {
    onSelectStock(stock);
    onClose();
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Stocks</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--dekr-muted)] w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] pl-10 pr-4 py-2 text-white"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-[var(--dekr-muted)] mt-2">Searching...</p>
              </div>
            )}

            {!isLoading && searchResults.length === 0 && debouncedQuery && (
              <div className="text-center py-8 text-[var(--dekr-muted)]">
                <p>No stocks found for "{debouncedQuery}"</p>
              </div>
            )}

            {!isLoading && searchResults.length === 0 && !debouncedQuery && (
              <div className="text-center py-8 text-[var(--dekr-muted)]">
                <p>Start typing to search for stocks</p>
              </div>
            )}

            <div className="space-y-2">
              {searchResults.map((stock: any, index: number) => (
                <Card key={index} className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4" onClick={() => handleSelectStock(stock)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-primary">{stock.symbol}</span>
                        </div>
                        <div>
                          <p className="font-medium">{stock.name}</p>
                          <p className="text-xs text-[var(--dekr-muted)]">{stock.sector}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${stock.price?.toFixed(2) || 'N/A'}</p>
                        <div className="flex items-center text-xs">
                          {stock.changePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                          )}
                          <span className={stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}