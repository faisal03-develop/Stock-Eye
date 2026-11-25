import React, { useState } from 'react';
import { NavScreen, Stock } from './types';
import { INITIAL_STOCKS, MACRO_INDICATORS, NEWS_RUMOR_ITEMS } from './data/mockData';
import { DeviceFrame } from './components/DeviceFrame';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ScreenerScreen } from './screens/ScreenerScreen';
import { PredictionScreen } from './screens/PredictionScreen';
import { NewsRumorScreen } from './screens/NewsRumorScreen';
import { BacktestScreen } from './screens/BacktestScreen';
import { SimulateTradeModal } from './components/SimulateTradeModal';
import { NotificationModal } from './components/NotificationModal';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('dashboard');
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [selectedStock, setSelectedStock] = useState<Stock>(INITIAL_STOCKS[0]); // SYS
  const [watchlist, setWatchlist] = useState<string[]>(['SYS', 'PPL', 'FFC', 'MEBL']);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [activeTradeStock, setActiveTradeStock] = useState<Stock | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleToggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist((prev) => prev.filter((s) => s !== symbol));
      showToast(`Removed ${symbol} from Watchlist`);
    } else {
      setWatchlist((prev) => [...prev, symbol]);
      showToast(`Added ${symbol} to Watchlist`);
    }
  };

  const handleOnboardingComplete = (_prefs: any) => {
    setCurrentScreen('dashboard');
    showToast('Quantitative Terminal initialized for PSX');
  };

  const handleTradeConfirm = (trade: { symbol: string; shares: number; totalCost: number; targetGain: number }) => {
    setActiveTradeStock(null);
    showToast(`Simulated Order: ${trade.shares} shares of ${trade.symbol} placed!`);
  };

  return (
    <DeviceFrame>
      {/* Toast Alert Notification */}
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary font-label text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Screen Quick Switcher Pill (Helper for easy testing of all 6 Stitch screens) */}
      <div className="bg-surface-container-high/90 border-b border-outline px-3 py-1 flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
        <span className="flex items-center gap-1 font-semibold text-secondary">
          <span className="material-symbols-outlined text-[13px]">tune</span>
          STITCH SCREEN:
        </span>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'onboarding', label: '1. Onboard' },
              { id: 'dashboard', label: '2. Home' },
              { id: 'screener', label: '3. Screener' },
              { id: 'prediction', label: '4. AI Pred' },
              { id: 'news', label: '5. News' },
              { id: 'backtest', label: '6. Backtest' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentScreen(s.id as NavScreen)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentScreen === s.id
                  ? 'bg-primary text-on-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Persistent App Header (Shown on dashboard, screener, prediction, news, backtest) */}
      {currentScreen !== 'onboarding' && (
        <Header
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          unreadCount={unreadNotifications}
        />
      )}

      {/* Screen Views */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            stocks={stocks}
            macroIndicators={MACRO_INDICATORS}
            onSelectStock={(stock) => {
              setSelectedStock(stock);
              setCurrentScreen('prediction');
            }}
            onNavigate={setCurrentScreen}
            onOpenNotifications={() => setIsNotificationOpen(true)}
          />
        )}

        {currentScreen === 'screener' && (
          <ScreenerScreen
            stocks={stocks}
            onSelectStock={(stock) => {
              setSelectedStock(stock);
              setCurrentScreen('prediction');
            }}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'prediction' && (
          <PredictionScreen
            stock={selectedStock}
            isWatchlist={watchlist.includes(selectedStock.symbol)}
            onToggleWatchlist={handleToggleWatchlist}
            onNavigate={setCurrentScreen}
            onOpenTradeModal={(stock) => setActiveTradeStock(stock)}
          />
        )}

        {currentScreen === 'news' && (
          <NewsRumorScreen
            items={NEWS_RUMOR_ITEMS}
            onNavigate={setCurrentScreen}
            onSelectTicker={(symbol) => {
              const matched = stocks.find((s) => s.symbol === symbol);
              if (matched) setSelectedStock(matched);
              setCurrentScreen('prediction');
            }}
          />
        )}

        {currentScreen === 'backtest' && (
          <BacktestScreen onNavigate={setCurrentScreen} />
        )}
      </main>

      {/* Persistent 5-Tab Bottom Navigation Bar (Hidden on Onboarding) */}
      {currentScreen !== 'onboarding' && (
        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}

      {/* Notifications Drawer Modal */}
      {isNotificationOpen && (
        <NotificationModal
          onClose={() => setIsNotificationOpen(false)}
          onClear={() => {
            setUnreadNotifications(0);
            setIsNotificationOpen(false);
            showToast('All notifications cleared');
          }}
        />
      )}

      {/* Simulate Trade Modal */}
      {activeTradeStock && (
        <SimulateTradeModal
          stock={activeTradeStock}
          onClose={() => setActiveTradeStock(null)}
          onConfirm={handleTradeConfirm}
        />
      )}
    </DeviceFrame>
  );
};

export default App;
