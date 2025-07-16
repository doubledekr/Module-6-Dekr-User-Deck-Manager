import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import DeckCard from "@/components/deck-card";
import Recommendations from "@/components/recommendations";
import AddStockModal from "@/components/add-stock-modal";
import CreateDeckModal from "@/components/create-deck-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Plus, TrendingUp, Briefcase, Users, Activity } from "lucide-react";

export default function Dashboard() {
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: decks = [] } = useQuery({
    queryKey: ["/api/decks"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const unreadNotifications = notifications.filter((n: any) => !n.isRead);

  return (
    <div className="min-h-screen flex bg-[var(--dekr-dark-bg)] text-white">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[var(--dekr-secondary)] border-b border-[var(--dekr-border)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Decks</h1>
              <p className="text-[var(--dekr-muted)] text-sm">Manage your stock collections and strategies</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--dekr-muted)] w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)] pl-10 pr-4 py-2 text-sm focus:border-primary"
                />
              </div>
              
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[var(--dekr-muted)] hover:text-white"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
              
              {/* Create Deck */}
              <Button
                onClick={() => setShowCreateDeckModal(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Deck
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--dekr-muted)] text-sm">Total Decks</p>
                    <p className="text-2xl font-bold">{stats?.totalDecks || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--dekr-muted)] text-sm">Total Stocks</p>
                    <p className="text-2xl font-bold">{stats?.totalStocks || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--dekr-muted)] text-sm">Active Strategies</p>
                    <p className="text-2xl font-bold">{stats?.activeStrategies || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--dekr-muted)] text-sm">Notifications</p>
                    <p className="text-2xl font-bold">{stats?.notifications || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deck Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {decks.map((deck: any) => (
              <DeckCard key={deck.id} deck={deck} user={user} />
            ))}
          </div>

          {/* Recommendations */}
          <Recommendations />
        </main>
      </div>

      {/* Modals */}
      <AddStockModal 
        isOpen={showAddStockModal} 
        onClose={() => setShowAddStockModal(false)}
        decks={decks}
      />
      <CreateDeckModal
        isOpen={showCreateDeckModal}
        onClose={() => setShowCreateDeckModal(false)}
      />
    </div>
  );
}
