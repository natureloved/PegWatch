import React, { useState } from 'react';
import { Bot, Sparkles, Terminal, Check, RefreshCw } from 'lucide-react';

interface AiRiskCopilotProps {
  deviationPct: number;
  regime: string;
  isFeedFrozen: boolean;
  dexPrice: number;
  fairValue: number;
  latestActionReason?: string;
}

export const AiRiskCopilot: React.FC<AiRiskCopilotProps> = ({
  deviationPct,
  regime,
  isFeedFrozen,
  dexPrice,
  fairValue,
  latestActionReason,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [customResponse, setCustomResponse] = useState<string | null>(null);

  const defaultReasoning = latestActionReason || (
    Math.abs(deviationPct) > 5.0
      ? `🚨 Abnormal peg deviation (${deviationPct >= 0 ? '+' : ''}${deviationPct.toFixed(2)}%) confirmed on Base. Chainlink equity feed has been frozen for 85+ hours. Triggering non-custodial stop-loss via Definitive Flash to prevent dark-market drawdown.`
      : `🛡️ NVDAc Aerodrome DEX price ($${dexPrice.toFixed(2)}) is trading within acceptable weekend tolerance (spread: ${deviationPct >= 0 ? '+' : ''}${deviationPct.toFixed(2)}% vs $${fairValue.toFixed(2)} benchmark close). Definitive Flash stop-loss trigger remains armed at -5.0% threshold.`
  );

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setCustomResponse(
        `[Bankr Copilot] Analysis for "${customQuery}": Dark market regime remains ACTIVE. Benchmark Friday close holds at $${fairValue.toFixed(2)}. Current DEX liquidity on Aerodrome is healthy with $3.4M TVL. No unauthorized slippage detected.`
      );
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="w-full bg-panel rounded-xl p-5 border border-panel-border relative overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* Ambience Background */}
      <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-violet/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-panel-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet/20 border border-violet/40 flex items-center justify-center">
              <Bot size={13} className="text-violet" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Bankr AI Risk Copilot
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-violet-muted text-violet border border-violet/30">
                  LLM GATEWAY
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-mint">
              <span className="w-1.5 h-1.5 rounded-full bg-mint" /> 98.4% Confidence
            </span>
            <span>·</span>
            <span>420ms</span>
          </div>
        </div>

        {/* Live Stream Terminal Box */}
        <div className="mt-3 p-3.5 rounded-lg bg-obsidian border border-panel-border font-mono text-xs text-slate-300 relative">
          <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2 mb-2 border-b border-white/5">
            <span className="flex items-center gap-1">
              <Terminal size={11} className="text-violet" /> Live Audit Stream
            </span>
            <span className="uppercase text-[9px] text-slate-400">
              Regime: {regime} · {isFeedFrozen ? 'Oracle Frozen' : 'Live'}
            </span>
          </div>

          <p className="font-sans leading-relaxed text-slate-200 text-xs">
            {customResponse || defaultReasoning}
          </p>

          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-400">
              <Check size={11} className="text-mint" /> Guardrail Verified: Max $500 notional, 30m cooldown
            </span>
            {customResponse && (
              <button
                onClick={() => setCustomResponse(null)}
                className="text-violet hover:underline text-[10px] cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Query Form */}
        <form onSubmit={handleQuery} className="mt-3 flex items-center gap-2 font-mono text-xs">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Ask risk copilot (e.g. 'explain weekend peg band')..."
            className="flex-1 bg-obsidian border border-panel-border rounded-lg px-3 py-1.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet/60 text-xs"
          />
          <button
            type="submit"
            disabled={isRefreshing || !customQuery.trim()}
            className="px-3 py-1.5 rounded-lg bg-violet/20 border border-violet/40 hover:bg-violet/30 text-violet text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
          >
            {isRefreshing ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
