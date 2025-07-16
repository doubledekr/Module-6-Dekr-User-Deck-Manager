import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  tier: integer("tier").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const decks = pgTable("decks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("watchlist"), // watchlist, portfolio, strategy, research, custom
  isPublic: boolean("is_public").notNull().default(false),
  settings: jsonb("settings").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull().references(() => decks.id),
  symbol: text("symbol").notNull(),
  notes: text("notes"),
  targetPrice: real("target_price"),
  stopLoss: real("stop_loss"),
  positionSize: real("position_size"),
  status: text("status").notNull().default("watching"), // watching, active, strategy_applied, archived
  tags: jsonb("tags").default("[]"),
  appliedStrategies: jsonb("applied_strategies").default("[]"),
  performanceData: jsonb("performance_data").default("{}"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").default("{}"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  config: jsonb("config").default("{}"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeckSchema = createInsertSchema(decks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  addedAt: true,
  lastUpdated: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Deck = typeof decks.$inferSelect;
export type InsertDeck = z.infer<typeof insertDeckSchema>;
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

// Tier definitions
export enum DataTier {
  FREEMIUM = 1,
  MARKET_HOURS_PRO = 2,
  SECTOR_SPECIALIST = 3,
  WEEKEND_WARRIOR = 4,
  DARK_POOL_INSIDER = 5,
  ALGORITHMIC_TRADER = 6,
  INSTITUTIONAL_ELITE = 7,
}

export const TIER_NAMES = {
  [DataTier.FREEMIUM]: "Freemium",
  [DataTier.MARKET_HOURS_PRO]: "Market Hours Pro",
  [DataTier.SECTOR_SPECIALIST]: "Sector Specialist",
  [DataTier.WEEKEND_WARRIOR]: "Weekend Warrior",
  [DataTier.DARK_POOL_INSIDER]: "Dark Pool Insider",
  [DataTier.ALGORITHMIC_TRADER]: "Algorithmic Trader",
  [DataTier.INSTITUTIONAL_ELITE]: "Institutional Elite",
};

export const TIER_LIMITS = {
  [DataTier.FREEMIUM]: {
    maxDecks: 1,
    maxStocksPerDeck: 3,
    maxStrategiesPerStock: 1,
    features: ["basic_tracking", "simple_notes"],
  },
  [DataTier.MARKET_HOURS_PRO]: {
    maxDecks: 3,
    maxStocksPerDeck: 15,
    maxStrategiesPerStock: 2,
    features: ["basic_tracking", "simple_notes", "price_targets", "basic_analytics"],
  },
  [DataTier.SECTOR_SPECIALIST]: {
    maxDecks: 5,
    maxStocksPerDeck: 25,
    maxStrategiesPerStock: 3,
    features: ["basic_tracking", "simple_notes", "price_targets", "basic_analytics", "sector_analysis"],
  },
  [DataTier.WEEKEND_WARRIOR]: {
    maxDecks: 10,
    maxStocksPerDeck: 50,
    maxStrategiesPerStock: 5,
    features: ["all_basic", "advanced_analytics", "performance_tracking", "custom_tags"],
  },
  [DataTier.DARK_POOL_INSIDER]: {
    maxDecks: 20,
    maxStocksPerDeck: 100,
    maxStrategiesPerStock: 10,
    features: ["all_basic", "advanced_analytics", "performance_tracking", "custom_tags", "institutional_data", "dark_pool_signals"],
  },
  [DataTier.ALGORITHMIC_TRADER]: {
    maxDecks: 50,
    maxStocksPerDeck: 250,
    maxStrategiesPerStock: 25,
    features: ["all_features", "api_access", "custom_integrations", "advanced_automation"],
  },
  [DataTier.INSTITUTIONAL_ELITE]: {
    maxDecks: -1,
    maxStocksPerDeck: -1,
    maxStrategiesPerStock: -1,
    features: ["all_features", "white_label", "priority_support", "custom_development"],
  },
};
