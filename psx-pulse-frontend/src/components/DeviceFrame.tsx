import React, { useState } from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'wide'>('mobile');

  return (
    <div className="min-h-screen bg-[#070A0E] text-on-surface flex flex-col items-center justify-start">
      {/* Top Desktop Controls Bar (Only visible on medium+ screens) */}
      <aside aria-label="Desktop Preview Controls" className="hidden md:flex w-full bg-surface-container-high/80 border-b border-outline/80 px-6 py-2 items-center justify-between z-50 text-xs text-on-surface-variant backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-semibold text-on-surface">PSX Pulse AI — Android Mobile Web Application</span>
          <span className="px-1.5 py-0.5 rounded bg-surface border border-outline font-mono text-[10px] text-secondary">
            Android 390×844
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px]">View Mode:</span>
          <div className="inline-flex rounded-lg border border-outline bg-surface p-0.5">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                deviceMode === 'mobile'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">smartphone</span>
              Mobile Phone Frame
            </button>
            <button
              onClick={() => setDeviceMode('wide')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                deviceMode === 'wide'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">responsive_layout</span>
              Full Responsive
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 flex flex-col min-h-screen relative ${
          deviceMode === 'mobile'
            ? 'max-w-[420px] md:my-6 md:rounded-[40px] md:shadow-[0_25px_70px_rgba(0,0,0,0.85)] md:border-[6px] md:border-[#1E2634] md:overflow-hidden bg-surface'
            : 'max-w-2xl bg-surface'
        }`}
      >
        {/* Subtle Android Status Bar Simulation */}
        <div className="w-full bg-surface pt-2 px-5 pb-1 flex items-center justify-between text-[11px] font-mono text-on-surface-variant select-none border-b border-outline/30">
          <span className="font-semibold text-on-surface">09:41</span>
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
            <span className="font-sans text-[10px] font-bold text-secondary">5G</span>
            <span className="material-symbols-outlined text-[13px]">wifi</span>
            <span className="material-symbols-outlined text-[15px]">battery_charging_full</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col pb-20 relative">
          {children}
        </div>
      </div>
    </div>
  );
};
