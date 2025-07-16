import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertDeckSchema, insertStockSchema, insertNotificationSchema, TIER_LIMITS, DataTier } from "@shared/schema";
import { marketDataService } from "./market-data";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user session - in production, this would be handled by authentication middleware
  const getCurrentUser = async () => {
    return await storage.getUser(1); // Demo user
  };

  // Get user profile
  app.get("/api/user", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user decks
  app.get("/api/decks", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const decks = await storage.getUserDecks(user.id);
      
      // Add stock counts to each deck
      const decksWithStockCounts = await Promise.all(
        decks.map(async (deck) => {
          const stocks = await storage.getDeckStocks(deck.id);
          return {
            ...deck,
            stockCount: stocks.length,
            stocks: stocks,
          };
        })
      );

      res.json(decksWithStockCounts);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new deck
  app.post("/api/decks", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check tier limits
      const tierLimits = TIER_LIMITS[user.tier as DataTier];
      const existingDecks = await storage.getUserDecks(user.id);
      
      if (tierLimits.maxDecks !== -1 && existingDecks.length >= tierLimits.maxDecks) {
        return res.status(400).json({ error: "Deck limit reached for your tier" });
      }

      const deckData = insertDeckSchema.parse({ ...req.body, userId: user.id });
      const deck = await storage.createDeck(deckData);
      res.json(deck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid deck data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update deck
  app.put("/api/decks/:id", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const deckId = parseInt(req.params.id);
      const deck = await storage.getDeck(deckId);
      
      if (!deck || deck.userId !== user.id) {
        return res.status(404).json({ error: "Deck not found" });
      }

      const updatedDeck = await storage.updateDeck(deckId, req.body);
      res.json(updatedDeck);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete deck
  app.delete("/api/decks/:id", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const deckId = parseInt(req.params.id);
      const deck = await storage.getDeck(deckId);
      
      if (!deck || deck.userId !== user.id) {
        return res.status(404).json({ error: "Deck not found" });
      }

      await storage.deleteDeck(deckId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get deck stocks with real-time market data
  app.get("/api/decks/:id/stocks", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const deckId = parseInt(req.params.id);
      const deck = await storage.getDeck(deckId);
      
      if (!deck || deck.userId !== user.id) {
        return res.status(404).json({ error: "Deck not found" });
      }

      const stocks = await storage.getDeckStocks(deckId);
      
      // Enrich with real-time market data if available
      if (marketDataService.isAvailable()) {
        const enrichedStocks = await Promise.all(
          stocks.map(async (stock) => {
            try {
              const marketData = await marketDataService.getStockQuote(stock.symbol);
              return {
                ...stock,
                marketData: {
                  name: marketData.name,
                  price: marketData.price,
                  change: marketData.change,
                  changePercent: marketData.changePercent,
                  sector: marketData.sector,
                }
              };
            } catch (error) {
              console.error(`Failed to get market data for ${stock.symbol}:`, error);
              return stock;
            }
          })
        );
        res.json(enrichedStocks);
      } else {
        res.json(stocks);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add stock to deck
  app.post("/api/decks/:id/stocks", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const deckId = parseInt(req.params.id);
      const deck = await storage.getDeck(deckId);
      
      if (!deck || deck.userId !== user.id) {
        return res.status(404).json({ error: "Deck not found" });
      }

      // Check tier limits
      const tierLimits = TIER_LIMITS[user.tier as DataTier];
      const existingStocks = await storage.getDeckStocks(deckId);
      
      if (tierLimits.maxStocksPerDeck !== -1 && existingStocks.length >= tierLimits.maxStocksPerDeck) {
        return res.status(400).json({ error: "Stock limit reached for your tier" });
      }

      // Check if stock already exists in deck
      const existingStock = existingStocks.find(stock => stock.symbol === req.body.symbol);
      if (existingStock) {
        return res.status(400).json({ error: "Stock already exists in this deck" });
      }

      const stockData = insertStockSchema.parse({ ...req.body, deckId });
      const stock = await storage.createStock(stockData);
      res.json(stock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid stock data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update stock
  app.put("/api/stocks/:id", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const stockId = parseInt(req.params.id);
      const stock = await storage.getStock(stockId);
      
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      // Verify user owns the deck
      const deck = await storage.getDeck(stock.deckId);
      if (!deck || deck.userId !== user.id) {
        return res.status(404).json({ error: "Stock not found" });
      }

      const updatedStock = await storage.updateStock(stockId, req.body);
      res.json(updatedStock);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete stock
  app.delete("/api/stocks/:id", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const stockId = parseInt(req.params.id);
      const stock = await storage.getStock(stockId);
      
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      // Verify user owns the deck
      const deck = await storage.getDeck(stock.deckId);
      if (!deck || deck.userId !== user.id) {
        return res.status(404).json({ error: "Stock not found" });
      }

      await storage.deleteStock(stockId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const notifications = await storage.getUserNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const notificationId = parseInt(req.params.id);
      const success = await storage.markNotificationRead(notificationId);
      
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get available strategies
  app.get("/api/strategies", async (req, res) => {
    try {
      const strategies = await storage.getStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Real stock search endpoint using Polygon API
  app.get("/api/stocks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }

      if (!marketDataService.isAvailable()) {
        return res.status(503).json({ error: "Market data service unavailable" });
      }

      const stocks = await marketDataService.searchStocks(query, 10);
      res.json(stocks);
    } catch (error) {
      console.error("Stock search error:", error);
      res.status(500).json({ error: "Failed to search stocks" });
    }
  });

  // Get stock recommendations using real market data
  app.get("/api/recommendations", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (!marketDataService.isAvailable()) {
        return res.status(503).json({ error: "Market data service unavailable" });
      }

      // Get top performing stocks as recommendations
      const topStocks = await marketDataService.getTopStocks(6);
      
      // Format as recommendations with confidence and reason
      const recommendations = topStocks.map(stock => ({
        ...stock,
        confidence: stock.changePercent > 5 ? "High" : stock.changePercent > 0 ? "Medium" : "Low",
        reason: stock.changePercent > 0 ? "Strong performance today" : "Potential value opportunity",
      }));

      res.json(recommendations);
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // Get real-time quote for a specific stock
  app.get("/api/stocks/:symbol/quote", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      if (!marketDataService.isAvailable()) {
        return res.status(503).json({ error: "Market data service unavailable" });
      }

      const quote = await marketDataService.getStockQuote(symbol);
      res.json(quote);
    } catch (error) {
      console.error(`Quote error for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to get stock quote" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const decks = await storage.getUserDecks(user.id);
      const notifications = await storage.getUserNotifications(user.id);
      const unreadNotifications = notifications.filter(n => !n.isRead);

      let totalStocks = 0;
      let activeStrategies = 0;

      for (const deck of decks) {
        const stocks = await storage.getDeckStocks(deck.id);
        totalStocks += stocks.length;
        
        for (const stock of stocks) {
          const strategies = stock.appliedStrategies as any[];
          activeStrategies += strategies?.length || 0;
        }
      }

      res.json({
        totalDecks: decks.length,
        totalStocks,
        activeStrategies,
        notifications: unreadNotifications.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
