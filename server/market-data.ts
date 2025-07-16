import fetch from 'node-fetch';

interface PolygonQuote {
  symbol: string;
  last: {
    price: number;
    change: number;
    change_percent: number;
  };
}

interface PolygonStockDetails {
  symbol: string;
  name: string;
  market_cap?: number;
  share_class_shares_outstanding?: number;
  weighted_shares_outstanding?: number;
  description?: string;
  homepage_url?: string;
  total_employees?: number;
  list_date?: string;
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
  sic_description?: string;
  ticker_root?: string;
  primary_exchange?: string;
  type?: string;
  active?: boolean;
  currency_name?: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  locale?: string;
  last_updated_utc?: string;
}

interface PolygonSearchResult {
  symbol: string;
  name: string;
  market?: string;
  locale?: string;
  primary_exchange?: string;
  type?: string;
  active?: boolean;
  currency_name?: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  last_updated_utc?: string;
}

interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
  marketCap?: number;
  description?: string;
}

class MarketDataService {
  private apiKey: string;
  private baseUrl = 'https://api.polygon.io';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minute cache

  constructor() {
    this.apiKey = process.env.POLYGON_API_KEY || '';
    if (!this.apiKey) {
      console.warn('POLYGON_API_KEY not found, using mock data');
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Polygon API key not configured');
    }

    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Polygon API request failed:', error);
      throw error;
    }
  }

  async getStockQuote(symbol: string): Promise<MarketStock> {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get current price data
      const priceData = await this.makeRequest(`/v2/last/nbbo/${symbol}`);
      
      // Get previous close for change calculation
      const prevCloseData = await this.makeRequest(`/v2/aggs/ticker/${symbol}/prev`);
      
      // Get stock details
      const detailsData = await this.makeRequest(`/v3/reference/tickers/${symbol}`);

      const currentPrice = priceData.results?.last?.price || 0;
      const prevClose = prevCloseData.results?.[0]?.c || currentPrice;
      const change = currentPrice - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      const stock: MarketStock = {
        symbol: symbol.toUpperCase(),
        name: detailsData.results?.name || `${symbol} Corp.`,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        sector: detailsData.results?.sic_description || 'Unknown',
        marketCap: detailsData.results?.market_cap,
        description: detailsData.results?.description,
      };

      this.setCachedData(cacheKey, stock);
      return stock;
    } catch (error) {
      console.error(`Failed to get quote for ${symbol}:`, error);
      // Return fallback data
      return {
        symbol: symbol.toUpperCase(),
        name: `${symbol} Corp.`,
        price: 100.00,
        change: 0,
        changePercent: 0,
        sector: 'Unknown',
      };
    }
  }

  async searchStocks(query: string, limit: number = 10): Promise<MarketStock[]> {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchData = await this.makeRequest(`/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=${limit}`);
      
      const results: MarketStock[] = [];
      
      if (searchData.results) {
        // Get quotes for each result in parallel
        const quotePromises = searchData.results.slice(0, limit).map(async (ticker: PolygonSearchResult) => {
          try {
            return await this.getStockQuote(ticker.symbol);
          } catch (error) {
            // Return basic info if quote fails
            return {
              symbol: ticker.symbol,
              name: ticker.name || `${ticker.symbol} Corp.`,
              price: 0,
              change: 0,
              changePercent: 0,
              sector: 'Unknown',
            };
          }
        });

        const quotes = await Promise.all(quotePromises);
        results.push(...quotes.filter(q => q.price > 0)); // Filter out failed quotes
      }

      this.setCachedData(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Stock search failed:', error);
      return [];
    }
  }

  async getTopStocks(limit: number = 10): Promise<MarketStock[]> {
    const cacheKey = `top_stocks_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get most active stocks
      const gainersData = await this.makeRequest(`/v2/snapshot/locale/us/markets/stocks/gainers?include_otc=false`);
      
      const results: MarketStock[] = [];
      
      if (gainersData.results) {
        const topTickers = gainersData.results.slice(0, limit);
        
        for (const ticker of topTickers) {
          try {
            const stock: MarketStock = {
              symbol: ticker.ticker,
              name: ticker.name || `${ticker.ticker} Corp.`,
              price: ticker.value || 0,
              change: ticker.change || 0,
              changePercent: ticker.change_percentage || 0,
              sector: 'Unknown',
            };
            results.push(stock);
          } catch (error) {
            console.error(`Failed to process ticker ${ticker.ticker}:`, error);
          }
        }
      }

      this.setCachedData(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Failed to get top stocks:', error);
      return [];
    }
  }

  async getStockDetails(symbol: string): Promise<any> {
    const cacheKey = `details_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const detailsData = await this.makeRequest(`/v3/reference/tickers/${symbol}`);
      this.setCachedData(cacheKey, detailsData.results);
      return detailsData.results;
    } catch (error) {
      console.error(`Failed to get details for ${symbol}:`, error);
      return null;
    }
  }

  // Check if API is available
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

export const marketDataService = new MarketDataService();