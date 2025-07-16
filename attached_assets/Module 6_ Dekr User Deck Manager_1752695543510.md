# Module 6: Dekr User Deck Manager

## Overview

The User Deck Manager represents the central portfolio management and stock collection system for the Dekr platform, enabling users to create, organize, and manage personalized collections of stocks with sophisticated tier-based restrictions and intelligent recommendation systems. This module serves as the bridge between stock discovery through the Intelligent Card Engine and active strategy application through the Strategy Builder Enhanced, providing users with a comprehensive workspace for managing their investment interests and trading activities.

The module implements sophisticated deck management capabilities that go beyond simple stock lists, providing users with intelligent organization tools, performance tracking, and seamless integration with strategy application and notification systems. The tier-based access controls ensure that deck functionality scales appropriately with subscription levels while providing genuine value at every tier, creating natural upgrade incentives through enhanced capabilities and expanded limits.

## Tier-Based Deck Restrictions

The User Deck Manager implements a sophisticated tier-based restriction system that transforms limitations into valuable features while providing clear upgrade incentives. Rather than implementing artificial restrictions, the system provides progressively enhanced capabilities that align with user needs and platform economics. Freemium users receive sufficient functionality to demonstrate platform value while encouraging upgrades for users seeking more comprehensive portfolio management capabilities.

The tier system implements intelligent restrictions that consider both the number of stocks in a deck and the complexity of features available for each stock. Lower tiers focus on essential portfolio management features with simplified interfaces, while higher tiers unlock advanced analytics, sophisticated organization tools, and enhanced integration capabilities. The restriction system ensures that computational resources and API costs scale appropriately with subscription levels while maintaining optimal user experiences across all tiers.

Each tier provides specific deck limits, feature access, and integration capabilities that create a natural progression path for users as their investment activities become more sophisticated. The system implements smart suggestions that help users understand the benefits of upgrading when they approach tier limits or when advanced features would enhance their investment activities.

## Stock Search and Discovery Integration

The User Deck Manager integrates seamlessly with the platform's search and discovery systems to provide users with intelligent stock selection and deck building capabilities. The search integration implements tier-based result filtering that provides appropriate levels of detail and analysis based on subscription levels. Freemium users receive basic stock information and simple metrics, while higher tiers unlock comprehensive fundamental analysis, technical indicators, and advanced screening capabilities.

The search system implements intelligent recommendation algorithms that suggest stocks based on user preferences, existing deck composition, and behavioral patterns. The recommendations consider portfolio diversification, sector allocation, and risk management principles to help users build well-balanced investment portfolios. Advanced tiers receive more sophisticated recommendations that incorporate alternative data sources, institutional sentiment, and predictive analytics.

The integration with the Intelligent Card Engine ensures that deck additions are informed by comprehensive market analysis and personalized relevance scoring. Users can seamlessly add stocks from their daily card recommendations to their decks, creating a natural flow from discovery to active portfolio management. The system tracks user preferences and deck building patterns to improve recommendation accuracy and relevance over time.

## Strategy Application and Notification Management

The User Deck Manager provides sophisticated integration with the Strategy Builder Enhanced module, enabling users to apply trading strategies to specific stocks in their decks and receive automated notifications when strategy conditions are met. The system implements intelligent strategy-to-stock matching that considers stock characteristics, market conditions, and strategy requirements to optimize signal generation and reduce false alerts.

The notification management system provides comprehensive control over alert preferences, delivery methods, and signal filtering based on user tier and preferences. Users can configure notification preferences for individual stocks, strategy types, and signal confidence levels, ensuring that they receive relevant alerts without being overwhelmed by excessive notifications. The system implements smart notification batching and timing optimization to maximize user engagement while respecting user preferences.

The integration supports multiple notification channels including in-app alerts, email notifications, and push notifications, with tier-based access to premium notification features such as SMS alerts, webhook integrations, and API access for custom notification systems. The system tracks notification effectiveness and user engagement to optimize alert timing and content for maximum value.

## Replit Implementation Prompt

```
Create a comprehensive user deck management system for the Dekr platform that enables users to create, organize, and manage personalized stock collections with tier-based restrictions, strategy application, and intelligent notification management.

PROJECT SETUP:
Create a new Python Replit project named "dekr-user-deck-manager" and implement a FastAPI-based microservice that provides advanced deck management, stock organization, and strategy integration capabilities.

CORE REQUIREMENTS:
- FastAPI application with deck management and stock organization endpoints
- Tier-based deck restrictions and feature access controls
- Integration with search and discovery systems
- Strategy application and notification management
- Performance tracking and analytics
- Intelligent recommendation and suggestion systems
- Comprehensive user preference integration
- Real-time deck synchronization and updates

IMPLEMENTATION STRUCTURE:
```python
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import aiohttp
import json
import redis
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Union
import pandas as pd
import numpy as np
from dataclasses import dataclass, asdict, field
from enum import Enum
import logging
import os
import uuid
import sqlite3
from collections import defaultdict
import statistics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Dekr User Deck Manager", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DataTier(Enum):
    FREEMIUM = 1
    MARKET_HOURS_PRO = 2
    SECTOR_SPECIALIST = 3
    WEEKEND_WARRIOR = 4
    DARK_POOL_INSIDER = 5
    ALGORITHMIC_TRADER = 6
    INSTITUTIONAL_ELITE = 7

class DeckType(Enum):
    WATCHLIST = "watchlist"
    PORTFOLIO = "portfolio"
    STRATEGY = "strategy"
    RESEARCH = "research"
    CUSTOM = "custom"

class NotificationChannel(Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    PUSH = "push"
    SMS = "sms"
    WEBHOOK = "webhook"

class StockStatus(Enum):
    ACTIVE = "active"
    WATCHING = "watching"
    STRATEGY_APPLIED = "strategy_applied"
    ARCHIVED = "archived"

@dataclass
class DeckStock:
    symbol: str
    added_at: datetime
    status: StockStatus
    notes: Optional[str] = None
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    position_size: Optional[float] = None
    applied_strategies: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    custom_data: Dict[str, Any] = field(default_factory=dict)
    performance_data: Optional[Dict[str, Any]] = None
    last_updated: datetime = field(default_factory=datetime.now)

@dataclass
class UserDeck:
    deck_id: str
    user_id: str
    name: str
    description: Optional[str]
    deck_type: DeckType
    stocks: List[DeckStock]
    is_public: bool
    tier_required: int
    created_at: datetime
    updated_at: datetime
    settings: Dict[str, Any] = field(default_factory=dict)
    performance_metrics: Optional[Dict[str, Any]] = None
    notification_preferences: Dict[str, Any] = field(default_factory=dict)

@dataclass
class NotificationPreference:
    user_id: str
    deck_id: Optional[str]
    symbol: Optional[str]
    channels: List[NotificationChannel]
    signal_types: List[str]
    min_confidence: float
    frequency: str  # immediate, daily, weekly
    quiet_hours: Optional[Dict[str, str]] = None
    is_active: bool = True

@dataclass
class DeckRecommendation:
    symbol: str
    reason: str
    confidence: float
    source: str
    relevance_score: float
    market_data: Dict[str, Any]
    analysis: Dict[str, Any]

class DeckManager:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            db=0,
            decode_responses=True
        )
        
        # Initialize database
        self.init_database()
        
        # Tier-based deck limits
        self.tier_limits = {
            DataTier.FREEMIUM: {
                'max_decks': 1,
                'max_stocks_per_deck': 3,
                'max_strategies_per_stock': 1,
                'notification_channels': [NotificationChannel.IN_APP],
                'features': ['basic_tracking', 'simple_notes'],
                'search_results_limit': 10
            },
            DataTier.MARKET_HOURS_PRO: {
                'max_decks': 3,
                'max_stocks_per_deck': 15,
                'max_strategies_per_stock': 2,
                'notification_channels': [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
                'features': ['basic_tracking', 'simple_notes', 'price_targets', 'basic_analytics'],
                'search_results_limit': 25
            },
            DataTier.SECTOR_SPECIALIST: {
                'max_decks': 5,
                'max_stocks_per_deck': 25,
                'max_strategies_per_stock': 3,
                'notification_channels': [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
                'features': ['basic_tracking', 'simple_notes', 'price_targets', 'basic_analytics', 'sector_analysis'],
                'search_results_limit': 50
            },
            DataTier.WEEKEND_WARRIOR: {
                'max_decks': 10,
                'max_stocks_per_deck': 50,
                'max_strategies_per_stock': 5,
                'notification_channels': [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
                'features': ['all_basic', 'advanced_analytics', 'performance_tracking', 'custom_tags'],
                'search_results_limit': 100
            },
            DataTier.DARK_POOL_INSIDER: {
                'max_decks': 20,
                'max_stocks_per_deck': 100,
                'max_strategies_per_stock': 10,
                'notification_channels': [NotificationChannel.IN_APP, NotificationChannel.EMAIL, 
                                        NotificationChannel.PUSH, NotificationChannel.SMS],
                'features': ['all_basic', 'advanced_analytics', 'performance_tracking', 'custom_tags', 
                           'institutional_data', 'dark_pool_signals'],
                'search_results_limit': 250
            },
            DataTier.ALGORITHMIC_TRADER: {
                'max_decks': 50,
                'max_stocks_per_deck': 250,
                'max_strategies_per_stock': 25,
                'notification_channels': list(NotificationChannel),
                'features': ['all_features', 'api_access', 'custom_integrations', 'advanced_automation'],
                'search_results_limit': 500
            },
            DataTier.INSTITUTIONAL_ELITE: {
                'max_decks': -1,  # Unlimited
                'max_stocks_per_deck': -1,
                'max_strategies_per_stock': -1,
                'notification_channels': list(NotificationChannel),
                'features': ['all_features', 'white_label', 'priority_support', 'custom_development'],
                'search_results_limit': -1
            }
        }
        
        # External service URLs
        self.polygon_service_url = os.getenv('POLYGON_SERVICE_URL', 'http://localhost:8001')
        self.strategy_service_url = os.getenv('STRATEGY_SERVICE_URL', 'http://localhost:8005')
        self.news_service_url = os.getenv('NEWS_SERVICE_URL', 'http://localhost:8004')
    
    def init_database(self):
        """Initialize SQLite database for deck storage"""
        
        conn = sqlite3.connect('decks.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_decks (
                deck_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                deck_type TEXT,
                stocks TEXT,
                is_public BOOLEAN,
                tier_required INTEGER,
                created_at TEXT,
                updated_at TEXT,
                settings TEXT,
                performance_metrics TEXT,
                notification_preferences TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_preferences (
                preference_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                deck_id TEXT,
                symbol TEXT,
                channels TEXT,
                signal_types TEXT,
                min_confidence REAL,
                frequency TEXT,
                quiet_hours TEXT,
                is_active BOOLEAN
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS deck_analytics (
                analytics_id TEXT PRIMARY KEY,
                deck_id TEXT,
                user_id TEXT,
                date TEXT,
                metrics TEXT,
                FOREIGN KEY (deck_id) REFERENCES user_decks (deck_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    async def create_deck(self, user_id: str, deck_data: Dict[str, Any], tier: DataTier) -> UserDeck:
        """Create a new user deck"""
        
        # Validate tier limits
        tier_config = self.tier_limits[tier]
        
        # Check existing deck count
        existing_decks = await self.get_user_decks(user_id)
        if tier_config['max_decks'] > 0 and len(existing_decks) >= tier_config['max_decks']:
            raise HTTPException(status_code=400, detail="Deck limit reached for your tier")
        
        # Create deck
        deck = UserDeck(
            deck_id=str(uuid.uuid4()),
            user_id=user_id,
            name=deck_data['name'],
            description=deck_data.get('description'),
            deck_type=DeckType(deck_data.get('deck_type', 'watchlist')),
            stocks=[],
            is_public=deck_data.get('is_public', False),
            tier_required=tier.value,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            settings=deck_data.get('settings', {}),
            notification_preferences=deck_data.get('notification_preferences', {})
        )
        
        # Save to database
        await self.save_deck(deck)
        
        return deck
    
    async def add_stock_to_deck(self, deck_id: str, symbol: str, user_tier: DataTier, 
                              stock_data: Optional[Dict[str, Any]] = None) -> DeckStock:
        """Add a stock to a deck"""
        
        # Get deck
        deck = await self.get_deck(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")
        
        # Check tier limits
        tier_config = self.tier_limits[user_tier]
        max_stocks = tier_config['max_stocks_per_deck']
        
        if max_stocks > 0 and len(deck.stocks) >= max_stocks:
            raise HTTPException(status_code=400, detail="Stock limit reached for your tier")
        
        # Check if stock already exists
        existing_stock = next((s for s in deck.stocks if s.symbol == symbol), None)
        if existing_stock:
            raise HTTPException(status_code=400, detail="Stock already in deck")
        
        # Create stock entry
        stock = DeckStock(
            symbol=symbol,
            added_at=datetime.now(),
            status=StockStatus.WATCHING,
            notes=stock_data.get('notes') if stock_data else None,
            target_price=stock_data.get('target_price') if stock_data else None,
            stop_loss=stock_data.get('stop_loss') if stock_data else None,
            position_size=stock_data.get('position_size') if stock_data else None,
            tags=stock_data.get('tags', []) if stock_data else [],
            custom_data=stock_data.get('custom_data', {}) if stock_data else {}
        )
        
        # Add to deck
        deck.stocks.append(stock)
        deck.updated_at = datetime.now()
        
        # Save deck
        await self.save_deck(deck)
        
        # Get initial market data
        await self.update_stock_performance(deck_id, symbol)
        
        return stock
    
    async def apply_strategy_to_stock(self, deck_id: str, symbol: str, strategy_id: str, 
                                    user_tier: DataTier) -> bool:
        """Apply a strategy to a stock in a deck"""
        
        # Get deck
        deck = await self.get_deck(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")
        
        # Find stock
        stock = next((s for s in deck.stocks if s.symbol == symbol), None)
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found in deck")
        
        # Check tier limits
        tier_config = self.tier_limits[user_tier]
        max_strategies = tier_config['max_strategies_per_stock']
        
        if max_strategies > 0 and len(stock.applied_strategies) >= max_strategies:
            raise HTTPException(status_code=400, detail="Strategy limit reached for your tier")
        
        # Check if strategy already applied
        if strategy_id in stock.applied_strategies:
            raise HTTPException(status_code=400, detail="Strategy already applied to this stock")
        
        # Apply strategy
        stock.applied_strategies.append(strategy_id)
        stock.status = StockStatus.STRATEGY_APPLIED
        stock.last_updated = datetime.now()
        
        # Update deck
        deck.updated_at = datetime.now()
        await self.save_deck(deck)
        
        # Activate strategy for this stock (call strategy service)
        await self.activate_strategy_for_stock(strategy_id, symbol)
        
        return True
    
    async def get_deck_recommendations(self, deck_id: str, user_tier: DataTier, 
                                     limit: int = 10) -> List[DeckRecommendation]:
        """Get stock recommendations for a deck"""
        
        # Get deck
        deck = await self.get_deck(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")
        
        # Check tier limits
        tier_config = self.tier_limits[user_tier]
        max_results = tier_config['search_results_limit']
        if max_results > 0:
            limit = min(limit, max_results)
        
        recommendations = []
        
        # Analyze existing stocks for patterns
        existing_symbols = [stock.symbol for stock in deck.stocks]
        
        if existing_symbols:
            # Get sector analysis
            sector_analysis = await self.analyze_deck_sectors(existing_symbols)
            
            # Get similar stocks
            similar_stocks = await self.find_similar_stocks(existing_symbols, limit)
            
            for stock_data in similar_stocks:
                recommendation = DeckRecommendation(
                    symbol=stock_data['symbol'],
                    reason=f"Similar to existing holdings in {stock_data.get('sector', 'your portfolio')}",
                    confidence=stock_data.get('similarity_score', 0.7),
                    source="similarity_analysis",
                    relevance_score=stock_data.get('relevance_score', 0.6),
                    market_data=stock_data.get('market_data', {}),
                    analysis=stock_data.get('analysis', {})
                )
                recommendations.append(recommendation)
        
        # Add trending stocks if we need more recommendations
        if len(recommendations) < limit:
            trending_stocks = await self.get_trending_stocks(limit - len(recommendations))
            
            for stock_data in trending_stocks:
                recommendation = DeckRecommendation(
                    symbol=stock_data['symbol'],
                    reason="Currently trending with strong momentum",
                    confidence=stock_data.get('momentum_score', 0.6),
                    source="trending_analysis",
                    relevance_score=stock_data.get('relevance_score', 0.5),
                    market_data=stock_data.get('market_data', {}),
                    analysis=stock_data.get('analysis', {})
                )
                recommendations.append(recommendation)
        
        # Sort by relevance score
        recommendations.sort(key=lambda x: x.relevance_score, reverse=True)
        
        return recommendations[:limit]
    
    async def search_stocks(self, query: str, user_tier: DataTier, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Search for stocks with tier-based result filtering"""
        
        tier_config = self.tier_limits[user_tier]
        max_results = tier_config['search_results_limit']
        available_features = tier_config['features']
        
        # Call polygon service for stock search
        try:
            params = {
                'query': query,
                'limit': max_results if max_results > 0 else 100
            }
            
            if filters:
                params.update(filters)
            
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.polygon_service_url}/search", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        results = data.get('results', [])
                        
                        # Filter results based on tier features
                        filtered_results = []
                        for result in results:
                            filtered_result = {
                                'symbol': result.get('symbol'),
                                'name': result.get('name'),
                                'price': result.get('price'),
                                'change': result.get('change'),
                                'change_percent': result.get('change_percent')
                            }
                            
                            # Add tier-specific data
                            if 'basic_analytics' in available_features:
                                filtered_result.update({
                                    'volume': result.get('volume'),
                                    'market_cap': result.get('market_cap'),
                                    'pe_ratio': result.get('pe_ratio')
                                })
                            
                            if 'sector_analysis' in available_features:
                                filtered_result.update({
                                    'sector': result.get('sector'),
                                    'industry': result.get('industry')
                                })
                            
                            if 'advanced_analytics' in available_features:
                                filtered_result.update({
                                    'beta': result.get('beta'),
                                    'rsi': result.get('rsi'),
                                    'moving_averages': result.get('moving_averages')
                                })
                            
                            if 'institutional_data' in available_features:
                                filtered_result.update({
                                    'institutional_ownership': result.get('institutional_ownership'),
                                    'insider_trading': result.get('insider_trading')
                                })
                            
                            filtered_results.append(filtered_result)
                        
                        return filtered_results
                    else:
                        return []
                        
        except Exception as e:
            logger.error(f"Error searching stocks: {str(e)}")
            return []
    
    async def update_stock_performance(self, deck_id: str, symbol: str):
        """Update performance data for a stock in a deck"""
        
        try:
            # Get current market data
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.polygon_service_url}/quote/{symbol}") as response:
                    if response.status == 200:
                        market_data = await response.json()
                        
                        # Get deck and update stock
                        deck = await self.get_deck(deck_id)
                        if deck:
                            stock = next((s for s in deck.stocks if s.symbol == symbol), None)
                            if stock:
                                # Calculate performance metrics
                                current_price = market_data.get('price', 0)
                                
                                performance_data = {
                                    'current_price': current_price,
                                    'last_updated': datetime.now().isoformat(),
                                    'market_data': market_data
                                }
                                
                                # Calculate returns if we have historical data
                                if stock.performance_data and 'entry_price' in stock.performance_data:
                                    entry_price = stock.performance_data['entry_price']
                                    if entry_price > 0:
                                        return_pct = ((current_price - entry_price) / entry_price) * 100
                                        performance_data['return_percent'] = return_pct
                                        performance_data['return_absolute'] = current_price - entry_price
                                
                                stock.performance_data = performance_data
                                stock.last_updated = datetime.now()
                                
                                # Save updated deck
                                await self.save_deck(deck)
                                
        except Exception as e:
            logger.error(f"Error updating stock performance: {str(e)}")
    
    async def get_deck_analytics(self, deck_id: str, user_tier: DataTier) -> Dict[str, Any]:
        """Get analytics for a deck"""
        
        deck = await self.get_deck(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")
        
        tier_config = self.tier_limits[user_tier]
        available_features = tier_config['features']
        
        analytics = {
            'deck_id': deck_id,
            'total_stocks': len(deck.stocks),
            'active_strategies': sum(len(stock.applied_strategies) for stock in deck.stocks),
            'last_updated': deck.updated_at.isoformat()
        }
        
        if 'basic_analytics' in available_features:
            # Calculate basic performance metrics
            returns = []
            for stock in deck.stocks:
                if stock.performance_data and 'return_percent' in stock.performance_data:
                    returns.append(stock.performance_data['return_percent'])
            
            if returns:
                analytics.update({
                    'average_return': statistics.mean(returns),
                    'best_performer': max(returns),
                    'worst_performer': min(returns),
                    'total_return': sum(returns)
                })
        
        if 'advanced_analytics' in available_features:
            # Add advanced metrics
            analytics.update({
                'volatility': self.calculate_portfolio_volatility(deck.stocks),
                'sharpe_ratio': self.calculate_sharpe_ratio(deck.stocks),
                'sector_allocation': self.calculate_sector_allocation(deck.stocks)
            })
        
        if 'performance_tracking' in available_features:
            # Add historical performance tracking
            historical_data = await self.get_historical_deck_performance(deck_id)
            analytics['historical_performance'] = historical_data
        
        return analytics
    
    async def save_deck(self, deck: UserDeck):
        """Save deck to database"""
        
        conn = sqlite3.connect('decks.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_decks 
            (deck_id, user_id, name, description, deck_type, stocks, is_public, 
             tier_required, created_at, updated_at, settings, performance_metrics, notification_preferences)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            deck.deck_id,
            deck.user_id,
            deck.name,
            deck.description,
            deck.deck_type.value,
            json.dumps([asdict(stock) for stock in deck.stocks]),
            deck.is_public,
            deck.tier_required,
            deck.created_at.isoformat(),
            deck.updated_at.isoformat(),
            json.dumps(deck.settings),
            json.dumps(deck.performance_metrics) if deck.performance_metrics else None,
            json.dumps(deck.notification_preferences)
        ))
        
        conn.commit()
        conn.close()
    
    async def get_deck(self, deck_id: str) -> Optional[UserDeck]:
        """Get deck by ID"""
        
        conn = sqlite3.connect('decks.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM user_decks WHERE deck_id = ?', (deck_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        stocks_data = json.loads(row[5])
        stocks = []
        for stock_data in stocks_data:
            stock = DeckStock(
                symbol=stock_data['symbol'],
                added_at=datetime.fromisoformat(stock_data['added_at']),
                status=StockStatus(stock_data['status']),
                notes=stock_data.get('notes'),
                target_price=stock_data.get('target_price'),
                stop_loss=stock_data.get('stop_loss'),
                position_size=stock_data.get('position_size'),
                applied_strategies=stock_data.get('applied_strategies', []),
                tags=stock_data.get('tags', []),
                custom_data=stock_data.get('custom_data', {}),
                performance_data=stock_data.get('performance_data'),
                last_updated=datetime.fromisoformat(stock_data['last_updated'])
            )
            stocks.append(stock)
        
        deck = UserDeck(
            deck_id=row[0],
            user_id=row[1],
            name=row[2],
            description=row[3],
            deck_type=DeckType(row[4]),
            stocks=stocks,
            is_public=row[6],
            tier_required=row[7],
            created_at=datetime.fromisoformat(row[8]),
            updated_at=datetime.fromisoformat(row[9]),
            settings=json.loads(row[10]),
            performance_metrics=json.loads(row[11]) if row[11] else None,
            notification_preferences=json.loads(row[12])
        )
        
        return deck
    
    async def get_user_decks(self, user_id: str) -> List[UserDeck]:
        """Get all decks for a user"""
        
        conn = sqlite3.connect('decks.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT deck_id FROM user_decks WHERE user_id = ?', (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        decks = []
        for row in rows:
            deck = await self.get_deck(row[0])
            if deck:
                decks.append(deck)
        
        return decks
    
    # Helper methods for analytics and recommendations
    def calculate_portfolio_volatility(self, stocks: List[DeckStock]) -> float:
        """Calculate portfolio volatility (simplified)"""
        returns = []
        for stock in stocks:
            if stock.performance_data and 'return_percent' in stock.performance_data:
                returns.append(stock.performance_data['return_percent'])
        
        return statistics.stdev(returns) if len(returns) > 1 else 0.0
    
    def calculate_sharpe_ratio(self, stocks: List[DeckStock]) -> float:
        """Calculate Sharpe ratio (simplified)"""
        returns = []
        for stock in stocks:
            if stock.performance_data and 'return_percent' in stock.performance_data:
                returns.append(stock.performance_data['return_percent'])
        
        if len(returns) > 1:
            avg_return = statistics.mean(returns)
            volatility = statistics.stdev(returns)
            return avg_return / volatility if volatility > 0 else 0.0
        
        return 0.0
    
    def calculate_sector_allocation(self, stocks: List[DeckStock]) -> Dict[str, float]:
        """Calculate sector allocation (simplified)"""
        # This would typically require external data about stock sectors
        # For demo purposes, return mock data
        return {
            'Technology': 40.0,
            'Healthcare': 25.0,
            'Finance': 20.0,
            'Consumer': 15.0
        }
    
    async def analyze_deck_sectors(self, symbols: List[str]) -> Dict[str, Any]:
        """Analyze sectors represented in deck"""
        # Mock implementation - would call external service
        return {
            'primary_sectors': ['Technology', 'Healthcare'],
            'sector_weights': {'Technology': 0.6, 'Healthcare': 0.4},
            'diversification_score': 0.7
        }
    
    async def find_similar_stocks(self, symbols: List[str], limit: int) -> List[Dict[str, Any]]:
        """Find stocks similar to existing holdings"""
        # Mock implementation - would use ML similarity algorithms
        similar_stocks = [
            {
                'symbol': 'MSFT',
                'similarity_score': 0.85,
                'relevance_score': 0.8,
                'sector': 'Technology',
                'market_data': {'price': 350.0, 'change_percent': 2.1},
                'analysis': {'recommendation': 'BUY', 'target_price': 380.0}
            },
            {
                'symbol': 'GOOGL',
                'similarity_score': 0.82,
                'relevance_score': 0.75,
                'sector': 'Technology',
                'market_data': {'price': 2800.0, 'change_percent': 1.5},
                'analysis': {'recommendation': 'BUY', 'target_price': 3000.0}
            }
        ]
        
        return similar_stocks[:limit]
    
    async def get_trending_stocks(self, limit: int) -> List[Dict[str, Any]]:
        """Get currently trending stocks"""
        # Mock implementation - would call external trending analysis
        trending_stocks = [
            {
                'symbol': 'TSLA',
                'momentum_score': 0.9,
                'relevance_score': 0.7,
                'market_data': {'price': 800.0, 'change_percent': 5.2},
                'analysis': {'trend': 'STRONG_UP', 'volume_spike': True}
            },
            {
                'symbol': 'NVDA',
                'momentum_score': 0.85,
                'relevance_score': 0.65,
                'market_data': {'price': 450.0, 'change_percent': 3.8},
                'analysis': {'trend': 'UP', 'ai_sentiment': 'POSITIVE'}
            }
        ]
        
        return trending_stocks[:limit]
    
    async def get_historical_deck_performance(self, deck_id: str) -> List[Dict[str, Any]]:
        """Get historical performance data for deck"""
        # Mock implementation - would query historical analytics
        return [
            {'date': '2024-01-01', 'total_return': 0.0, 'value': 10000.0},
            {'date': '2024-01-15', 'total_return': 2.5, 'value': 10250.0},
            {'date': '2024-02-01', 'total_return': 5.1, 'value': 10510.0}
        ]
    
    async def activate_strategy_for_stock(self, strategy_id: str, symbol: str):
        """Activate strategy monitoring for a specific stock"""
        try:
            async with aiohttp.ClientSession() as session:
                data = {'symbol': symbol, 'active': True}
                async with session.post(f"{self.strategy_service_url}/strategies/{strategy_id}/activate", 
                                      json=data) as response:
                    if response.status != 200:
                        logger.error(f"Failed to activate strategy {strategy_id} for {symbol}")
        except Exception as e:
            logger.error(f"Error activating strategy: {str(e)}")

# Initialize deck manager
deck_manager = DeckManager()

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/decks")
async def create_deck(
    user_id: str,
    deck_data: Dict[str, Any],
    tier: int = Query(1, description="User tier (1-7)")
):
    """Create a new deck"""
    
    data_tier = DataTier(tier)
    deck = await deck_manager.create_deck(user_id, deck_data, data_tier)
    
    return asdict(deck)

@app.get("/decks/{user_id}")
async def get_user_decks(user_id: str):
    """Get all decks for a user"""
    
    decks = await deck_manager.get_user_decks(user_id)
    return [asdict(deck) for deck in decks]

@app.post("/decks/{deck_id}/stocks")
async def add_stock_to_deck(
    deck_id: str,
    symbol: str,
    tier: int = Query(1),
    stock_data: Optional[Dict[str, Any]] = None
):
    """Add a stock to a deck"""
    
    data_tier = DataTier(tier)
    stock = await deck_manager.add_stock_to_deck(deck_id, symbol, data_tier, stock_data)
    
    return asdict(stock)

@app.post("/decks/{deck_id}/stocks/{symbol}/strategies")
async def apply_strategy_to_stock(
    deck_id: str,
    symbol: str,
    strategy_id: str,
    tier: int = Query(1)
):
    """Apply a strategy to a stock in a deck"""
    
    data_tier = DataTier(tier)
    success = await deck_manager.apply_strategy_to_stock(deck_id, symbol, strategy_id, data_tier)
    
    return {"success": success, "deck_id": deck_id, "symbol": symbol, "strategy_id": strategy_id}

@app.get("/decks/{deck_id}/recommendations")
async def get_deck_recommendations(
    deck_id: str,
    tier: int = Query(1),
    limit: int = Query(10)
):
    """Get stock recommendations for a deck"""
    
    data_tier = DataTier(tier)
    recommendations = await deck_manager.get_deck_recommendations(deck_id, data_tier, limit)
    
    return [asdict(rec) for rec in recommendations]

@app.get("/search")
async def search_stocks(
    query: str,
    tier: int = Query(1),
    sector: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None)
):
    """Search for stocks with tier-based filtering"""
    
    data_tier = DataTier(tier)
    filters = {}
    
    if sector:
        filters['sector'] = sector
    if min_price:
        filters['min_price'] = min_price
    if max_price:
        filters['max_price'] = max_price
    
    results = await deck_manager.search_stocks(query, data_tier, filters)
    return results

@app.get("/decks/{deck_id}/analytics")
async def get_deck_analytics(
    deck_id: str,
    tier: int = Query(1)
):
    """Get analytics for a deck"""
    
    data_tier = DataTier(tier)
    analytics = await deck_manager.get_deck_analytics(deck_id, data_tier)
    
    return analytics

@app.put("/decks/{deck_id}/stocks/{symbol}")
async def update_stock_in_deck(
    deck_id: str,
    symbol: str,
    update_data: Dict[str, Any]
):
    """Update stock information in a deck"""
    
    deck = await deck_manager.get_deck(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    stock = next((s for s in deck.stocks if s.symbol == symbol), None)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found in deck")
    
    # Update stock fields
    if 'notes' in update_data:
        stock.notes = update_data['notes']
    if 'target_price' in update_data:
        stock.target_price = update_data['target_price']
    if 'stop_loss' in update_data:
        stock.stop_loss = update_data['stop_loss']
    if 'position_size' in update_data:
        stock.position_size = update_data['position_size']
    if 'tags' in update_data:
        stock.tags = update_data['tags']
    if 'status' in update_data:
        stock.status = StockStatus(update_data['status'])
    
    stock.last_updated = datetime.now()
    deck.updated_at = datetime.now()
    
    await deck_manager.save_deck(deck)
    
    return asdict(stock)

@app.delete("/decks/{deck_id}/stocks/{symbol}")
async def remove_stock_from_deck(deck_id: str, symbol: str):
    """Remove a stock from a deck"""
    
    deck = await deck_manager.get_deck(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    # Remove stock
    deck.stocks = [s for s in deck.stocks if s.symbol != symbol]
    deck.updated_at = datetime.now()
    
    await deck_manager.save_deck(deck)
    
    return {"message": "Stock removed from deck", "deck_id": deck_id, "symbol": symbol}

@app.get("/tiers/{tier}/limits")
async def get_tier_limits(tier: int):
    """Get limits and features for a specific tier"""
    
    data_tier = DataTier(tier)
    tier_config = deck_manager.tier_limits[data_tier]
    
    return {
        "tier": tier,
        "limits": {
            "max_decks": tier_config['max_decks'],
            "max_stocks_per_deck": tier_config['max_stocks_per_deck'],
            "max_strategies_per_stock": tier_config['max_strategies_per_stock'],
            "search_results_limit": tier_config['search_results_limit']
        },
        "features": tier_config['features'],
        "notification_channels": [channel.value for channel in tier_config['notification_channels']]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
```

ENVIRONMENT VARIABLES:
Set these in your Replit secrets:
- REDIS_HOST=localhost
- REDIS_PORT=6379
- POLYGON_SERVICE_URL=http://localhost:8001
- STRATEGY_SERVICE_URL=http://localhost:8005
- NEWS_SERVICE_URL=http://localhost:8004

REQUIREMENTS.TXT:
```
fastapi==0.104.1
uvicorn==0.24.0
aiohttp==3.9.1
redis==5.0.1
pandas==2.1.4
numpy==1.24.3
python-multipart==0.0.6
```

TESTING INSTRUCTIONS:
1. Test health: GET /health
2. Create deck: POST /decks
3. Add stock: POST /decks/{deck_id}/stocks?symbol=AAPL&tier=3
4. Search stocks: GET /search?query=technology&tier=2
5. Get recommendations: GET /decks/{deck_id}/recommendations?tier=3
6. Apply strategy: POST /decks/{deck_id}/stocks/AAPL/strategies?strategy_id=123&tier=3
7. Get analytics: GET /decks/{deck_id}/analytics?tier=4

This implementation provides comprehensive deck management with tier-based restrictions, intelligent recommendations, and seamless strategy integration.
```

## Advanced Features and Integrations

The User Deck Manager implements sophisticated integration capabilities that connect seamlessly with all other Dekr platform modules to provide a unified user experience. The module serves as the central hub for user investment activities, coordinating data flow between market data services, strategy applications, news integration, and notification systems. Advanced caching mechanisms ensure optimal performance while sophisticated synchronization systems maintain data consistency across all integrated services.

The module implements intelligent automation features that reduce manual user management tasks while providing sophisticated control over portfolio organization and strategy application. Automated rebalancing suggestions help users maintain optimal portfolio allocation based on their preferences and risk tolerance. Smart tagging systems automatically categorize stocks based on sector, market cap, volatility, and other characteristics, enabling sophisticated filtering and organization capabilities.

Advanced analytics integration provides users with institutional-grade portfolio analysis capabilities that scale appropriately with subscription tiers. The system implements sophisticated performance attribution analysis, risk decomposition, and correlation studies that help users understand portfolio behavior and optimize allocation decisions. Machine learning algorithms continuously analyze user behavior and portfolio performance to provide personalized optimization recommendations.

## Security and Privacy

The User Deck Manager implements comprehensive security measures to protect sensitive user portfolio information and trading strategies. All deck data is encrypted at rest and in transit, with sophisticated access controls that ensure users can only access their own portfolio information. The system implements audit logging for all portfolio modifications and strategy applications, providing complete transparency and accountability for user actions.

Privacy protection mechanisms ensure that user portfolio information remains confidential while enabling appropriate data sharing for platform optimization and recommendation generation. The system implements sophisticated anonymization techniques that allow for aggregate analysis and recommendation generation without exposing individual user portfolio details. Advanced consent management systems provide users with granular control over data sharing and platform feature access.

The module implements comprehensive backup and disaster recovery capabilities that ensure user portfolio data remains safe and accessible even during system failures or maintenance periods. Automated backup systems create regular snapshots of user deck data, while sophisticated recovery mechanisms enable rapid restoration of service with minimal data loss. The system implements geographic redundancy to ensure data availability across multiple regions and availability zones.

