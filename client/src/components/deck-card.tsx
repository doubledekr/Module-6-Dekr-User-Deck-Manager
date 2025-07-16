import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StockItem from "@/components/stock-item";
import { getTierLimits, canCreateDeck } from "@/lib/tier-utils";
import { 
  Eye, 
  Briefcase, 
  Settings, 
  MoreVertical, 
  Lock,
  TrendingUp,
  Plus
} from "lucide-react";

interface DeckCardProps {
  deck: any;
  user: any;
}

export default function DeckCard({ deck, user }: DeckCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "watchlist":
        return <Eye className="w-5 h-5 text-primary" />;
      case "portfolio":
        return <Briefcase className="w-5 h-5 text-green-500" />;
      case "strategy":
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default:
        return <Eye className="w-5 h-5 text-primary" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "watchlist":
        return "bg-primary/10";
      case "portfolio":
        return "bg-green-500/10";
      case "strategy":
        return "bg-orange-500/10";
      default:
        return "bg-primary/10";
    }
  };

  // Check if this is a placeholder for tier limits
  if (deck.isPlaceholder) {
    return (
      <Card className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)] opacity-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--dekr-muted)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[var(--dekr-muted)]" />
              </div>
              <h3 className="font-semibold mb-2">Create Another Deck</h3>
              <p className="text-sm text-[var(--dekr-muted)] mb-4">
                Upgrade to unlock more decks
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedStocks = deck.stocks?.slice(0, 3) || [];
  const hasMoreStocks = (deck.stocks?.length || 0) > 3;

  return (
    <Card className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)] hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getTypeColor(deck.type)}`}>
              {getTypeIcon(deck.type)}
            </div>
            <div>
              <h3 className="font-semibold">{deck.name}</h3>
              <p className="text-sm text-[var(--dekr-muted)]">
                {deck.type} • {deck.stockCount || 0} stocks
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[var(--dekr-muted)] hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[var(--dekr-muted)] hover:text-white"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {displayedStocks.length > 0 ? (
            displayedStocks.map((stock: any, index: number) => (
              <StockItem key={stock.id || index} stock={stock} />
            ))
          ) : (
            <div className="text-center py-8 text-[var(--dekr-muted)]">
              <p className="text-sm">No stocks in this deck yet</p>
              <Button 
                variant="ghost" 
                size="sm"
                className="mt-2 text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Stock
              </Button>
            </div>
          )}
        </div>

        {displayedStocks.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-500">+$3.64 today</span>
              <span className="text-xs text-[var(--dekr-muted)]">•</span>
              <span className="text-xs text-[var(--dekr-muted)]">
                Last updated 5m ago
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary hover:text-primary/80 text-sm p-0 h-auto"
            >
              {hasMoreStocks ? "View All" : "Manage"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
