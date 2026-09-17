import React from 'react';
import type { Policy } from '../types';
import { ShieldCheck, ShieldX, Lock, Key, FileCheck, CheckCircle, AlertOctagon } from 'lucide-react';

interface PolicyPanelProps {
  policy: Policy;
  onOpenRevokeModal: () => void;
  onRestoreDelegation: () => void;
}

export const PolicyPanel: React.FC<PolicyPanelProps> = ({
  policy,
  onOpenRevokeModal,
  onRestoreDelegation,
}) => {
  const isDelegated = policy.delegated;

  return (
    <div className="w-full bg-panel rounded-xl p-5 border border-panel-border relative overflow-hidden flex flex-col justify-between">
      {/* Ambience watermark */}
      <div className="absolute -bottom-8 -right-8 opacity-5 pointer-events-none select-none">
        <FileCheck size={160} color="#FFFFFF" />
      </div>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-panel-border">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-mint" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Delegation Mandate
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
              isDelegated
                ? 'bg-mint-muted text-mint border border-mint/40'
                : 'bg-crimson-muted text-crimson border border-crimson/40'
            }`}
          >
            {isDelegated ? 'ACTIVE VIA DYNAMIC' : 'DELEGATION REVOKED'}
          </span>
        </div>

        <p className="text-xs text-slate-400 font-sans mt-3 mb-4 leading-relaxed">
          Signed agreement governing autonomous actions. The agent holds strictly bounded, non-custodial execution rights.
        </p>

        {/* Contract Limits List */}
        <div className="space-y-2.5 font-mono text-xs">
          {/* Max Action */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-slate-400">Max Action Notional</span>
            <span className="font-semibold text-white">${policy.maxActionNotionalUsd} USD</span>
          </div>

          {/* Cooldown */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-slate-400">Action Cooldown</span>
            <span className="font-semibold text-white">{policy.cooldownMinutes} minutes</span>
          </div>

          {/* Thresholds */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-slate-400">Regime Bounds</span>
            <span className="font-semibold text-white">
              ±{policy.maxDeviationPct}% wkd · ±{policy.weekendDeviationPct}% wknd
            </span>
          </div>

          {/* Scope Constraint */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-slate-400">Execution Scope</span>
            <span className="font-semibold text-mint flex items-center gap-1">
              <CheckCircle size={12} /> De-risk Only
            </span>
          </div>

          {/* Non-buying guarantee */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-slate-400">Buy Authority</span>
            <span className="font-semibold text-crimson flex items-center gap-1">
              <AlertOctagon size={12} /> Strictly Blocked
            </span>
          </div>
        </div>

        {/* Dynamic Delegated Signer Address */}
        <div className="mt-4 p-3 rounded-lg bg-panel-elevated border border-panel-border text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Key size={12} className="text-mint" />
            <span className="uppercase text-[10px]">Dynamic MPC Funder</span>
          </div>
          <div className="text-slate-200 truncate font-semibold">
            {policy.delegatedWallet}
          </div>
        </div>
      </div>

      {/* Watermark Note & Revoke Action */}
      <div className="mt-5 pt-3 border-t border-panel-border">
        <p className="text-[10px] font-mono text-slate-500 leading-tight mb-3">
          * Limits enforced app-side and mirrored in the Dynamic delegation grant.
        </p>

        {isDelegated ? (
          <button
            onClick={onOpenRevokeModal}
            className="w-full py-2 rounded-lg text-xs font-mono font-semibold text-crimson bg-crimson-muted border border-crimson/30 hover:bg-crimson hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldX size={14} />
            <span>Revoke Signing Rights</span>
          </button>
        ) : (
          <button
            onClick={onRestoreDelegation}
            className="w-full py-2 rounded-lg text-xs font-mono font-semibold text-mint bg-mint-muted border border-mint/40 hover:bg-mint hover:text-obsidian transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldCheck size={14} />
            <span>Restore Dynamic Delegation</span>
          </button>
        )}
      </div>
    </div>
  );
};
