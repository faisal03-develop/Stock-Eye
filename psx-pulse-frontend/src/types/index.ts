export type NavScreen = 'onboarding' | 'dashboard' | 'screener' | 'prediction' | 'news' | 'backtest';

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  aiScore: number; // 0 - 100
  aiSignal: 'STRONG BUY' | 'BUY' | 'ACCUMULATE' | 'HOLD' | 'REDUCE';
  targetPrice: number;
  projectedReturn: number;
  horizon: string;
  volume: string;
  marketCap: string;
  peRatio: number;
  rsi: number;
  isWatchlist?: boolean;
}

export interface MacroIndicator {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
}

export interface NewsRumorItem {
  id: string;
  type: 'OFFICIAL' | 'RUMOR' | 'NEWS';
  headline: string;
  summary: string;
  source: string;
  timeAgo: string;
  credibilityScore: number; // 0 - 100%
  sentimentScore: number;   // e.g. +14.2%
  sentimentType: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  relatedTicker: string;
  verifiedBadge?: string;
  sourceType: string;
}

export interface BacktestRecord {
  id: string;
  ticker: string;
  date: string;
  signal: 'BUY' | 'STRONG BUY' | 'SELL';
  entryPrice: number;
  targetPrice: number;
  exitPrice: number;
  returnPercent: number;
  benchmarkReturn: number; // KSE-100 return over same period
  alphaPercent: number;
  status: 'TARGET HIT' | 'PARTIAL PROFIT' | 'STOPPED OUT';
  hitRate: number;
}

export interface UserPreferences {
  horizon: 'intraday' | 'short-term' | 'long-term';
  riskAppetite: 'defensive' | 'balanced' | 'aggressive';
  sectors: string[];
  isOnboarded: boolean;
}
