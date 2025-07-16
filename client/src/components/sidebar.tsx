import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTierName, getTierLimits, getTierColor } from "@/lib/tier-utils";
import { 
  Layers, 
  Search, 
  TrendingUp, 
  Settings, 
  User,
  ArrowUp
} from "lucide-react";

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  if (!user) return null;

  const tierLimits = getTierLimits(user.tier);
  const tierName = getTierName(user.tier);
  const tierColorClass = getTierColor(user.tier);

  return (
    <div className="w-64 bg-[var(--dekr-secondary)] border-r border-[var(--dekr-border)] flex flex-col">
      {/* Logo & User Info */}
      <div className="p-6 border-b border-[var(--dekr-border)]">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Dekr</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <User className="w-4 h-4 mr-2 text-[var(--dekr-muted)]" />
              <p className="text-sm font-medium">{user.username}</p>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={`${tierColorClass} text-black text-xs font-medium`}>
                {tierName}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary hover:text-primary/80 text-xs p-0 h-auto"
              >
                <ArrowUp className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-primary bg-primary/10 hover:bg-primary/20"
          >
            <Layers className="w-4 h-4 mr-3" />
            My Decks
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-[var(--dekr-muted)] hover:text-white hover:bg-white/5"
          >
            <Search className="w-4 h-4 mr-3" />
            Discover
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-[var(--dekr-muted)] hover:text-white hover:bg-white/5"
          >
            <TrendingUp className="w-4 h-4 mr-3" />
            Analytics
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-[var(--dekr-muted)] hover:text-white hover:bg-white/5"
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>
        </div>

        {/* Tier Limits Info */}
        <Card className="mt-8 bg-[var(--dekr-card-bg)] border-[var(--dekr-border)]">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Your Limits</h4>
            <div className="space-y-2 text-xs text-[var(--dekr-muted)]">
              <div className="flex justify-between">
                <span>Decks</span>
                <span>
                  2/{tierLimits.maxDecks === -1 ? "∞" : tierLimits.maxDecks}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Stocks per deck</span>
                <span>
                  {tierLimits.maxStocksPerDeck === -1 ? "∞" : `${tierLimits.maxStocksPerDeck} max`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Strategies per stock</span>
                <span>
                  {tierLimits.maxStrategiesPerStock === -1 ? "∞" : `${tierLimits.maxStrategiesPerStock} max`}
                </span>
              </div>
            </div>
            <Button 
              size="sm"
              className="w-full mt-3 bg-primary hover:bg-primary/90 text-white"
            >
              Upgrade for More
            </Button>
          </CardContent>
        </Card>
      </nav>
    </div>
  );
}
