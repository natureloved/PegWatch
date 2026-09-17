import React, { useState } from 'react';
import type { Action } from '../types';
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, Bot, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

interface ActionsLedgerProps {
  actions: Action[];
}

export const ActionsLedger: React.FC<ActionsLedgerProps> = ({ actions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(actions[0]?.id || null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (e: React.MouseEvent, hash: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="w-full bg-panel rounded-xl p-5 border border-panel-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200">
            Agent Actions — Full Audit Trail
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Every autonomous de-risk order with verifiable Basescan receipt and plain-English LLM rationale
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-mono bg-panel-elevated text-slate-400 border border-panel-border">
          {actions.length} {actions.length === 1 ? 'Action' : 'Actions'} Logged
        </span>
      </div>

      {/* Ledger Rows */}
      {actions.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-panel-border rounded-lg text-slate-400 font-mono text-xs">
          <ShieldCheck size={20} className="text-mint mx-auto mb-2 opacity-80" />
          <p className="text-slate-300 font-medium">No protective actions yet</p>
          <p className="text-slate-500 text-[11px] mt-0.5">Position has remained within safe volatility bounds.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((act) => {
            const isExpanded = expandedId === act.id;
            const isExecuted = act.status === 'EXECUTED';
            const isPending = act.status === 'PENDING';
            const isHalted = act.status === 'HALTED_LIMITS';

            const formattedTime = new Date(act.ts * 1000).toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={act.id}
                onClick={() => toggleExpand(act.id)}
                className={`w-full rounded-lg border transition-all duration-200 cursor-pointer ${
                  isExpanded
                    ? 'bg-panel-elevated/70 border-slate-700 shadow-md'
                    : 'bg-obsidian/60 border-panel-border hover:border-slate-700'
                }`}
              >
                {/* Collapsed Bar */}
                <div className="p-3.5 flex items-center justify-between gap-4 flex-wrap">
                  {/* Left: Time & Trigger Deviation */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      {formattedTime}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-crimson-muted text-crimson border border-crimson/30">
                      {act.deviationPct >= 0 ? '+' : ''}{act.deviationPct.toFixed(2)}%
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-medium">
                      {act.decision}
                    </span>
                  </div>

                  {/* Right: Status Pill & Toggle */}
                  <div className="flex items-center gap-3">
                    {/* Status Pill */}
                    {isExecuted && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-mint-muted border border-mint/40 text-mint">
                        <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                        EXECUTED
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-muted border border-amber/40 text-amber animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                        PENDING
                      </span>
                    )}
                    {isHalted && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                        <ShieldAlert size={11} className="text-slate-400" />
                        HALTED — LIMITS
                      </span>
                    )}

                    {/* Expand/Collapse Chevron */}
                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {/* Expanded Details: LLM Voice & Basescan Link */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-panel-border/60 text-xs space-y-3">
                    {/* Agent Voice Quote Block (Bankr Reasoner) */}
                    <div className="relative p-3 rounded-lg bg-obsidian border-l-2 border-l-mint border border-panel-border/80">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-mint uppercase font-semibold mb-1">
                        <Bot size={13} />
                        <span>Agent Rationale (Bankr LLM Reasoner)</span>
                      </div>
                      <p className="text-slate-200 font-sans text-xs leading-relaxed italic">
                        "{act.reason}"
                      </p>
                    </div>

                    {/* Metadata & Basescan Link */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] font-mono">
                      {/* 1. Regime Context */}
                      <div className="bg-panel p-2 rounded border border-panel-border">
                        <span className="text-slate-500 uppercase">Regime Context:</span>
                        <div className="text-slate-300 font-semibold mt-0.5">{act.regime}</div>
                      </div>

                      {/* 2. Definitive Flash Order ID */}
                      <div className="bg-panel p-2 rounded border border-panel-border">
                        <span className="text-slate-500 uppercase">Flash Order ID:</span>
                        <div className="text-slate-300 font-semibold mt-0.5 truncate">
                          {act.orderId || 'N/A (Limit Guardrail)'}
                        </div>
                      </div>

                      {/* 3. Basescan Link (Single most important credibility element) */}
                      <div className="bg-panel p-2 rounded border border-panel-border flex items-center justify-between">
                        <div className="truncate mr-2">
                          <span className="text-slate-500 uppercase">Basescan Tx Hash:</span>
                          {act.txHash ? (
                            <a
                              href={`https://basescan.org/tx/${act.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-mint hover:underline font-bold flex items-center gap-1 mt-0.5 truncate"
                            >
                              <span>{act.txHash.slice(0, 10)}...{act.txHash.slice(-6)}</span>
                              <ExternalLink size={11} className="inline flex-shrink-0" />
                            </a>
                          ) : (
                            <div className="text-slate-500 mt-0.5 italic">None (Suppressed by limit)</div>
                          )}
                        </div>

                        {act.txHash && (
                          <button
                            onClick={(e) => handleCopy(e, act.txHash!)}
                            className="p-1 rounded hover:bg-panel-elevated text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy transaction hash"
                          >
                            {copiedHash === act.txHash ? (
                              <Check size={13} className="text-mint" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
