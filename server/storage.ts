import { users, decks, stocks, notifications, strategies, type User, type InsertUser, type Deck, type InsertDeck, type Stock, type InsertStock, type Notification, type InsertNotification, type Strategy, type InsertStrategy } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Deck methods
  getUserDecks(userId: number): Promise<Deck[]>;
  getDeck(id: number): Promise<Deck | undefined>;
  createDeck(deck: InsertDeck): Promise<Deck>;
  updateDeck(id: number, updates: Partial<Deck>): Promise<Deck | undefined>;
  deleteDeck(id: number): Promise<boolean>;

  // Stock methods
  getDeckStocks(deckId: number): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, updates: Partial<Stock>): Promise<Stock | undefined>;
  deleteStock(id: number): Promise<boolean>;

  // Notification methods
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<boolean>;

  // Strategy methods
  getStrategies(): Promise<Strategy[]>;
  getStrategy(id: number): Promise<Strategy | undefined>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private decks: Map<number, Deck> = new Map();
  private stocks: Map<number, Stock> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private strategies: Map<number, Strategy> = new Map();
  private currentUserId = 1;
  private currentDeckId = 1;
  private currentStockId = 1;
  private currentNotificationId = 1;
  private currentStrategyId = 1;

  constructor() {
    // Initialize with demo user
    this.createUser({
      username: "john_doe",
      password: "password123",
      email: "john@example.com",
      tier: 2, // Market Hours Pro
    });

    // Initialize with demo strategies
    this.createStrategy({
      name: "MA Cross",
      description: "Moving Average Crossover Strategy",
      config: { shortMA: 10, longMA: 20 },
      isActive: true,
    });

    this.createStrategy({
      name: "RSI Momentum",
      description: "RSI-based momentum strategy",
      config: { rsiPeriod: 14, oversold: 30, overbought: 70 },
      isActive: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      tier: insertUser.tier || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Deck methods
  async getUserDecks(userId: number): Promise<Deck[]> {
    return Array.from(this.decks.values()).filter(deck => deck.userId === userId);
  }

  async getDeck(id: number): Promise<Deck | undefined> {
    return this.decks.get(id);
  }

  async createDeck(insertDeck: InsertDeck): Promise<Deck> {
    const deck: Deck = {
      id: this.currentDeckId++,
      ...insertDeck,
      type: insertDeck.type || "watchlist",
      description: insertDeck.description || null,
      isPublic: insertDeck.isPublic || false,
      settings: insertDeck.settings || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.decks.set(deck.id, deck);
    return deck;
  }

  async updateDeck(id: number, updates: Partial<Deck>): Promise<Deck | undefined> {
    const deck = this.decks.get(id);
    if (!deck) return undefined;
    
    const updatedDeck = { ...deck, ...updates, updatedAt: new Date() };
    this.decks.set(id, updatedDeck);
    return updatedDeck;
  }

  async deleteDeck(id: number): Promise<boolean> {
    // Also delete all stocks in this deck
    const deckStocks = await this.getDeckStocks(id);
    for (const stock of deckStocks) {
      this.stocks.delete(stock.id);
    }
    
    return this.decks.delete(id);
  }

  // Stock methods
  async getDeckStocks(deckId: number): Promise<Stock[]> {
    return Array.from(this.stocks.values()).filter(stock => stock.deckId === deckId);
  }

  async getStock(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const stock: Stock = {
      id: this.currentStockId++,
      ...insertStock,
      status: insertStock.status || "watching",
      notes: insertStock.notes || null,
      targetPrice: insertStock.targetPrice || null,
      stopLoss: insertStock.stopLoss || null,
      positionSize: insertStock.positionSize || null,
      tags: insertStock.tags || [],
      appliedStrategies: insertStock.appliedStrategies || [],
      performanceData: insertStock.performanceData || {},
      addedAt: new Date(),
      lastUpdated: new Date(),
    };
    this.stocks.set(stock.id, stock);
    return stock;
  }

  async updateStock(id: number, updates: Partial<Stock>): Promise<Stock | undefined> {
    const stock = this.stocks.get(id);
    if (!stock) return undefined;
    
    const updatedStock = { ...stock, ...updates, lastUpdated: new Date() };
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }

  async deleteStock(id: number): Promise<boolean> {
    return this.stocks.delete(id);
  }

  // Notification methods
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.currentNotificationId++,
      ...insertNotification,
      data: insertNotification.data || {},
      isRead: insertNotification.isRead || false,
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  // Strategy methods
  async getStrategies(): Promise<Strategy[]> {
    return Array.from(this.strategies.values());
  }

  async getStrategy(id: number): Promise<Strategy | undefined> {
    return this.strategies.get(id);
  }

  async createStrategy(insertStrategy: InsertStrategy): Promise<Strategy> {
    const strategy: Strategy = {
      id: this.currentStrategyId++,
      ...insertStrategy,
      description: insertStrategy.description || null,
      config: insertStrategy.config || {},
      isActive: insertStrategy.isActive !== undefined ? insertStrategy.isActive : true,
      createdAt: new Date(),
    };
    this.strategies.set(strategy.id, strategy);
    return strategy;
  }
}

export const storage = new MemStorage();
