import React from 'react';

interface NotificationModalProps {
  onClose: () => void;
  onClear: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onClose, onClear }) => {
  const alerts = [
    {
      id: 1,
      title: 'SYS Breakout Signal Confirmed',
      desc: 'Institutional volume reached 2.4x the 20D average. AI target revised to PKR 445.00.',
      time: '12m ago',
      type: 'buy',
    },
    {
      id: 2,
      title: 'KSE-100 Breaches 118,000 Index Landmark',
      desc: 'Broad market rally driven by technology and banking heavyweights following SBP rate cut expectations.',
      time: '45m ago',
      type: 'macro',
    },
    {
      id: 3,
      title: 'PPL Target Achieved',
      desc: 'Closed 7-day model position at PKR 118.50 with +8.4% realized return.',
      time: '3h ago',
      type: 'profit',
    },
  ];

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
            <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
            <span className="font-headline font-bold text-sm">Real-Time Market Alerts</span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-surface-container-low border border-outline/70 p-3 rounded-lg flex flex-col gap-1 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-on-surface">{alert.title}</span>
                <span className="text-[10px] text-on-surface-variant font-mono">{alert.time}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">{alert.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-outline/50">
          <button
            onClick={onClear}
            className="text-xs text-on-surface-variant hover:text-on-surface font-medium"
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-primary text-on-primary font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
