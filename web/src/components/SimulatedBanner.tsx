import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface SimulatedBannerProps {
  active: boolean;
  driftPct?: number;
  onReset: () => void;
}

export const SimulatedBanner: React.FC<SimulatedBannerProps> = ({ active, driftPct, onReset }) => {
  if (!active) return null;

  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-xs font-mono text-amber-300">
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber-400 animate-pulse" />
        <span className="font-semibold uppercase tracking-wider">
          SIMULATED DRIFT — live market data, injected deviation {driftPct !== undefined ? `(${driftPct >= 0 ? '+' : ''}${driftPct.toFixed(2)}%)` : ''}
        </span>
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 transition-colors cursor-pointer"
        title="Revert to genuine live market pricing"
      >
        <RotateCcw size={12} />
        <span>Revert to Live</span>
      </button>
    </div>
  );
};
