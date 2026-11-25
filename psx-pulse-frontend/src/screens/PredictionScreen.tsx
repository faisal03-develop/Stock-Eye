import React, { useState } from 'react';
import { Stock, NavScreen } from '../types';

interface PredictionScreenProps {
  stock: Stock;
  isWatchlist: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onNavigate: (screen: NavScreen) => void;
  onOpenTradeModal: (stock: Stock) => void;
}

export const PredictionScreen: React.FC<PredictionScreenProps> = ({
  stock,
  isWatchlist,
  onToggleWatchlist,
  onNavigate,
  onOpenTradeModal,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [horizon, setHorizon] = useState<'5D' | '15D' | '30D'>('15D');

  const horizonData = {
    '5D': { ret: '+4.1%', conf: '81%', target: (stock.price * 1.041).toFixed(2), gain: (stock.price * 0.041).toFixed(2) },
    '15D': { ret: `+${stock.projectedReturn.toFixed(1)}%`, conf: `${stock.aiScore}%`, target: stock.targetPrice.toFixed(2), gain: (stock.targetPrice - stock.price).toFixed(2) },
    '30D': { ret: '+14.2%', conf: '68%', target: (stock.price * 1.142).toFixed(2), gain: (stock.price * 0.142).toFixed(2) },
  };

  const currentHorizon = horizonData[horizon];
  const upperLock = (stock.price * 1.075).toFixed(2);
  const lowerLock = (stock.price * 0.925).toFixed(2);

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

      <div className="px-4 pt-3 flex flex-col gap-4">
        {/* Stock Header Card */}
        <section className="bg-surface-container border border-outline rounded-lg p-4 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-display-lg-mobile text-on-surface leading-none font-bold">
                {stock.symbol}
              </h1>
              <button
                type="button"
                onClick={() => onToggleWatchlist(stock.symbol)}
                aria-label="Bookmark to watchlist"
                className={`transition-transform hover:scale-110 ${
                  isWatchlist ? 'text-tertiary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[26px]"
                  style={isWatchlist ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  star
                </span>
              </button>
            </div>
            <p className="font-body text-xs text-on-surface-variant font-medium">
              {stock.name}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label text-[10px] font-bold">
                KMI-30 Shariah
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label text-[10px] font-semibold">
                {stock.sector}
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <span className="font-mono text-lg text-on-surface tabular-nums font-bold">
              PKR {stock.price.toFixed(2)}
            </span>
            <span
              className={`font-mono text-xs tabular-nums font-semibold ${
                stock.change >= 0 ? 'text-primary' : 'text-error'
              }`}
            >
              {stock.change >= 0 ? '+' : ''}
              {stock.changePercent.toFixed(2)}% (+PKR {Math.abs(stock.change).toFixed(2)})
            </span>
          </div>
        </section>

        {/* Interactive AI Prediction Graph Card */}
        <section className="bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-3 shadow-md">
          {/* Floating Chart Overlay Badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container border border-primary/40 shadow-sm">
              <span className="material-symbols-outlined text-xs text-primary">auto_awesome</span>
              <span className="font-mono text-[11px] text-on-primary-container tabular-nums font-bold">
                AI FORECAST • {currentHorizon.ret} EXPECTED • {currentHorizon.conf} CONFIDENCE
              </span>
            </span>
          </div>

          {/* Candlestick + Volume + Probability Cone SVG */}
          <div className="relative w-full bg-surface-container-low border border-outline rounded-md p-2">
            <svg
              viewBox="0 0 340 205"
              className="w-full h-52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={`30-day candlestick chart and AI probability confidence cone for ${stock.name}`}
            >
              <defs>
                <linearGradient id="sysCone" x1="170" y1="95" x2="322" y2="55" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              {/* Horizontal Price Grid */}
              <line x1="8" y1="28" x2="328" y2="28" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="8" y1="68" x2="328" y2="68" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="8" y1="108" x2="328" y2="108" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="8" y1="148" x2="328" y2="148" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />

              {/* Left Half: Past 30D Candlesticks */}
              <line x1="20" y1="115" x2="20" y2="142" stroke="#64748B" strokeWidth="1.2" />
              <rect x="16" y="122" width="8" height="14" rx="1.5" fill="#EF4444" />
              <line x1="36" y1="110" x2="36" y2="138" stroke="#64748B" strokeWidth="1.2" />
              <rect x="32" y="116" width="8" height="15" rx="1.5" fill="#10B981" />
              <line x1="52" y1="104" x2="52" y2="132" stroke="#64748B" strokeWidth="1.2" />
              <rect x="48" y="110" width="8" height="14" rx="1.5" fill="#10B981" />
              <line x1="68" y1="108" x2="68" y2="136" stroke="#64748B" strokeWidth="1.2" />
              <rect x="64" y="114" width="8" height="12" rx="1.5" fill="#EF4444" />
              <line x1="84" y1="98" x2="84" y2="128" stroke="#64748B" strokeWidth="1.2" />
              <rect x="80" y="104" width="8" height="16" rx="1.5" fill="#10B981" />
              <line x1="100" y1="92" x2="100" y2="120" stroke="#64748B" strokeWidth="1.2" />
              <rect x="96" y="96" width="8" height="16" rx="1.5" fill="#10B981" />
              <line x1="116" y1="95" x2="116" y2="124" stroke="#64748B" strokeWidth="1.2" />
              <rect x="112" y="102" width="8" height="13" rx="1.5" fill="#EF4444" />
              <line x1="132" y1="86" x2="132" y2="116" stroke="#64748B" strokeWidth="1.2" />
              <rect x="128" y="92" width="8" height="16" rx="1.5" fill="#10B981" />
              <line x1="148" y1="82" x2="148" y2="110" stroke="#64748B" strokeWidth="1.2" />
              <rect x="144" y="88" width="8" height="14" rx="1.5" fill="#10B981" />
              <line x1="164" y1="78" x2="164" y2="104" stroke="#64748B" strokeWidth="1.2" />
              <rect x="160" y="84" width="8" height="14" rx="1.5" fill="#10B981" />

              {/* Volume Bars Underneath (Left Half) */}
              <rect x="16" y="182" width="8" height="14" rx="1" fill="#EF4444" fillOpacity="0.45" />
              <rect x="32" y="178" width="8" height="18" rx="1" fill="#10B981" fillOpacity="0.45" />
              <rect x="48" y="174" width="8" height="22" rx="1" fill="#10B981" fillOpacity="0.45" />
              <rect x="64" y="184" width="8" height="12" rx="1" fill="#EF4444" fillOpacity="0.45" />
              <rect x="80" y="176" width="8" height="20" rx="1" fill="#10B981" fillOpacity="0.45" />
              <rect x="96" y="170" width="8" height="26" rx="1" fill="#10B981" fillOpacity="0.55" />
              <rect x="112" y="182" width="8" height="14" rx="1" fill="#EF4444" fillOpacity="0.45" />
              <rect x="128" y="172" width="8" height="24" rx="1" fill="#10B981" fillOpacity="0.55" />
              <rect x="144" y="168" width="8" height="28" rx="1" fill="#10B981" fillOpacity="0.65" />
              <rect x="160" y="162" width="8" height="34" rx="1" fill="#10B981" fillOpacity="0.75" />

              {/* Center Vertical Dashed Divider: NOW */}
              <line x1="174" y1="16" x2="174" y2="196" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="4 4" />
              <rect x="158" y="2" width="32" height="14" rx="4" fill="#00354A" />
              <text x="174" y="12" textAnchor="middle" fill="#C4E7FF" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
                NOW
              </text>

              {/* Right Half: Shaded Emerald AI Probability Confidence Cone */}
              <path d="M174 88 L322 24 L322 114 Z" fill="url(#sysCone)" />
              {/* Upper Bound (90th Percentile) */}
              <path d="M174 88 L322 24" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.85" />
              {/* Lower Bound (10th Percentile) */}
              <path d="M174 88 L322 114" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.5" />
              {/* Bold Dotted Median Target Line */}
              <path d="M174 88 Q248 64 322 50" stroke="#10B981" strokeWidth="2.5" strokeDasharray="5 3" />

              <circle cx="174" cy="88" r="4" fill="#10B981" stroke="#0B0F14" strokeWidth="2" />
              <circle cx="322" cy="50" r="4" fill="#10B981" />

              {/* Target Callouts */}
              <text x="210" y="22" fill="#6FFBBE" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fontWeight="600">
                90th: PKR {(stock.price * 1.15).toFixed(1)}
              </text>
              <text x="210" y="53" fill="#EEF1F8" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700">
                Target: {currentHorizon.target}
              </text>
              <text x="210" y="125" fill="#94A3B8" fontFamily="JetBrains Mono, monospace" fontSize="8.5">
                10th: PKR {(stock.price * 0.95).toFixed(1)}
              </text>
            </svg>
          </div>

          {/* Timeframe Selector Pills & Forecast Horizon Toggle */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1 bg-surface-container-low border border-outline rounded-md p-1">
              {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`flex-1 py-1 rounded font-mono text-[11px] font-semibold transition-colors ${
                    timeframe === tf
                      ? 'bg-surface-container-high text-on-surface border border-outline shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setHorizon('5D')}
                className={`py-1.5 rounded-full font-label text-xs font-semibold transition-all ${
                  horizon === '5D'
                    ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm'
                    : 'bg-surface-container-high border border-outline text-on-surface-variant'
                }`}
              >
                Predict 5D
              </button>
              <button
                type="button"
                onClick={() => setHorizon('15D')}
                className={`py-1.5 rounded-full font-label text-xs font-semibold transition-all ${
                  horizon === '15D'
                    ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm'
                    : 'bg-surface-container-high border border-outline text-on-surface-variant'
                }`}
              >
                Predict 15D
              </button>
              <button
                type="button"
                onClick={() => setHorizon('30D')}
                className={`py-1.5 rounded-full font-label text-xs font-semibold transition-all ${
                  horizon === '30D'
                    ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm'
                    : 'bg-surface-container-high border border-outline text-on-surface-variant'
                }`}
              >
                Predict 30D
              </button>
            </div>
          </div>
        </section>

        {/* AI Verdict & Explainability ("Why This Prediction?") */}
        <section className="bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-headline text-title-md text-on-surface font-bold">
              Why This Prediction?
            </h2>
            <span className="font-label text-[11px] text-secondary font-semibold">
              SHAP EXPLAINABILITY
            </span>
          </div>

          {/* Verdict Banner */}
          <div className="bg-primary-container border border-primary/40 rounded-md p-3 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex flex-col gap-0.5">
              <span className="font-label text-xs text-on-primary-container font-bold">
                PROFIT PROBABILITY: {currentHorizon.conf} BULLISH
              </span>
              <span className="font-mono text-xs text-primary tabular-nums font-semibold">
                Expected Gain: +PKR {currentHorizon.gain} / share ({currentHorizon.ret})
              </span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-primary">verified</span>
          </div>

          {/* Segmented Sentiment Breakdown Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-2.5 rounded-full overflow-hidden flex gap-0.5 bg-surface-container-low">
              <div className="bg-primary h-full" style={{ width: `${stock.aiScore}%` }} />
              <div className="bg-slate-muted h-full" style={{ width: '15%' }} />
              <div className="bg-error h-full" style={{ width: `${Math.max(5, 85 - stock.aiScore)}%` }} />
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] tabular-nums font-semibold">
              <span className="text-primary">{stock.aiScore}% Bullish</span>
              <span className="text-on-surface-variant">15% Neutral</span>
              <span className="text-error">{Math.max(5, 85 - stock.aiScore)}% Bearish</span>
            </div>
          </div>

          {/* Top 3 AI Feature Drivers */}
          <div className="flex flex-col gap-2 pt-2 border-t border-outline">
            <div className="flex items-start gap-2.5">
              <span className="font-mono text-[11px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded shrink-0 tabular-nums">
                +38%
              </span>
              <p className="font-body text-xs text-on-surface leading-snug">
                Official PSX PUCARS Q3 earnings beat &amp; dividend announcement.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-mono text-[11px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded shrink-0 tabular-nums">
                +24%
              </span>
              <p className="font-body text-xs text-on-surface leading-snug">
                Institutional volume Z-score +2.4σ above 20-day average.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-mono text-[11px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded shrink-0 tabular-nums">
                +16%
              </span>
              <p className="font-body text-xs text-on-surface leading-snug">
                Positive IT export remittance macro trend and Middle East expansion contracts.
              </p>
            </div>
          </div>
        </section>

        {/* PSX Risk & Circuit Breaker Strip */}
        <section className="bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-2.5 shadow-sm">
          <span className="font-title text-title-sm text-on-surface font-semibold">
            PSX Risk &amp; Circuit Breaker Strip
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-surface-container-low border border-outline rounded-md p-2.5 flex flex-col gap-0.5">
              <span className="font-label text-[11px] text-on-surface-variant">Daily Upper Lock</span>
              <span className="font-mono text-sm text-primary tabular-nums font-bold">
                PKR {upperLock}
              </span>
            </div>
            <div className="bg-surface-container-low border border-outline rounded-md p-2.5 flex flex-col gap-0.5">
              <span className="font-label text-[11px] text-on-surface-variant">Daily Lower Lock</span>
              <span className="font-mono text-sm text-error tabular-nums font-bold">
                PKR {lowerLock}
              </span>
            </div>
            <div className="bg-surface-container-low border border-outline rounded-md p-2.5 flex flex-col gap-0.5">
              <span className="font-label text-[11px] text-on-surface-variant">Next Ex-Dividend</span>
              <span className="font-mono text-sm text-on-surface tabular-nums font-bold">14 Dec</span>
            </div>
            <div className="bg-surface-container-low border border-outline rounded-md p-2.5 flex flex-col gap-0.5">
              <span className="font-label text-[11px] text-on-surface-variant">Volatility Risk</span>
              <span className="font-mono text-sm text-tertiary font-bold">Moderate</span>
            </div>
          </div>
        </section>

        {/* Action Button: Simulate Trade Position */}
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => onOpenTradeModal(stock)}
            className="flex-1 py-3 px-4 rounded-md bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">candlestick_chart</span>
            Simulate Position
          </button>
          <button
            onClick={() => onToggleWatchlist(stock.symbol)}
            className="px-4 py-3 rounded-md bg-surface-container border border-outline text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isWatchlist ? 'bookmark_added' : 'bookmark_add'}
            </span>
            {isWatchlist ? 'Saved' : 'Watch'}
          </button>
        </div>

        <p className="font-label text-[11px] text-on-surface-variant text-center pb-2">
          Probabilistic AI analytics for educational purposes only. Not SECP-registered investment advice.
        </p>
      </div>
    </div>
  );
};
