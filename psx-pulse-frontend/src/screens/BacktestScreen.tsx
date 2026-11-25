import React, { useState } from 'react';
import { NavScreen } from '../types';

interface BacktestScreenProps {
  onNavigate: (screen: NavScreen) => void;
}

export const BacktestScreen: React.FC<BacktestScreenProps> = ({ onNavigate }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'30D' | '90D' | 'ALL'>('90D');

  const logs = [
    {
      ticker: 'SYS 7D Forecast',
      symbol: 'SYS',
      predicted: '+6.8%',
      actual: '+7.4%',
      status: 'HIT ✓',
      isHit: true,
      time: '2 days ago',
    },
    {
      ticker: 'MEBL 7D Forecast',
      symbol: 'MEBL',
      predicted: '+5.2%',
      actual: '+6.1%',
      status: 'HIT ✓',
      isHit: true,
      time: '4 days ago',
    },
    {
      ticker: 'LUCK 7D Forecast',
      symbol: 'LUCK',
      predicted: '+4.0%',
      actual: '+3.8%',
      status: 'HIT ✓',
      isHit: true,
      time: '6 days ago',
    },
    {
      ticker: 'PSO 7D Forecast',
      symbol: 'PSO',
      predicted: '+3.5%',
      actual: '-1.2%',
      status: 'MISS ✕',
      isHit: false,
      time: '8 days ago',
    },
    {
      ticker: 'PPL 7D Forecast',
      symbol: 'PPL',
      predicted: '+5.8%',
      actual: '+6.5%',
      status: 'HIT ✓',
      isHit: true,
      time: '11 days ago',
    },
    {
      ticker: 'FFC 7D Forecast',
      symbol: 'FFC',
      predicted: '+3.1%',
      actual: '+3.4%',
      status: 'HIT ✓',
      isHit: true,
      time: '14 days ago',
    },
  ];

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
        <header className="flex items-center justify-between">
          <div>
            <span className="font-label text-label-sm text-secondary uppercase tracking-wider font-semibold">
              Walk-Forward Calibration
            </span>
            <h1 className="font-headline text-headline-lg text-on-surface font-bold tracking-tight">
              AI Model Transparency &amp; Audit
            </h1>
          </div>
          <div className="inline-flex rounded-lg border border-outline bg-surface-container p-0.5">
            {(['30D', '90D', 'ALL'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  selectedHorizon === h
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </header>

        {/* Hero Accuracy Card */}
        <section className="bg-surface-container border border-outline rounded-lg p-4 flex items-center gap-4 shadow-sm">
          {/* Circular Progress Ring */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 96 96" className="w-24 h-24 -rotate-90" role="img" aria-label="76.4% Hit Rate">
              <circle cx="48" cy="48" r="40" stroke="#1B222E" strokeWidth="8" fill="none" />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#10B981"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset="59.3"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-base font-bold text-on-surface tabular-nums">
                76.4%
              </span>
              <span className="font-label text-[10px] font-semibold text-primary">
                Hit Rate
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="font-body text-xs text-on-surface leading-relaxed">
              Across <span className="font-mono text-xs font-bold text-on-surface tabular-nums">1,420</span> historical PSX predictions over the last 90 days.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-container border border-primary/30 self-start shadow-sm">
              <span className="font-label text-[10px] text-on-primary-container font-medium">
                Avg. Return per Win:
              </span>
              <span className="font-mono text-[11px] font-bold text-primary tabular-nums">
                +6.2%
              </span>
            </div>
          </div>
        </section>

        {/* Historical Forecast vs. Actual Price Chart */}
        <section className="bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-headline text-title-md text-on-surface font-semibold">
              Forecast vs. Actual Price (KSE-100)
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-secondary inline-block rounded" />
              <span className="font-label text-on-surface-variant font-medium">AI Predicted Median</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-primary inline-block rounded" />
              <span className="font-label text-on-surface-variant font-medium">Actual PSX Close</span>
            </div>
          </div>
          <svg
            viewBox="0 0 326 120"
            className="w-full h-32 bg-surface-container-low border border-outline rounded-md p-2"
            fill="none"
          >
            <line x1="8" y1="24" x2="318" y2="24" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="8" y1="60" x2="318" y2="60" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="8" y1="96" x2="318" y2="96" stroke="#262F3F" strokeWidth="1" strokeDasharray="3 3" />
            {/* AI Predicted Median */}
            <path
              d="M12 94 L56 84 L100 78 L144 64 L188 58 L232 42 L276 34 L314 22"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            {/* Actual PSX Closing Price */}
            <path
              d="M12 96 L56 88 L100 74 L144 68 L188 52 L232 45 L276 30 L314 18"
              stroke="#10B981"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="314" cy="18" r="3.5" fill="#10B981" />
            <circle cx="314" cy="22" r="3" fill="#38BDF8" />
          </svg>
        </section>

        {/* Win-Rate By Sector Breakdown */}
        <section className="bg-surface-container border border-outline rounded-lg p-4 flex flex-col gap-2.5 shadow-sm">
          <span className="font-title text-title-sm text-on-surface font-semibold">
            Sector Accuracy Breakdown
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-container-low p-2 rounded border border-outline/70 flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Technology</span>
              <span className="font-mono font-bold text-primary">88.2%</span>
            </div>
            <div className="bg-surface-container-low p-2 rounded border border-outline/70 flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Commercial Banks</span>
              <span className="font-mono font-bold text-primary">82.4%</span>
            </div>
            <div className="bg-surface-container-low p-2 rounded border border-outline/70 flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Fertilizer</span>
              <span className="font-mono font-bold text-primary">79.1%</span>
            </div>
            <div className="bg-surface-container-low p-2 rounded border border-outline/70 flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Oil &amp; Gas</span>
              <span className="font-mono font-bold text-primary">74.5%</span>
            </div>
          </div>
        </section>

        {/* Recent Closed Predictions Log */}
        <section className="flex flex-col gap-2.5">
          <h2 className="font-headline text-title-md text-on-surface font-semibold">
            Recent Closed Predictions Log
          </h2>
          <div className="bg-surface-container border border-outline rounded-lg divide-y divide-outline shadow-sm overflow-hidden">
            {logs.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-2 hover:bg-surface-container-high transition-colors">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-xs font-bold text-on-surface">
                      {item.ticker}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">{item.time}</span>
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant tabular-nums">
                    Predicted <strong className="text-on-surface">{item.predicted}</strong> → Actual{' '}
                    <strong className={item.isHit ? 'text-primary' : 'text-error'}>{item.actual}</strong>
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                    item.isHit
                      ? 'bg-primary-container text-on-primary-container border border-primary/30'
                      : 'bg-error-container text-on-error-container border border-error/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <p className="font-label text-[11px] text-on-surface-variant text-center pb-2">
          Probabilistic AI analytics for educational purposes only. Not SECP-registered investment advice.
        </p>
      </div>
    </div>
  );
};
