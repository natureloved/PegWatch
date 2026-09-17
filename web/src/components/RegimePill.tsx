import React from 'react';
import type { Regime } from '../types';
import { Moon, Sun, ShieldAlert, Clock } from 'lucide-react';

interface RegimePillProps {
  regime: Regime;
  feedFrozen: boolean;
  feedUpdatedAt: number;
}

export const RegimePill: React.FC<RegimePillProps> = ({ regime, feedFrozen, feedUpdatedAt }) => {
  const isWeekend = regime === 'WEEKEND' || regime === 'HOLIDAY';
  const isOvernight = regime === 'OVERNIGHT';

  // Calculate staleness hours from feedUpdatedAt (unix seconds)
  const nowSec = Math.floor(Date.now() / 1000);
  const stalenessSec = Math.max(0, nowSec - feedUpdatedAt);
  const stalenessHours = (stalenessSec / 3600).toFixed(0);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Primary Regime Pill */}
      <div
        className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-mono font-semibold tracking-wider transition-all duration-300 ${
          isWeekend
            ? 'bg-violet-500/15 border-violet-400/40 text-violet-300 shadow-[0_0_20px_rgba(139,124,246,0.25)] animate-pulse-subtle'
            : isOvernight
            ? 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,185,61,0.2)]'
            : 'bg-mint-muted border-mint/40 text-mint shadow-[0_0_15px_rgba(61,242,182,0.2)]'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isWeekend ? 'bg-violet-400' : isOvernight ? 'bg-amber-400' : 'bg-mint'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isWeekend ? 'bg-violet-400' : isOvernight ? 'bg-amber-400' : 'bg-mint'
            }`}
          />
        </span>

        <div className="flex items-center gap-1.5 uppercase">
          {isWeekend ? (
            <>
              <Moon size={13} className="text-violet-400" />
              <span>WEEKEND — DARK MARKET</span>
            </>
          ) : isOvernight ? (
            <>
              <Clock size={13} className="text-amber-400" />
              <span>OVERNIGHT SESSION</span>
            </>
          ) : (
            <>
              <Sun size={13} className="text-mint" />
              <span>WEEKDAY OPEN</span>
            </>
          )}
        </div>
      </div>

      {/* Secondary Ambient State: Oracle Frozen / Agent Active */}
      {isWeekend && feedFrozen && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <ShieldAlert size={11} className="text-violet-400" />
          <span>Oracle frozen (~{stalenessHours}h) · agent active</span>
        </div>
      )}
    </div>
  );
};
