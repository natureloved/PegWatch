import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Activity,
  Bot,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  primaryDeviation?: number;
  primaryDexPrice?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  primaryDeviation = -3.71,
  primaryDexPrice = 207.99,
}) => {
  const [sandboxDrift, setSandboxDrift] = useState(-4.2);
  const [sandboxSimulated, setSandboxSimulated] = useState(false);

  const benchmarkPrice = 216.00;
  const simulatedDex = benchmarkPrice * (1 + sandboxDrift / 100);
  const isBreach = Math.abs(sandboxDrift) > 5.0;

  return (
    <div className="w-full min-h-screen bg-obsidian text-slate-100 font-sans selection:bg-mint/20 selection:text-mint">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden border-b border-panel-border">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-mint/15 via-violet/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Hackathon Sponsor Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel border border-mint/30 shadow-[0_0_20px_rgba(61,242,182,0.15)] text-xs font-mono mb-6 animate-flash-delta">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="text-slate-300 font-semibold">Runtime Hackathon 2026</span>
            <span className="text-slate-600">·</span>
            <span className="text-mint font-bold">Base</span>
            <span className="text-slate-600">·</span>
            <span className="text-white">Definitive Flash</span>
            <span className="text-slate-600">·</span>
            <span className="text-violet font-bold">Dynamic</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber font-bold">Bankr</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
            The 24/7 Autonomous Risk Engine for{' '}
            <span className="bg-gradient-to-r from-mint via-teal-300 to-violet bg-clip-text text-transparent">
              Tokenized Equities
            </span>
          </h1>

          {/* Subtitle / Value Proposition */}
          <p className="text-base sm:text-lg text-slate-400 max-w-3xl leading-relaxed mb-8 font-normal">
            Tokenized stocks trade around the clock on Base DEXs. But official Chainlink oracles freeze for{' '}
            <strong className="text-violet font-semibold">65.5 hours every weekend</strong>. PegWatch autonomously detects dark-market peg drift and executes protective, non-custodial stop-loss orders via{' '}
            <strong className="text-white font-semibold">Definitive Flash</strong> before Wall Street re-opens.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex items-center flex-wrap justify-center gap-4 mb-14">
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-mint text-obsidian font-mono font-bold text-sm hover:bg-mint/90 transition-all shadow-[0_0_25px_rgba(61,242,182,0.35)] cursor-pointer group"
            >
              <span>Launch Mission Control</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#dark-market-gap"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-panel border border-panel-border hover:border-slate-600 font-mono text-sm text-slate-300 transition-all cursor-pointer"
            >
              <span>Understand 65.5h Gap</span>
              <TrendingDown size={16} className="text-amber" />
            </a>
          </div>

          {/* Live Hero Telemetry Card Teaser */}
          <div className="w-full max-w-4xl bg-panel/90 rounded-2xl border border-mint/25 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-panel-border text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
                <span className="font-bold text-white tracking-wide">LIVE COCKPIT: NVDAc / USDC</span>
                <span className="px-2 py-0.5 rounded bg-violet-muted text-violet border border-violet/30 text-[10px]">
                  WEEKEND DARK MARKET
                </span>
              </div>
              <div className="text-slate-400">
                Aerodrome Pool · Base Chain ID: 8453
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-5 text-left font-mono">
              <div className="p-3.5 rounded-xl bg-obsidian border border-panel-border">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">DEX Live Price (24/7)</span>
                <span className="text-xl font-bold text-white">${primaryDexPrice.toFixed(2)}</span>
                <span className="text-[10px] text-mint block mt-1">● Aerodrome V2</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian border border-panel-border">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Chainlink Benchmark</span>
                <span className="text-xl font-bold text-white">$216.00</span>
                <span className="text-[10px] text-violet block mt-1">❄️ Frozen 85h</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian border border-panel-border">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Live Peg Deviation</span>
                <span className={`text-xl font-bold ${primaryDeviation < -3 ? 'text-amber' : 'text-mint'}`}>
                  {primaryDeviation > 0 ? '+' : ''}{primaryDeviation.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Dark Market Spread</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian border border-panel-border">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Flash Protective Stop</span>
                <span className="text-xl font-bold text-amber">$205.20</span>
                <span className="text-[10px] text-slate-400 block mt-1">⚡ Stop Armed (-5.0%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-panel-border font-mono text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-mint" />
                <span>Non-Custodial · Gasless Managed Execution via Definitive Flash</span>
              </div>
              <button
                onClick={onLaunchApp}
                className="text-mint hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Enter Terminal</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 65.5-HOUR DARK MARKET GAP */}
      <section id="dark-market-gap" className="py-20 px-6 border-b border-panel-border relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-mint font-semibold">
              The Structural Vulnerability
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Why Tokenized Equities Need an Autonomous Risk Desk
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Coinbase tokenized equities (B20 tokens) trade continuously 24/7 on decentralized exchanges. But off-chain equities and official Chainlink feeds stop on Friday afternoon.
            </p>
          </div>

          {/* Comparative Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TradFi Card */}
            <div className="p-6 rounded-2xl bg-panel border border-panel-border relative">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                Wall Street / TradFi
              </div>
              <h3 className="text-lg font-bold text-white mb-2">24/5 Trading Hours</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Markets strictly close Friday 4:00 PM ET and reopen Monday 9:30 AM ET. Zero trading occurs over weekends.
              </p>
              <div className="p-3 rounded-lg bg-obsidian border border-panel-border font-mono text-[11px] text-slate-500">
                Weekend Volume: <strong>$0.00</strong> (Market Dormant)
              </div>
            </div>

            {/* Chainlink Oracle Card */}
            <div className="p-6 rounded-2xl bg-panel border border-panel-border relative">
              <div className="text-xs font-mono text-violet uppercase tracking-wider mb-2">
                Chainlink Reference Feed
              </div>
              <h3 className="text-lg font-bold text-white mb-2">65.5h Weekend Freeze</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Chainlink feeds explicitly freeze and hold Friday close. Base warns developers: <em>"Never settle or liquidate against a frozen feed."</em>
              </p>
              <div className="p-3 rounded-lg bg-obsidian border border-violet/30 font-mono text-[11px] text-violet flex items-center gap-1.5">
                <Clock size={12} />
                <span>Staleness Bounds: <strong>65.5 Hours Inactive</strong></span>
              </div>
            </div>

            {/* Aerodrome / PegWatch Card */}
            <div className="p-6 rounded-2xl bg-panel border border-mint/40 shadow-[0_0_20px_rgba(61,242,182,0.1)] relative">
              <div className="text-xs font-mono text-mint uppercase tracking-wider mb-2">
                Base DEX + PegWatch
              </div>
              <h3 className="text-lg font-bold text-white mb-2">24/7 Continuous Defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Tokens trade 24/7. When macro news drops at 3:00 AM on Saturday, PegWatch executes non-custodial Flash stop-losses to defend your balance.
              </p>
              <div className="p-3 rounded-lg bg-mint/10 border border-mint/30 font-mono text-[11px] text-mint flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={12} />
                <span>PegWatch: <strong>Autonomous 24/7 Protection</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 4 ARCHITECTURAL PILLARS */}
      <section className="py-20 px-6 border-b border-panel-border bg-obsidian/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-mint font-semibold">
              Engine Mechanics
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Built on 4 Uncompromising Principles
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Institutional security meets crypto-native execution. No custodian. No gas overhead. Complete auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-panel border border-panel-border hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-mint/15 border border-mint/30 flex items-center justify-center text-mint mb-4">
                <Activity size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Dual-Stream Telemetry</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ingests live spot prices from Aerodrome Slipstream DEX pools on Base and cross-references against the last official Chainlink close. Detects staleness bounds in real time.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-panel border border-panel-border hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber mb-4">
                <TrendingDown size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Time-Aware Regime Classifier</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Applies adaptive risk bands: Weekday Regular (±1.2%), Overnight (±2.0%), and Weekend Dark Market (±5.0%). Requires consecutive block confirmations (N=2) to reject single-block flash spikes.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-panel border border-mint/40 shadow-[0_0_20px_rgba(61,242,182,0.08)] hover:border-mint transition-all">
              <div className="w-10 h-10 rounded-xl bg-mint/20 border border-mint/40 flex items-center justify-center text-mint mb-4">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Definitive Flash Non-Custodial Rail</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Posts native Flash stop-loss trigger orders. Funds stay safely in the user's wallet until triggers fire on-chain. Zero user gas fees, full MEV/sandwich attack immunity, and dynamic off-chain band ratcheting.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-panel border border-violet/30 hover:border-violet transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet/20 border border-violet/40 flex items-center justify-center text-violet mb-4">
                <Bot size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. Dynamic Delegated Mandate & Bankr AI</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Strict risk policies ($500 cap, 30 min cooldown) enforceable with one-click user revocation. Every action produces a transparent 2-sentence plain-English explanation via the Bankr LLM Gateway.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SANDBOX SIMULATOR */}
      <section className="py-20 px-6 border-b border-panel-border relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-mint font-semibold">
              Interactive Test Harness
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2 mb-3">
              Simulate Weekend Peg Shocks Live
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Drag the slider to inject simulated peg drift and see how PegWatch arms and executes Flash stop-loss orders in real time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-panel border border-panel-border shadow-[0_8px_32px_rgba(0,0,0,0.5)] font-mono">
            {/* Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">Simulated Peg Deviation:</span>
                <span className={`text-base font-bold ${isBreach ? 'text-crimson' : 'text-amber'}`}>
                  {sandboxDrift > 0 ? '+' : ''}{sandboxDrift.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="-8.0"
                max="0.0"
                step="0.1"
                value={sandboxDrift}
                onChange={(e) => {
                  setSandboxDrift(parseFloat(e.target.value));
                  setSandboxSimulated(true);
                }}
                className="w-full accent-mint h-2 bg-obsidian rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>-8.0% (Flash Crash)</span>
                <span>-5.0% (Trigger Threshold)</span>
                <span>0.0% (Fair Value)</span>
              </div>
            </div>

            {/* Evaluation Result Box */}
            <div className="p-4 rounded-xl bg-obsidian border border-panel-border text-xs mb-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                <span className="text-slate-400">
                  Simulated DEX Price: <strong>${simulatedDex.toFixed(2)}</strong>
                  {sandboxSimulated && <span className="ml-2 text-[10px] text-amber">(Slider Adjusted)</span>}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  isBreach ? 'bg-crimson-muted text-crimson border border-crimson/40' : 'bg-mint-muted text-mint border border-mint/40'
                }`}>
                  {isBreach ? 'CRITICAL BREACH (> -5%)' : 'SAFE TOLERANCE BAND'}
                </span>
              </div>

              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                {isBreach
                  ? `🚨 Deviation (${sandboxDrift.toFixed(1)}%) breaches the ±5.0% weekend limit. PegWatch confirms consecutive blocks and executes a Definitive Flash stop-loss order at $205.20 USD. Order signed via Dynamic MPC funder.`
                  : `🛡️ Deviation (${sandboxDrift.toFixed(1)}%) is within weekend dark-market tolerance. Flash stop-loss order remains armed at $205.20 USD. No action required.`}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Simulated inputs are clearly marked with badges across all ledger rows.
              </span>
              <button
                onClick={onLaunchApp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mint text-obsidian text-xs font-bold hover:bg-mint/90 transition-all cursor-pointer"
              >
                <span>Launch Full Terminal</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRACK SPONSORS INDEX */}
      <section className="py-16 px-6 border-b border-panel-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
              Engineered for the Runtime Hackathon Tracks
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-panel border border-panel-border text-center">
              <span className="text-mint font-bold block mb-1">Definitive Flash</span>
              <span className="text-slate-400 text-[11px]">Native Trigger Orders & Gasless Execution</span>
            </div>

            <div className="p-4 rounded-xl bg-panel border border-panel-border text-center">
              <span className="text-white font-bold block mb-1">Base</span>
              <span className="text-slate-400 text-[11px]">Aerodrome B20 Pools & L2 Settlement</span>
            </div>

            <div className="p-4 rounded-xl bg-panel border border-panel-border text-center">
              <span className="text-violet font-bold block mb-1">Dynamic</span>
              <span className="text-slate-400 text-[11px]">Delegated MPC Wallet & User Revocation</span>
            </div>

            <div className="p-4 rounded-xl bg-panel border border-panel-border text-center">
              <span className="text-amber font-bold block mb-1">Bankr</span>
              <span className="text-slate-400 text-[11px]">LLM Gateway & Plain-English Rationale</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION & FOOTER */}
      <footer className="py-16 px-6 bg-obsidian">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Defend Your Tokenized Assets Against Weekend Shocks
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-xl mx-auto">
            Experience the mission control dashboard or inspect the open-source code audited for the hackathon tracks.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={onLaunchApp}
              className="px-6 py-3 rounded-xl bg-mint text-obsidian font-mono font-bold text-sm hover:bg-mint/90 transition-all shadow-[0_0_20px_rgba(61,242,182,0.3)] cursor-pointer"
            >
              Launch Mission Control ⚡
            </button>
            <a
              href="https://github.com/natureloved/PegWatch"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-panel border border-panel-border font-mono text-sm text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>GitHub Repository</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="text-xs font-mono text-slate-600">
            PegWatch · Autonomous Risk Agent for Base Tokenized Equities · Built for Runtime Hackathon 2026
          </div>
        </div>
      </footer>
    </div>
  );
};
