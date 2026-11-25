import React, { useState } from 'react';
import { NewsRumorItem, NavScreen } from '../types';

interface NewsRumorScreenProps {
  items: NewsRumorItem[];
  onNavigate: (screen: NavScreen) => void;
  onSelectTicker?: (symbol: string) => void;
}

export const NewsRumorScreen: React.FC<NewsRumorScreenProps> = ({
  items,
  onNavigate,
  onSelectTicker,
}) => {
  const [filter, setFilter] = useState<'all' | 'verified' | 'rumor'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsRumorItem | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'verified') return item.type === 'OFFICIAL';
    if (filter === 'rumor') return item.type === 'RUMOR';
    return true;
  });

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

      <div className="px-4 pt-3 flex flex-col gap-3.5">
        <header className="flex flex-col gap-3">
          <div>
            <span className="font-label text-label-sm text-secondary uppercase tracking-wider font-semibold">
              NLP Authenticity Analyzer
            </span>
            <h1 className="font-headline text-headline-lg text-on-surface font-bold tracking-tight">
              Catalyst &amp; Rumor Engine
            </h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full font-label text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm'
                  : 'bg-surface-container border border-outline text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Signals
            </button>
            <button
              type="button"
              onClick={() => setFilter('verified')}
              className={`shrink-0 px-3 py-1.5 rounded-full font-label text-xs font-semibold transition-all ${
                filter === 'verified'
                  ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm'
                  : 'bg-surface-container border border-outline text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Verified Official Only
            </button>
            <button
              type="button"
              onClick={() => setFilter('rumor')}
              className={`shrink-0 px-3 py-1.5 rounded-full font-label text-xs font-semibold transition-all ${
                filter === 'rumor'
                  ? 'bg-primary-container border border-primary/50 text-on-primary-container shadow-sm'
                  : 'bg-surface-container border border-outline text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Social Rumors &amp; Buzz
            </button>
          </div>
        </header>

        {/* Credibility Weight Explainer Banner */}
        <section className="bg-secondary-container/40 border border-secondary/30 rounded-lg p-3 flex items-start gap-2.5 shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">tune</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-label text-[10px] text-on-secondary-container uppercase font-bold tracking-wider">
              ML Source Weighting
            </span>
            <p className="font-mono text-[11px] text-on-surface font-medium leading-relaxed">
              PUCARS Official (1.0x Weight) • Verified Press (0.8x) • Social Rumors (0.3x)
            </p>
          </div>
        </section>

        {/* Timeline Cards */}
        <section className="flex flex-col gap-3">
          {filteredItems.map((item) => {
            const isOfficial = item.type === 'OFFICIAL';
            const isPress = item.source.includes('State Bank') || item.source.includes('Directorate');
            const isRumor = item.type === 'RUMOR';

            return (
              <article
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className={`rounded-lg p-4 flex flex-col gap-2.5 cursor-pointer transition-all hover:scale-[1.005] active:scale-[0.99] shadow-sm ${
                  isRumor
                    ? 'bg-tertiary-container/20 border border-dashed border-tertiary/60'
                    : isPress
                    ? 'bg-surface-container border border-outline border-l-4 border-l-secondary'
                    : 'bg-surface-container border border-outline border-l-4 border-l-primary'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label text-[10px] font-bold ${
                      isRumor
                        ? 'bg-tertiary-container text-on-tertiary-container'
                        : isPress
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-primary-container text-on-primary-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {isRumor ? 'warning' : isPress ? 'article' : 'verified_user'}
                    </span>
                    {isRumor
                      ? 'UNVERIFIED RUMOR • X / WHATSAPP'
                      : isPress
                      ? `VERIFIED • ${item.source.toUpperCase()}`
                      : 'VERIFIED • PSX PUCARS'}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant font-medium">
                    {item.timeAgo}
                  </span>
                </div>

                <h2 className="font-headline text-title-md text-on-surface font-semibold leading-snug">
                  {item.headline}
                </h2>

                <p className="font-body text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline/40">
                  {isRumor ? (
                    <>
                      <span className="font-mono text-[11px] text-tertiary font-bold">
                        Low Authenticity Score ({item.credibilityScore}%)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-label text-[10px] font-bold">
                        SPECULATIVE BUZZ
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 rounded bg-primary-container/80 text-primary font-mono text-[11px] font-bold">
                        +{item.sentimentScore > 15 ? '0.92 HIGHLY BULLISH' : '0.74 BULLISH'}
                      </span>
                      <span className="font-mono text-[11px] text-on-surface-variant font-semibold">
                        Weight: {isPress ? '0.8x' : '1.0x'}
                      </span>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="w-full max-w-sm bg-surface-container border border-outline rounded-xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-1 rounded-full font-label text-[10px] font-bold ${
                  selectedArticle.type === 'RUMOR'
                    ? 'bg-tertiary-container text-on-tertiary-container'
                    : 'bg-primary-container text-on-primary-container'
                }`}
              >
                {selectedArticle.type === 'RUMOR' ? 'SOCIAL RUMOR' : 'OFFICIAL FILING'}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h3 className="font-headline text-base font-bold text-on-surface">
              {selectedArticle.headline}
            </h3>

            <p className="font-body text-xs text-on-surface leading-relaxed">
              {selectedArticle.summary}
            </p>

            <div className="bg-surface-container-low border border-outline rounded-lg p-3 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Source:</span>
                <span className="font-semibold text-on-surface">{selectedArticle.source}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">AI Credibility Score:</span>
                <span className="font-mono font-bold text-primary">{selectedArticle.credibilityScore}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Market Sentiment Impact:</span>
                <span className="font-mono font-bold text-secondary">+{selectedArticle.sentimentScore}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  onNavigate('prediction');
                }}
                className="flex-1 py-2.5 rounded-md bg-primary text-on-primary font-label text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                View {selectedArticle.relatedTicker} Prediction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
