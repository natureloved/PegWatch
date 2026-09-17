import React, { useState } from "react";
import type { PriceTick, AgentAction } from "../types";

interface DeviationChartProps {
  ticks: PriceTick[];
  actions: AgentAction[];
  thresholdPct: number;
}

export const DeviationChart: React.FC<DeviationChartProps> = ({
  ticks,
  actions,
  thresholdPct,
}) => {
  const [hoveredTick, setHoveredTick] = useState<PriceTick | null>(null);

  if (ticks.length === 0) {
    return (
      <div className="glass-panel" style={{ height: "340px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Awaiting live price ticks from Base...
        </span>
      </div>
    );
  }

  const width = 800;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 30, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate min/max across dex prices and oracle reference
  const allPrices = ticks.flatMap((t) => [t.dex_price, t.oracle_price]);
  const minPrice = Math.min(...allPrices) * 0.98;
  const maxPrice = Math.max(...allPrices) * 1.02;
  const priceRange = maxPrice - minPrice || 1;

  const getX = (index: number) => {
    return padding.left + (index / Math.max(1, ticks.length - 1)) * chartWidth;
  };

  const getY = (price: number) => {
    return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  // Generate SVG path for DEX Price
  const dexPoints = ticks.map((t, i) => `${getX(i)},${getY(t.dex_price)}`).join(" L ");
  const dexPath = `M ${dexPoints}`;
  const areaPath = `${dexPath} L ${getX(ticks.length - 1)},${padding.top + chartHeight} L ${padding.left},${padding.top + chartHeight} Z`;

  // Latest Oracle Price for reference line
  const latestOracle = ticks[ticks.length - 1]?.oracle_price || 118.50;
  const oracleY = getY(latestOracle);

  // Upper & Lower breach thresholds
  const upperThresholdPrice = latestOracle * (1 + thresholdPct / 100);
  const lowerThresholdPrice = latestOracle * (1 - thresholdPct / 100);
  const upperY = getY(upperThresholdPrice);
  const lowerY = getY(lowerThresholdPrice);

  return (
    <div className="glass-panel" style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: "600" }}>
            Live DEX Price & Fair Value Peg Deviation
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
            Aerodrome NVDAc/USDC Pool vs. Frozen Chainlink Benchmark (Base)
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "12px", height: "3px", background: "var(--color-cyan)", borderRadius: "2px" }} />
            <span style={{ color: "var(--text-secondary)" }}>DEX Price</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "12px", height: "2px", borderTop: "2px dashed #e2e8f0" }} />
            <span style={{ color: "var(--text-secondary)" }}>Chainlink Fair Value</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "12px", height: "8px", background: "rgba(255, 42, 85, 0.2)", border: "1px solid rgba(255, 42, 85, 0.5)", borderRadius: "2px" }} />
            <span style={{ color: "var(--text-secondary)" }}>Breach Guardrail (±{thresholdPct}%)</span>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="breachGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-crimson)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-crimson)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const price = minPrice + ratio * priceRange;
            const y = getY(price);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  textAnchor="end"
                >
                  ${price.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Threshold Breach Zones */}
          {lowerY < padding.top + chartHeight && (
            <rect
              x={padding.left}
              y={lowerY}
              width={chartWidth}
              height={padding.top + chartHeight - lowerY}
              fill="url(#breachGradient)"
            />
          )}

          {/* Upper Threshold Line */}
          {upperY > padding.top && (
            <line
              x1={padding.left}
              y1={upperY}
              x2={padding.left + chartWidth}
              y2={upperY}
              stroke="rgba(255, 42, 85, 0.6)"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          )}

          {/* Lower Threshold Line */}
          <line
            x1={padding.left}
            y1={lowerY}
            x2={padding.left + chartWidth}
            y2={lowerY}
            stroke="rgba(255, 42, 85, 0.6)"
            strokeDasharray="3 3"
            strokeWidth="1.5"
          />

          {/* Chainlink Oracle Fair Value Line */}
          <line
            x1={padding.left}
            y1={oracleY}
            x2={padding.left + chartWidth}
            y2={oracleY}
            stroke="#ffffff"
            strokeDasharray="6 4"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* DEX Area Fill & Curve */}
          <path d={areaPath} fill="url(#cyanGradient)" />
          <path d={dexPath} fill="none" stroke="var(--color-cyan)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Hover Points & Markers */}
          {ticks.map((t, i) => {
            const cx = getX(i);
            const cy = getY(t.dex_price);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={hoveredTick?.timestamp === t.timestamp ? 6 : 3}
                fill={t.is_simulated ? "var(--color-purple)" : "var(--color-cyan)"}
                stroke="#07090e"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                onMouseEnter={() => setHoveredTick(t)}
                onMouseLeave={() => setHoveredTick(null)}
              />
            );
          })}

          {/* Execution Markers from Action Ledger */}
          {actions.map((act) => {
            const closestIndex = ticks.findIndex((t) => Math.abs(t.timestamp - act.timestamp) < 90000);
            if (closestIndex === -1) return null;
            const x = getX(closestIndex);
            const y = getY(ticks[closestIndex].dex_price);
            return (
              <g key={act.id} transform={`translate(${x}, ${y})`}>
                <circle r="9" fill="var(--color-crimson)" opacity="0.4" />
                <circle r="5" fill="var(--color-crimson)" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredTick && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(10, 14, 23, 0.92)",
              border: "1px solid var(--border-active)",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              boxShadow: "var(--shadow-glow-cyan)",
              pointerEvents: "none",
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>
              {new Date(hoveredTick.timestamp).toLocaleTimeString()}
            </div>
            <div>DEX: <span style={{ color: "var(--color-cyan)", fontWeight: "600" }}>${hoveredTick.dex_price.toFixed(2)}</span></div>
            <div>Fair Value: <span>${hoveredTick.oracle_price.toFixed(2)}</span></div>
            <div>
              Deviation:{" "}
              <span style={{ color: Math.abs(hoveredTick.deviation_pct) > thresholdPct ? "var(--color-crimson)" : "var(--color-emerald)" }}>
                {hoveredTick.deviation_pct >= 0 ? "+" : ""}{hoveredTick.deviation_pct.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
