import React from 'react';
import { NavScreen } from '../types';

interface HeaderProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenNotifications,
  unreadCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-outline/70 px-4 py-3 flex items-center justify-between transition-colors">
      <div 
        className="flex items-center gap-2.5 cursor-pointer select-none active:opacity-80 transition-opacity"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="w-8 h-8 rounded-DEFAULT bg-primary-container border border-primary/40 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
          <span className="material-symbols-outlined text-[20px]">query_stats</span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-[15px] font-semibold text-on-surface tracking-tight leading-none">
            PSX Pulse AI
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant font-medium tracking-wide mt-0.5">
            TERMINAL v2.4
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Market Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-mono text-[11px] font-semibold text-primary tracking-tight">
            KSE-100 LIVE
          </span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative w-8 h-8 rounded-DEFAULT bg-surface-container hover:bg-surface-container-high border border-outline flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          title="Notifications & Market Alerts"
        >
          <span className="material-symbols-outlined text-[19px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-on-primary font-mono text-[9px] font-bold flex items-center justify-center border-2 border-surface">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
