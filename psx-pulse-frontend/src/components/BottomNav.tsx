import React from 'react';
import { NavScreen } from '../types';

interface BottomNavProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-surface-container/95 backdrop-blur-md border-t border-outline px-2 py-1.5 grid grid-cols-5 items-end shadow-2xl"
    >
      {/* 1. Home Dashboard */}
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center gap-1 py-1 transition-all ${
          currentScreen === 'dashboard'
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={currentScreen === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          home
        </span>
        <span className="font-label text-[10px] font-semibold tracking-tight">Home</span>
      </button>

      {/* 2. Screener */}
      <button
        onClick={() => onNavigate('screener')}
        className={`flex flex-col items-center justify-center gap-1 py-1 transition-all ${
          currentScreen === 'screener'
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={currentScreen === 'screener' ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          manage_search
        </span>
        <span className="font-label text-[10px] font-semibold tracking-tight">Screener</span>
      </button>

      {/* 3. AI Forecast (Elevated center button) */}
      <button
        onClick={() => onNavigate('prediction')}
        className="flex flex-col items-center justify-center gap-1 -mt-5 group"
      >
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ring-4 ring-surface ${
            currentScreen === 'prediction'
              ? 'bg-primary text-on-primary shadow-primary/40 ring-primary/20'
              : 'bg-primary-container text-on-primary-container border border-primary/40 hover:bg-primary hover:text-on-primary shadow-primary/20'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
        </span>
        <span
          className={`font-label text-[10px] font-semibold tracking-tight transition-colors ${
            currentScreen === 'prediction' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          AI Forecast
        </span>
      </button>

      {/* 4. News & Rumors */}
      <button
        onClick={() => onNavigate('news')}
        className={`flex flex-col items-center justify-center gap-1 py-1 transition-all ${
          currentScreen === 'news'
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={currentScreen === 'news' ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          newspaper
        </span>
        <span className="font-label text-[10px] font-semibold tracking-tight">News</span>
      </button>

      {/* 5. Track Record / Backtest */}
      <button
        onClick={() => onNavigate('backtest')}
        className={`flex flex-col items-center justify-center gap-1 py-1 transition-all ${
          currentScreen === 'backtest'
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={currentScreen === 'backtest' ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          verified
        </span>
        <span className="font-label text-[10px] font-semibold tracking-tight">Track</span>
      </button>
    </nav>
  );
};
