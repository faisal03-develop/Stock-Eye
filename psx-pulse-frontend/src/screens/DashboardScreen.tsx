import React, { useState } from 'react';
import { Stock, MacroIndicator, NavScreen } from '../types';

interface DashboardScreenProps {
  stocks: Stock[];
  macroIndicators: MacroIndicator[];
  onSelectStock: (stock: Stock) => void;
  onNavigate: (screen: NavScreen) => void;
  onOpenNotifications: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  stocks,
  macroIndicators,
  onSelectStock,
  onNavigate,
  onOpenNotifications,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuickStocks = searchQuery
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="w-full flex flex-col">
      {/* Persistent Top Status Strip */}
      <div className="sticky top-0 z-20 bg-surface-container/95 backdrop-blur-md border-b border-outline px-4 py-2 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container border border-primary/40 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[11px] font-semibold text-on-primary-container">
            PSX OPEN • 09:30–15:30 PKT
          </span>
        </div>
        <button
          onClick={() => onNavigate('screener')}
          aria-label="Quick ticker search"
          className="w-8 h-8 rounded-full bg-surface-container-high border border-outline flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-3 flex flex-col gap-5">
        {/* Header: Title & Notification Bell */}
        <header className="flex items-center justify-between gap-3">
          <div>
            <span className="font-label text-label-sm text-secondary uppercase tracking-wider font-semibold">
              PSX Pulse AI
            </span>
            <h1 className="font-headline text-headline-lg text-on-surface font-bold tracking-tight">
              Market Pulse
            </h1>
          </div>
          <button
            onClick={onOpenNotifications}
            type="button"
            aria-label="Notifications"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-container border border-outline text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-title-md">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container" />
          </button>
        </header>

        {/* Global Search Bar */}
        <div className="relative">
          <div className="w-full flex items-center gap-2 bg-surface-container border border-outline rounded-md px-3.5 py-2.5 focus-within:border-primary transition-colors shadow-inner">
            <span className="material-symbols-outlined text-on-surface-variant text-title-md">search</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 500+ PSX symbols e.g., SYS, LUCK, MEBL..."
              className="w-full bg-transparent border-0 p-0 text-body-sm text-on-surface placeholder:text-slate-muted focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Search Autocomplete Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high border border-outline rounded-md shadow-2xl z-30 max-h-60 overflow-y-auto">
              {filteredQuickStocks.length > 0 ? (
                filteredQuickStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => {
                      onSelectStock(stock);
                      setSearchQuery('');
                      onNavigate('prediction');
                    }}
                    className="px-3.5 py-2.5 hover:bg-surface-container flex items-center justify-between cursor-pointer border-b border-outline/50 last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{stock.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container font-mono">
                          {stock.sector}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{stock.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold text-on-surface block">
                        PKR {stock.price.toFixed(2)}
                      </span>
                      <span
                        className={`font-mono text-xs font-medium ${
                          stock.change >= 0 ? 'text-primary' : 'text-error'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-on-surface-variant">
                  No PSX tickers match "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* KSE-100 & Macro Ticker Strip */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-title text-title-sm text-on-surface font-semibold">
              KSE-100 &amp; Macro Pulse
            </h2>
            <span className="font-mono text-mono-sm text-on-surface-variant text-[11px]">
              SBP / PSX FEED
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            {/* Card 1: KSE-100 Index */}
            <article className="min-w-[172px] shrink-0 bg-surface-container border border-outline rounded-lg p-3.5 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-on-surface-variant font-medium">
                  KSE-100 Index
                </span>
                <span className="material-symbols-outlined text-body-md text-primary">trending_up</span>
              </div>
              <span className="font-mono text-mono-lg text-on-surface tabular-nums font-bold">
                118,450.20
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-mono-sm text-primary tabular-nums font-semibold">
                  +1.12% (+1,310 pts)
                </span>
              </div>
              <svg viewBox="0 0 140 28" className="w-full h-7" fill="none">
                <defs>
                  <linearGradient id="kseSpark" x1="0" y1="0" x2="0" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 22 L24 19 L48 21 L72 13 L96 15 L118 7 L140 3 L140 28 L0 28 Z"
                  fill="url(#kseSpark)"
                />
                <path
                  d="M0 22 L24 19 L48 21 L72 13 L96 15 L118 7 L140 3"
                  stroke="#10B981"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </article>

            {/* Card 2: USD / PKR */}
            <article className="min-w-[152px] shrink-0 bg-surface-container border border-outline rounded-lg p-3.5 flex flex-col justify-between gap-1.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-on-surface-variant font-medium">
                  USD / PKR
                </span>
                <span className="material-symbols-outlined text-body-md text-secondary">
                  currency_exchange
                </span>
              </div>
              <span className="font-mono text-mono-lg text-on-surface tabular-nums font-bold">
                278.50
              </span>
              <span className="font-mono text-mono-sm text-primary tabular-nums font-semibold">
                -0.15% (Stable)
              </span>
              <span className="font-label text-[10px] text-on-surface-variant">
                Interbank Weighted
              </span>
            </article>

            {/* Card 3: SBP Policy Rate */}
            <article className="min-w-[152px] shrink-0 bg-surface-container border border-outline rounded-lg p-3.5 flex flex-col justify-between gap-1.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-on-surface-variant font-medium">
                  SBP Policy Rate
                </span>
                <span className="material-symbols-outlined text-body-md text-secondary">
                  account_balance
                </span>
              </div>
              <span className="font-mono text-mono-lg text-on-surface tabular-nums font-bold">
                12.00%
              </span>
              <span className="font-mono text-mono-sm text-secondary tabular-nums font-semibold">
                -200 bps Cycle
              </span>
              <span className="font-label text-[10px] text-on-surface-variant">
                MPC Easing
              </span>
            </article>

            {/* Card 4: KMI-30 Index */}
            <article className="min-w-[162px] shrink-0 bg-surface-container border border-outline rounded-lg p-3.5 flex flex-col justify-between gap-1.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-on-surface-variant font-medium">
                  KMI-30 Index
                </span>
                <span className="material-symbols-outlined text-body-md text-primary">nights_stay</span>
              </div>
              <span className="font-mono text-mono-lg text-on-surface tabular-nums font-bold">
                182,310.00
              </span>
              <span className="font-mono text-mono-sm text-primary tabular-nums font-semibold">
                +1.45%
              </span>
              <span className="font-label text-[10px] text-on-surface-variant">
                Shariah Benchmark
              </span>
            </article>
          </div>
        </section>

        {/* Top AI Profit Opportunities Carousel */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-title-md text-on-surface font-semibold">
              Top AI Profit Opportunities (7-Day Horizon)
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            {/* Opportunity 1: SYS */}
            {stocks.slice(0, 4).map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => {
                  onSelectStock(stock);
                  onNavigate('prediction');
                }}
                className="min-w-[240px] shrink-0 bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-3 hover:bg-surface-container-high transition-all cursor-pointer shadow-md group active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline text-title-md text-on-surface font-bold group-hover:text-primary transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container font-label text-[10px] font-semibold">
                        KMI-30
                      </span>
                    </div>
                    <span className="font-body text-xs text-on-surface-variant truncate block max-w-[130px]">
                      {stock.name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                    {stock.aiScore}% Conviction
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <span className="font-mono text-mono-lg text-primary tabular-nums font-bold">
                      +{stock.projectedReturn.toFixed(1)}%
                    </span>
                    <p className="font-label text-[10px] text-on-surface-variant">
                      Est. Profit Target PKR {stock.targetPrice.toFixed(0)}
                    </p>
                  </div>
                  {/* Mini Forecast Cone Graphic */}
                  <svg viewBox="0 0 84 36" className="w-20 h-9 shrink-0" fill="none">
                    <path d="M4 26 L36 22" stroke="#64748B" strokeWidth="1.5" />
                    <line x1="36" y1="4" x2="36" y2="32" stroke="#262F3F" strokeDasharray="2 2" />
                    <path d="M36 22 L80 6 L80 28 Z" fill="#10B981" fillOpacity="0.22" />
                    <path d="M36 22 L80 12" stroke="#10B981" strokeWidth="2" strokeDasharray="3 2" />
                    <circle cx="36" cy="22" r="2.5" fill="#10B981" />
                    <circle cx="80" cy="12" r="2.5" fill="#38BDF8" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Smart Watchlist Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-title-md text-on-surface font-semibold">
              Smart Watchlist
            </h2>
            <button
              onClick={() => onNavigate('screener')}
              className="font-label text-label-md text-primary hover:underline font-semibold"
            >
              Explore All (500+)
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {stocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => {
                  onSelectStock(stock);
                  onNavigate('prediction');
                }}
                className="bg-surface-container border border-outline rounded-lg p-3.5 grid grid-cols-12 items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer group"
              >
                <div className="col-span-4 flex flex-col">
                  <span className="font-headline text-title-sm text-on-surface font-bold group-hover:text-primary transition-colors">
                    {stock.symbol}
                  </span>
                  <span className="font-body text-xs text-on-surface-variant truncate">
                    {stock.name}
                  </span>
                </div>
                <div className="col-span-3 flex justify-center">
                  <svg viewBox="0 0 56 20" className="w-14 h-5" fill="none">
                    <path
                      d={
                        stock.change >= 0
                          ? 'M2 16 L14 14 L26 15 L38 8 L54 4'
                          : 'M2 4 L14 8 L26 7 L38 15 L54 18'
                      }
                      stroke={stock.change >= 0 ? '#10B981' : '#EF4444'}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="col-span-5 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-on-surface tabular-nums">
                      PKR {stock.price.toFixed(2)}
                    </span>
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        stock.change >= 0 ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label text-[10px] font-bold ${
                      stock.aiSignal === 'STRONG BUY'
                        ? 'bg-primary-container text-on-primary-container border border-primary/30'
                        : stock.aiSignal === 'BUY'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {stock.aiSignal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
