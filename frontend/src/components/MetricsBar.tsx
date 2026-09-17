import React from "react";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Gauge } from "lucide-react";
import type { StatusResponse } from "../types";

interface MetricsBarProps {
  status: StatusResponse | null;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ status }) => {
  const tick = status?.latestTick;
  const dexPrice = tick ? tick.dex_price : 118.25;
  const oraclePrice = tick ? tick.oracle_price : 118.50;
  const deviation = tick ? tick.deviation_pct : 0;
  const threshold = status ? status.thresholdPct : 3.0;
  const absDev = Math.abs(deviation);

  const isBreach = absDev > threshold;
  const isBenign = !isBreach && absDev > (status?.config.weekdayThresholdPct || 1.2) && (status?.regime.includes("WEEKEND") ?? false);

  const stalenessHours = tick ? (tick.staleness_sec / 3600).toFixed(1) : "42.0";

  let deviationColor = "var(--color-emerald)";
  let deviationLabel = "Within Normal Band";

  if (isBreach) {
    deviationColor = "var(--color-crimson)";
    deviationLabel = "ABNORMAL DRIFT BREACH";
  } else if (isBenign) {
    deviationColor = "var(--color-amber)";
    deviationLabel = "Benign Weekend Gap";
  }

  return (
    <div className="metrics-grid">
      {/* 1. Aerodrome DEX Price */}
      <div className={`glass-panel metric-card ${isBreach ? "breach" : ""}`}>
        <div className="metric-label">
          <span>Aerodrome DEX Price (NVDAc)</span>
          {tick?.is_simulated === 1 ? (
            <span className="badge purple" style={{ fontSize: "10px", padding: "2px 8px" }}>
              Simulated Input
            </span>
          ) : (
            <span className="badge cyan" style={{ fontSize: "10px", padding: "2px 8px" }}>
              Live Base Pool
            </span>
          )}
        </div>
        <div className="metric-value" style={{ color: tick?.is_simulated ? "#c084fc" : "#ffffff" }}>
          ${dexPrice.toFixed(2)}
        </div>
        <div className="metric-sub">
          {deviation >= 0 ? (
            <TrendingUp size={14} color="var(--color-emerald)" />
          ) : (
            <TrendingDown size={14} color="var(--color-crimson)" />
          )}
          <span>Spread vs Fair Value: {deviation >= 0 ? "+" : ""}{deviation.toFixed(2)}%</span>
        </div>
      </div>

      {/* 2. Chainlink Reference Fair Value */}
      <div className="glass-panel metric-card">
        <div className="metric-label">
          <span>Chainlink Reference (24/5)</span>
          <span className="badge purple" style={{ fontSize: "10px", padding: "2px 8px" }}>
            FROZEN (Weekend)
          </span>
        </div>
        <div className="metric-value" style={{ color: "#e2e8f0" }}>
          ${oraclePrice.toFixed(2)}
        </div>
        <div className="metric-sub">
          <ShieldCheck size={14} color="var(--color-purple)" />
          <span>Last Official Close • Stale for {stalenessHours}h</span>
        </div>
      </div>

      {/* 3. Real-Time Peg Deviation */}
      <div className={`glass-panel metric-card ${isBreach ? "breach" : ""}`}>
        <div className="metric-label">
          <span>Peg Deviation</span>
          <span className="badge" style={{ color: deviationColor, borderColor: deviationColor, fontSize: "10px", padding: "2px 8px" }}>
            {deviationLabel}
          </span>
        </div>
        <div className="metric-value" style={{ color: deviationColor }}>
          {deviation >= 0 ? "+" : ""}{deviation.toFixed(2)}%
        </div>
        <div className="metric-sub">
          {isBreach ? (
            <AlertTriangle size={14} color="var(--color-crimson)" />
          ) : (
            <CheckCircle2 size={14} color="var(--color-emerald)" />
          )}
          <span>Tolerance: ±{threshold.toFixed(1)}% ({status?.regime || "REGULAR"})</span>
        </div>
      </div>

      {/* 4. Autonomous De-Risk Rail */}
      <div className="glass-panel metric-card">
        <div className="metric-label">
          <span>Flash Execution Mandate</span>
          <span className="badge cyan" style={{ fontSize: "10px", padding: "2px 8px" }}>
            Definitive Rail
          </span>
        </div>
        <div className="metric-value" style={{ fontSize: "24px", color: "var(--color-cyan)" }}>
          Stop-Loss Trigger
        </div>
        <div className="metric-sub">
          <Gauge size={14} color="var(--color-cyan)" />
          <span>Order Size: {status?.config.defaultSellQty || 0.05} NVDAc (Max ${status?.config.maxNotionalPerActionUsd || 50})</span>
        </div>
      </div>
    </div>
  );
};
