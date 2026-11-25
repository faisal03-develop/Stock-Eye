import React, { useState } from 'react';

interface OnboardingScreenProps {
  onComplete: (preferences: {
    horizon: string;
    isShariahOnly: boolean;
    riskAppetite: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  }) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [horizon, setHorizon] = useState<'intraday' | 'short' | 'long'>('intraday');
  const [isShariahOnly, setIsShariahOnly] = useState<boolean>(true);
  const [riskLevel, setRiskLevel] = useState<1 | 2 | 3>(2);

  const riskLabelMap: Record<number, 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'> = {
    1: 'CONSERVATIVE',
    2: 'BALANCED',
    3: 'AGGRESSIVE',
  };

  const handleLaunch = () => {
    onComplete({
      horizon:
        horizon === 'intraday'
          ? 'Intraday (1-5D)'
          : horizon === 'short'
          ? 'Short-Term (1W-1M)'
          : 'Long-Term (3M+)',
      isShariahOnly,
      riskAppetite: riskLabelMap[riskLevel],
    });
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between px-4 py-5 gap-6">
      {/* Top Brand & Market Pill */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-DEFAULT bg-primary-container border border-primary/40 flex items-center justify-center text-primary shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-title-md">query_stats</span>
          </div>
          <span className="font-headline text-title-md text-on-surface tracking-tight font-semibold">
            PSX Pulse AI
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-mono text-mono-sm text-primary font-semibold">KSE-100 LIVE</span>
        </span>
      </header>

      {/* Hero Graphic & Quantitative Forecast Engine */}
      <main className="flex flex-col gap-5 flex-1">
        <section className="relative bg-surface-container border border-outline rounded-lg p-4 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label text-label-sm text-secondary uppercase tracking-wider font-semibold">
              Quantitative Forecast Engine
            </span>
            <span className="font-mono text-mono-sm text-primary tabular-nums font-bold">
              90D HIT RATE 76.4%
            </span>
          </div>

          <svg
            viewBox="0 0 326 140"
            className="w-full h-36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Candlestick chart morphing into an upward emerald probability cone"
          >
            <defs>
              <linearGradient id="coneGrad" x1="165" y1="78" x2="318" y2="26" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.06" />
              </linearGradient>
              <linearGradient id="lineGlow" x1="165" y1="78" x2="318" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
            {/* Subtle grid lines */}
            <line x1="0" y1="32" x2="326" y2="32" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="72" x2="326" y2="72" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="112" x2="326" y2="112" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />

            {/* Historical Candlesticks (Left Half) */}
            <line x1="22" y1="88" x2="22" y2="118" stroke="#64748B" strokeWidth="1.5" />
            <rect x="17" y="96" width="10" height="14" rx="2" fill="#EF4444" />

            <line x1="46" y1="82" x2="46" y2="112" stroke="#64748B" strokeWidth="1.5" />
            <rect x="41" y="88" width="10" height="16" rx="2" fill="#10B981" />

            <line x1="70" y1="74" x2="70" y2="104" stroke="#64748B" strokeWidth="1.5" />
            <rect x="65" y="80" width="10" height="15" rx="2" fill="#10B981" />

            <line x1="94" y1="78" x2="94" y2="108" stroke="#64748B" strokeWidth="1.5" />
            <rect x="89" y="84" width="10" height="12" rx="2" fill="#EF4444" />

            <line x1="118" y1="68" x2="118" y2="98" stroke="#64748B" strokeWidth="1.5" />
            <rect x="113" y="74" width="10" height="16" rx="2" fill="#10B981" />

            <line x1="142" y1="60" x2="142" y2="92" stroke="#64748B" strokeWidth="1.5" />
            <rect x="137" y="66" width="10" height="18" rx="2" fill="#10B981" />

            {/* NOW Divider */}
            <line x1="165" y1="12" x2="165" y2="128" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="4 4" />
            <rect x="149" y="4" width="32" height="14" rx="4" fill="#00354A" />
            <text x="165" y="14" textAnchor="middle" fill="#C4E7FF" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700">
              NOW
            </text>

            {/* Upward Emerald Probability Cone (Right Half) */}
            <path d="M165 74 L314 18 L314 96 Z" fill="url(#coneGrad)" />
            <path d="M165 74 L314 18" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.7" />
            <path d="M165 74 L314 96" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.4" />
            {/* Median AI Target Line */}
            <path d="M165 74 Q238 56 314 42" stroke="url(#lineGlow)" strokeWidth="2.5" strokeDasharray="5 3" />
            <circle cx="165" cy="74" r="4" fill="#10B981" stroke="#0B0F14" strokeWidth="2" />
            <circle cx="314" cy="42" r="4" fill="#38BDF8" />
          </svg>

          <h1 className="font-headline text-headline-lg text-on-surface text-balance mt-3 font-bold leading-tight">
            Institutional AI &amp; Sentiment Intelligence for the Pakistan Stock Exchange.
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-2 leading-relaxed">
            Calibrate your 500+ PSX ticker workspace with Shariah filters, horizon models, and PUCARS-weighted NLP signals.
          </p>
        </section>

        {/* Interactive Preference Setup */}
        <section className="flex flex-col gap-3.5">
          {/* Trading Horizon */}
          <div className="bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-title text-title-sm text-on-surface font-semibold">Trading Horizon</span>
              <span className="font-label text-label-sm text-on-surface-variant">Select 1</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setHorizon('intraday')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors text-xs font-semibold ${
                  horizon === 'intraday'
                    ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm shadow-primary/20'
                    : 'bg-surface-container-high border border-outline text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Intraday / Swing (1–5D)
              </button>
              <button
                type="button"
                onClick={() => setHorizon('short')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors text-xs font-semibold ${
                  horizon === 'short'
                    ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm shadow-primary/20'
                    : 'bg-surface-container-high border border-outline text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Short-Term (1W–1M)
              </button>
              <button
                type="button"
                onClick={() => setHorizon('long')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors text-xs font-semibold ${
                  horizon === 'long'
                    ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm shadow-primary/20'
                    : 'bg-surface-container-high border border-outline text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Long-Term Value (3M+)
              </button>
            </div>
          </div>

          {/* Shariah Compliance Filter Toggle */}
          <div className="bg-surface-container border border-outline rounded-lg p-4 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-primary-container border border-primary/40 flex items-center justify-center text-on-primary-container shrink-0">
                <span className="material-symbols-outlined text-title-md">nights_stay</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-title text-title-sm text-on-surface font-semibold">
                    Show KMI-30 Islamic Compliant Stocks Only
                  </span>
                </div>
                <span className="font-body text-body-sm text-on-surface-variant text-[11px] leading-tight">
                  Filter out conventional banks &amp; non-Shariah debt ratios
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isShariahOnly}
              onClick={() => setIsShariahOnly(!isShariahOnly)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isShariahOnly ? 'bg-primary border-primary/50' : 'bg-surface-container-high border-outline'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full transition-transform mt-0.5 ml-0.5 ${
                  isShariahOnly ? 'translate-x-5 bg-on-primary' : 'translate-x-0 bg-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {/* Risk Appetite Slider */}
          <div className="bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-title text-title-sm text-on-surface font-semibold">Risk Appetite</span>
              <span className="font-mono text-mono-sm text-secondary font-bold">
                {riskLabelMap[riskLevel]}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={riskLevel}
              onChange={(e) => setRiskLevel(Number(e.target.value) as 1 | 2 | 3)}
              className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium">
              <span className={riskLevel === 1 ? 'text-primary font-bold' : ''}>Conservative</span>
              <span className={riskLevel === 2 ? 'text-primary font-bold' : ''}>Balanced</span>
              <span className={riskLevel === 3 ? 'text-primary font-bold' : ''}>Aggressive</span>
            </div>
          </div>
        </section>
      </main>

      {/* Primary CTA & Compliance Note */}
      <footer className="flex flex-col gap-3 pt-2">
        <button
          onClick={handleLaunch}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md bg-gradient-to-r from-primary to-secondary text-on-primary font-label font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
        >
          <span>Launch PSX AI Dashboard</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
        <p className="font-label text-[11px] text-on-surface-variant text-center leading-relaxed">
          Probabilistic AI analytics for educational purposes only. Not SECP-registered investment advice.
        </p>
      </footer>
    </div>
  );
};
