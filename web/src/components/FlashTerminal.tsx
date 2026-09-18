import React, { useState } from 'react';
import { Zap, Shield, Sliders, ExternalLink, ArrowDownRight, CheckCircle2, RefreshCw } from 'lucide-react';

interface FlashTerminalProps {
  currentPrice?: number;
  benchmarkPrice: number;
  activeThresholdPct: number;
  orderId?: string;
  isDelegated: boolean;
  onAdjustBand?: (deltaPct: number) => void;
}

export const FlashTerminal: React.FC<FlashTerminalProps> = ({
  currentPrice: _currentPrice,
  benchmarkPrice,
  activeThresholdPct,
  orderId = 'flash_qt_0918_b20_nvda_99a',
  isDelegated,
  onAdjustBand,
}) => {
  const [ratchetOffset, setRatchetOffset] = useState(0);
  const [ratchetNotice, setRatchetNotice] = useState<string | null>(null);

  const effectiveThreshold = activeThresholdPct + ratchetOffset;
  const triggerPrice = benchmarkPrice * (1 - effectiveThreshold / 100);

  const handleRatchet = (delta: number) => {
    const next = ratchetOffset + delta;
    setRatchetOffset(next);
    const updatedTrigger = benchmarkPrice * (1 - (activeThresholdPct + next) / 100);
    setRatchetNotice(`Dynamic Trigger Ratcheted to $${updatedTrigger.toFixed(2)} (Off-Chain Signed Update, 0 Gas)`);
    if (onAdjustBand) onAdjustBand(delta);
    setTimeout(() => setRatchetNotice(null), 3000);
  };

  return (
    <div className="w-full bg-panel rounded-xl p-5 border border-panel-border relative overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-mint/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-panel-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-mint/15 border border-mint/40 flex items-center justify-center">
              <Zap size={13} className="text-mint" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Definitive Flash Terminal
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-mint-muted text-mint border border-mint/30">
                  BASE 8453
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Relayer: Online
            </span>
          </div>
        </div>

        {/* Narrative Banner */}
        <p className="text-xs text-slate-400 font-sans mt-3 mb-4 leading-relaxed">
          Non-custodial protective trigger orders. Flash executes on-chain only if the peg breaches your threshold. Funds stay in your wallet.
        </p>

        {/* Core Flash Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 font-mono text-xs mb-3">
          {/* Order Type */}
          <div className="p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Order Type</span>
            <span className="font-semibold text-white flex items-center gap-1">
              <ArrowDownRight size={13} className="text-amber" /> Stop-Loss Trigger
            </span>
          </div>

          {/* Trigger Threshold */}
          <div className="p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Trigger Price</span>
            <span className="font-semibold text-mint">
              ${triggerPrice.toFixed(2)} USD
            </span>
          </div>

          {/* Gas & Relayer */}
          <div className="p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Agent Gas Cost</span>
            <span className="font-semibold text-mint flex items-center gap-1">
              <CheckCircle2 size={12} /> $0.00 (Managed)
            </span>
          </div>

          {/* MEV Shield */}
          <div className="p-2.5 rounded-lg bg-obsidian border border-panel-border">
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">MEV Protection</span>
            <span className="font-semibold text-white flex items-center gap-1">
              <Shield size={12} className="text-mint" /> Anti-Sandwich
            </span>
          </div>
        </div>

        {/* Dynamic Trigger Ratchet (Flash Superpower) */}
        <div className="p-3 rounded-lg bg-panel-elevated/70 border border-panel-border mb-3 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Sliders size={11} className="text-mint" /> Dynamic Band Ratchet
            </span>
            <span className="text-[10px] text-slate-400">
              Current: ±{effectiveThreshold.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRatchet(-0.5)}
              disabled={!isDelegated || effectiveThreshold <= 1.0}
              className="flex-1 py-1.5 px-2 rounded text-[11px] bg-obsidian hover:bg-slate-800 border border-panel-border text-slate-300 transition-all disabled:opacity-40 cursor-pointer text-center"
              title="Tighten trigger band (move closer to benchmark)"
            >
              Tighten (-0.5%)
            </button>
            <button
              onClick={() => handleRatchet(0.5)}
              disabled={!isDelegated || effectiveThreshold >= 10.0}
              className="flex-1 py-1.5 px-2 rounded text-[11px] bg-obsidian hover:bg-slate-800 border border-panel-border text-slate-300 transition-all disabled:opacity-40 cursor-pointer text-center"
              title="Widen trigger band (allow more weekend volatility)"
            >
              Widen (+0.5%)
            </button>
          </div>

          {ratchetNotice && (
            <div className="mt-2 text-[10px] text-mint font-sans flex items-center gap-1 animate-flash-delta">
              <RefreshCw size={10} className="animate-spin" />
              <span>{ratchetNotice}</span>
            </div>
          )}
        </div>

        {/* Verified Flash Allowance Contract & Active Order ID */}
        <div className="p-2.5 rounded-lg bg-obsidian border border-panel-border text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span className="truncate">Active Order: {orderId}</span>
          <a
            href="https://app.definitive.fi/flash-dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-mint hover:underline flex items-center gap-0.5 ml-2 whitespace-nowrap"
          >
            Dashboard <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};
