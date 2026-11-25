import React, { useState } from 'react';
import { Stock } from '../types';

interface SimulateTradeModalProps {
  stock: Stock;
  onClose: () => void;
  onConfirm: (trade: { symbol: string; shares: number; totalCost: number; targetGain: number }) => void;
}

export const SimulateTradeModal: React.FC<SimulateTradeModalProps> = ({
  stock,
  onClose,
  onConfirm,
}) => {
  const [shares, setShares] = useState<number>(500);

  const totalCost = shares * stock.price;
  const projectedValue = shares * stock.targetPrice;
  const projectedGain = projectedValue - totalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      symbol: stock.symbol,
      shares,
      totalCost,
      targetGain: projectedGain,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-surface-container border border-outline rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">candlestick_chart</span>
            <span className="font-headline font-bold text-sm">Simulate AI Trade Position</span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg border border-outline/50">
          <div>
            <span className="font-bold text-base block">{stock.symbol}</span>
            <span className="text-xs text-on-surface-variant">{stock.name}</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-on-surface block">
              PKR {stock.price.toFixed(2)}
            </span>
            <span className="font-mono text-[11px] text-primary font-semibold">
              AI Target: PKR {stock.targetPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Position Size (Shares)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="100"
                step="100"
                value={shares}
                onChange={(e) => setShares(Math.max(10, Number(e.target.value)))}
                className="w-full bg-surface-container-high border border-outline rounded-md px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
              />
              <div className="flex gap-1">
                {[100, 500, 1000].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setShares(count)}
                    className="px-2 py-2 rounded bg-surface border border-outline text-[11px] font-mono hover:border-primary text-on-surface-variant"
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline rounded-lg p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Capital Required:</span>
              <span className="font-mono font-bold text-on-surface">
                PKR {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Projected AI Exit Value:</span>
              <span className="font-mono font-bold text-secondary">
                PKR {projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-outline/50">
              <span className="text-on-surface-variant">Expected Net Profit:</span>
              <span className="font-mono font-bold text-primary">
                +PKR {projectedGain.toLocaleString(undefined, { maximumFractionDigits: 0 })} (+{stock.projectedReturn.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-md bg-surface-container-high border border-outline text-xs font-semibold hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-md bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity"
            >
              Confirm Paper Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
