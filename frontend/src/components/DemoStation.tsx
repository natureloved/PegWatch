import React, { useState } from "react";
import { Play, RotateCcw, AlertTriangle, Cpu, Zap } from "lucide-react";
import type { InjectedDrift } from "../types";

interface DemoStationProps {
  injectedDrift: InjectedDrift | undefined;
  onInject: (driftPct: number, reason: string) => Promise<void>;
  onReset: () => Promise<void>;
  isLoading: boolean;
}

export const DemoStation: React.FC<DemoStationProps> = ({
  injectedDrift,
  onInject,
  onReset,
  isLoading,
}) => {
  const [sliderVal, setSliderVal] = useState<number>(-3.8);

  const presets = [
    {
      label: "Normal Spread (+0.4%)",
      drift: 0.4,
      reason: "Normal liquidity fluctuation",
      variant: "neutral",
    },
    {
      label: "Benign Weekend Gap (-2.0%)",
      drift: -2.0,
      reason: "Thin weekend orderbook; within dark market threshold",
      variant: "amber",
    },
    {
      label: "Abnormal Breach (-3.8%)",
      drift: -3.8,
      reason: "Macro news shock while Chainlink feed is frozen",
      variant: "danger",
    },
    {
      label: "Flash Crash (-6.5%)",
      drift: -6.5,
      reason: "Cascading liquidation event on DEX pool",
      variant: "danger",
    },
  ];

  return (
    <div className="glass-panel" style={{ border: "1px solid rgba(157, 78, 221, 0.35)", background: "rgba(18, 14, 28, 0.75)" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(157, 78, 221, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={18} color="#c084fc" />
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "#e9d5ff", fontWeight: "600" }}>
              Hackathon Demo Simulation Station
            </h3>
            <p style={{ fontSize: "12px", color: "#a855f7", fontFamily: "var(--font-mono)" }}>
              Transparently inject test drift against live Base market prices
            </p>
          </div>
        </div>

        {injectedDrift?.active ? (
          <div className="badge purple">
            <span className="pulse-dot" />
            <span>Active Test: {injectedDrift.driftPct >= 0 ? "+" : ""}{injectedDrift.driftPct}% ({injectedDrift.reason})</span>
            <button
              id="btn-reset-drift"
              className="btn btn-action"
              style={{ padding: "3px 8px", fontSize: "11px", marginLeft: "6px" }}
              onClick={onReset}
              disabled={isLoading}
            >
              <RotateCcw size={11} /> Reset
            </button>
          </div>
        ) : (
          <div className="badge emerald">
            <span className="pulse-dot" />
            <span>Running on Live Aerodrome DEX Feed</span>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        {presets.map((p) => (
          <button
            key={p.drift}
            id={`preset-${p.drift}`}
            className={`btn-preset ${p.variant === "danger" ? "danger" : ""}`}
            onClick={() => onInject(p.drift, p.reason)}
            disabled={isLoading}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {p.variant === "danger" ? <AlertTriangle size={12} /> : <Zap size={12} />}
            <span>{p.label}</span>
          </button>
        ))}

        <button
          id="btn-live-reset"
          className="btn-preset"
          onClick={onReset}
          disabled={isLoading}
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-cyan)" }}
        >
          <RotateCcw size={12} />
          <span>Revert to Live Market</span>
        </button>
      </div>

      {/* Custom Slider */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", background: "rgba(0, 0, 0, 0.25)", borderRadius: "10px" }}>
        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", minWidth: "120px" }}>
          Custom Drift: <strong style={{ color: sliderVal < -3 ? "var(--color-crimson)" : "var(--color-cyan)" }}>{sliderVal >= 0 ? "+" : ""}{sliderVal.toFixed(1)}%</strong>
        </span>

        <input
          id="input-drift-slider"
          type="range"
          min="-10.0"
          max="5.0"
          step="0.1"
          value={sliderVal}
          onChange={(e) => setSliderVal(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "var(--color-cyan)", cursor: "pointer" }}
        />

        <button
          id="btn-apply-slider"
          className="btn btn-action"
          onClick={() => onInject(sliderVal, "Custom Slider Test")}
          disabled={isLoading}
          style={{ padding: "6px 14px", fontSize: "12px" }}
        >
          <Play size={12} /> Apply Drift
        </button>
      </div>

      {/* Agent Autonomous Lifecycle Rail */}
      <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>1. INGEST</div>
          <div style={{ color: "var(--text-primary)" }}>Aerodrome + Chainlink</div>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>2. CLASSIFY</div>
          <div style={{ color: "var(--text-primary)" }}>Regime & N=2 Breach</div>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>3. POLICY</div>
          <div style={{ color: "var(--text-primary)" }}>Dynamic Delegation Limits</div>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>4. EXECUTE</div>
          <div style={{ color: "var(--color-cyan)" }}>Definitive Flash (EIP-712)</div>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>5. REASON</div>
          <div style={{ color: "#c084fc" }}>Bankr LLM Gateway</div>
        </div>
      </div>
    </div>
  );
};
