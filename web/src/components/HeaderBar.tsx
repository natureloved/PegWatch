import React from 'react';
import type { Status, Policy } from '../types';
import { RegimePill } from './RegimePill';
import { Shield, ShieldAlert } from 'lucide-react';

interface HeaderBarProps {
  status: Status;
  policy: Policy;
  onOpenRevokeModal: () => void;
  onRestoreDelegation: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  status,
  policy,
  onOpenRevokeModal,
  onRestoreDelegation,
}) => {
  const isDelegated = policy.delegated;

  return (
    <header className="w-full bg-panel/80 border-b border-panel-border px-6 py-3.5 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Left: Geometric Shield Logomark + Wordmark + Tagline */}
        <div className="flex items-center gap-3">
          {/* PegWatch Geometric Shield/Peg Glyph */}
          <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-panel-elevated border border-mint/30 shadow-[0_0_15px_rgba(61,242,182,0.15)]">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-mint"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Geometric shield with central peg pin */}
              <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" />
              <circle cx="12" cy="11" r="2.5" fill="currentColor" />
              <path d="M12 13.5V17" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                PegWatch
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-panel-elevated border border-slate-700 text-slate-400">
                Base
              </span>
            </div>
            <p className="text-[11px] font-sans text-slate-400 tracking-wide">
              24/7 guardrail for tokenized equities.
            </p>
          </div>
        </div>

        {/* Center: Regime Pill (ambient state) */}
        <div className="flex-1 flex justify-center">
          <RegimePill
            regime={status.regime}
            feedFrozen={status.feedFrozen}
            feedUpdatedAt={status.feedUpdatedAt}
          />
        </div>

        {/* Right: Delegated Wallet Chip & Revoke/Restore Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian border border-panel-border font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isDelegated ? 'bg-mint shadow-[0_0_8px_#3DF2B6]' : 'bg-crimson shadow-[0_0_8px_#F4506A]'
              }`}
            />
            <span className="text-slate-300">
              {policy.delegatedWallet.slice(0, 6)}...{policy.delegatedWallet.slice(-4)}
            </span>
            <span className="text-[10px] text-slate-500 uppercase">
              {isDelegated ? 'Dynamic' : 'Revoked'}
            </span>
          </div>

          {isDelegated ? (
            <button
              id="btn-open-revoke"
              onClick={onOpenRevokeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-crimson bg-crimson-muted border border-crimson/30 hover:bg-crimson/25 hover:border-crimson transition-all cursor-pointer"
              title="Revoke the agent's signing delegation"
            >
              <ShieldAlert size={13} />
              <span>Revoke Access</span>
            </button>
          ) : (
            <button
              id="btn-restore-delegation"
              onClick={onRestoreDelegation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-mint bg-mint-muted border border-mint/30 hover:bg-mint/25 hover:border-mint transition-all cursor-pointer"
              title="Restore Dynamic signing delegation"
            >
              <Shield size={13} />
              <span>Restore Delegation</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
