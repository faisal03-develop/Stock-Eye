import React, { useState, useMemo } from 'react';
import { Stock, NavScreen } from '../types';

interface ScreenerScreenProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onNavigate: (screen: NavScreen) => void;
}

export const ScreenerScreen: React.FC<ScreenerScreenProps> = ({
  stocks,
  onSelectStock,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'prob' | 'sentiment' | 'return' | 'price'>('prob');

  const sectors = [
    'ALL',
    'Commercial Banks',
    'Oil & Gas',
    'Cement',
    'Technology',
    'Fertilizer',
    'KMI-30',
  ];

  const handleQuickSearch = (symbol: string) => {
    setSearchTerm(symbol);
  };

  const filteredAndSortedStocks = useMemo(() => {
    return stocks
      .filter((stock) => {
        const matchesSearch =
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (selectedSector === 'ALL') return true;
        if (selectedSector === 'KMI-30') return true; // All our top picks are KMI compliant
        return stock.sector.toLowerCase() === selectedSector.toLowerCase();
      })
      .sort((a, b) => {
        if (sortBy === 'prob') return b.aiScore - a.aiScore;
        if (sortBy === 'return') return b.projectedReturn - a.projectedReturn;
        if (sortBy === 'price') return b.price - a.price;
        return b.rsi - a.rsi;
      });
  }, [stocks, searchTerm, selectedSector, sortBy]);

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
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[18px]">search</span>
        </div>
      </div>

      <div className="px-4 pt-3 flex flex-col gap-3.5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-headline-lg text-on-surface font-bold tracking-tight">
              PSX Screener
            </h1>
            <p className="font-body text-xs text-on-surface-variant">
              500+ listed equities ranked by AI profit probability
            </p>
          </div>
        </header>

        {/* Instant Search Bar */}
        <div className="w-full flex items-center gap-2 bg-surface-container border border-outline rounded-md px-3.5 py-2.5 focus-within:border-primary transition-colors shadow-inner">
          <span className="material-symbols-outlined text-on-surface-variant text-title-md">search</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Filter PSX symbols"
            placeholder="Search symbol or company (e.g., SYS, PPL, HUBC)..."
            className="w-full bg-transparent border-0 p-0 text-sm text-on-surface placeholder:text-slate-muted focus:ring-0 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Recent Searches */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="font-label text-[11px] text-on-surface-variant shrink-0 font-medium">Recent:</span>
          {['SYS', 'PPL', 'HUBC', 'FFC'].map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => handleQuickSearch(sym)}
              className={`px-2.5 py-1 rounded-full border font-mono text-[11px] font-semibold transition-colors ${
                searchTerm.toUpperCase() === sym
                  ? 'bg-primary-container border-primary/50 text-on-primary-container'
                  : 'bg-surface-container-high border-outline text-on-surface hover:border-primary'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Sector Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {sectors.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSector(sec)}
              className={`shrink-0 px-3 py-1.5 rounded-full font-label text-xs font-semibold transition-all ${
                selectedSector === sec
                  ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm shadow-primary/20'
                  : 'bg-surface-container border border-outline text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {sec === 'KMI-30' ? (
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">nights_stay</span>
                  KMI-30 Only
                </span>
              ) : (
                sec === 'ALL' ? 'All Sectors' : sec
              )}
            </button>
          ))}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center justify-between gap-2 bg-surface-container border border-outline rounded-md px-3 py-2 shadow-sm">
          <span className="font-label text-xs text-on-surface-variant font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort screener results"
            className="bg-transparent border-0 p-0 text-xs font-semibold text-primary focus:ring-0 cursor-pointer outline-none"
          >
            <option value="prob" className="bg-surface-container-high text-on-surface">
              Highest AI Profit Probability
            </option>
            <option value="return" className="bg-surface-container-high text-on-surface">
              Highest Projected Return
            </option>
            <option value="price" className="bg-surface-container-high text-on-surface">
              Highest Price
            </option>
            <option value="sentiment" className="bg-surface-container-high text-on-surface">
              Technical Momentum (RSI)
            </option>
          </select>
        </div>

        {/* Screener Result Cards */}
        <section className="flex flex-col gap-3 pt-1">
          {filteredAndSortedStocks.map((stock) => {
            const upperLock = (stock.price * 1.075).toFixed(2);
            const lowerLock = (stock.price * 0.925).toFixed(2);

            return (
              <div
                key={stock.symbol}
                onClick={() => {
                  onSelectStock(stock);
                  onNavigate('prediction');
                }}
                className="bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-3 hover:bg-surface-container-high transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-title-md text-on-surface font-bold group-hover:text-primary transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label text-[10px] font-semibold">
                        {stock.sector}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container font-label text-[10px] font-bold">
                        KMI-30
                      </span>
                    </div>
                    <span className="font-body text-xs text-on-surface-variant mt-0.5 block">
                      {stock.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-mono-md text-on-surface tabular-nums font-bold">
                      PKR {stock.price.toFixed(2)}
                    </div>
                    <div
                      className={`font-mono text-mono-sm tabular-nums font-semibold ${
                        stock.change >= 0 ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* PSX Upper & Lower Lock Band */}
                <div className="bg-surface-container-low border border-outline/70 rounded px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-on-surface-variant tabular-nums">
                    Upper Lock: <strong className="text-primary font-semibold">PKR {upperLock}</strong>
                  </span>
                  <span className="w-px h-3.5 bg-outline" />
                  <span className="font-mono text-on-surface-variant tabular-nums">
                    Lower Lock: <strong className="text-error font-semibold">PKR {lowerLock}</strong>
                  </span>
                </div>

                {/* AI Probability Progress Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-label text-on-surface-variant font-medium">
                      AI Profit Probability (Est. +{stock.projectedReturn.toFixed(1)}%)
                    </span>
                    <span className="font-mono text-primary tabular-nums font-bold">
                      {stock.aiScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${stock.aiScore}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAndSortedStocks.length === 0 && (
            <div className="bg-surface-container border border-outline rounded-lg p-6 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl mb-2 text-on-surface-variant block">search_off</span>
              <p className="font-semibold text-sm">No PSX stocks matched your filter</p>
              <p className="text-xs mt-1">Try selecting "All Sectors" or clearing search terms.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
