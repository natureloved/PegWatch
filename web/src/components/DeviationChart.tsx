import React, { useState } from 'react';
import type { DeviationPoint, Action } from '../types';

interface DeviationChartProps {
  data: DeviationPoint[];
  thresholdPct: number;
  actions: Action[];
}

export const DeviationChart: React.FC<DeviationChartProps> = ({
  data,
  thresholdPct,
  actions,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DeviationPoint | null>(null);

  if (!data || data.length === 0) return null;

  const width = 1000;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 25, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Fixed scale from -8% to +8% to keep axes stable
  const minDev = -8;
  const maxDev = 8;
  const devRange = maxDev - minDev;

  const getX = (index: number) => {
    return padding.left + (index / Math.max(1, data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minDev) / devRange) * chartHeight;
  };

  // Generate path
  const points = data.map((d, i) => `${getX(i)},${getY(d.deviationPct)}`).join(' L ');
  const linePath = `M ${points}`;
  const zeroY = getY(0);
  const areaPath = `${linePath} L ${getX(data.length - 1)},${zeroY} L ${padding.left},${zeroY} Z`;

  // Threshold lines
  const upperThresholdY = getY(thresholdPct);
  const lowerThresholdY = getY(-thresholdPct);

  // Identify weekend shaded indices
  const weekendStartIndex = data.findIndex((d) => d.isWeekend);
  const weekendXStart = weekendStartIndex !== -1 ? getX(weekendStartIndex) : null;

  return (
    <div className="w-full bg-panel rounded-xl p-5 border border-panel-border relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            24h Rolling Deviation & Dark Market Windows
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            (Hourly intervals • Area sparkline)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-500/25 border border-violet-500/50" />
            <span>Dark Market (Oracle Frozen)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-crimson/80" />
            <span>Threshold (±{thresholdPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mint shadow-[0_0_6px_#3DF2B6]" />
            <span>De-Risk Execution</span>
          </div>
        </div>
      </div>

      {/* SVG Sparkline */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3DF2B6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3DF2B6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Vertical Shading for Weekend / Dark Market */}
          {weekendXStart !== null && (
            <g>
              <rect
                x={weekendXStart}
                y={padding.top}
                width={padding.left + chartWidth - weekendXStart}
                height={chartHeight}
                fill="#8B7CF6"
                fillOpacity="0.08"
              />
              <line
                x1={weekendXStart}
                y1={padding.top}
                x2={weekendXStart}
                y2={padding.top + chartHeight}
                stroke="#8B7CF6"
                strokeDasharray="3 3"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
            </g>
          )}

          {/* Grid lines and Monospace Axis Labels */}
          {[-5, 0, 5].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
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
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {val >= 0 ? `+${val}%` : `${val}%`}
                </text>
              </g>
            );
          })}

          {/* Upper & Lower Threshold Bands */}
          <line
            x1={padding.left}
            y1={upperThresholdY}
            x2={padding.left + chartWidth}
            y2={upperThresholdY}
            stroke="#F4506A"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <line
            x1={padding.left}
            y1={lowerThresholdY}
            x2={padding.left + chartWidth}
            y2={lowerThresholdY}
            stroke="#F4506A"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />

          {/* Zero baseline */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={padding.left + chartWidth}
            y2={zeroY}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeOpacity="0.25"
          />

          {/* Shaded Area fill and curve */}
          <path d={areaPath} fill="url(#chartGradient)" />
          <path d={linePath} fill="none" stroke="#3DF2B6" strokeWidth="2" strokeLinecap="round" />

          {/* Action Event Pins on Chart */}
          {actions.map((act) => {
            // Find closest data point
            const ptIdx = data.findIndex((d) => Math.abs(d.ts - act.ts) < 3600 * 2);
            if (ptIdx === -1) return null;
            const x = getX(ptIdx);
            const y = getY(act.deviationPct);
            const isExec = act.status === 'EXECUTED';

            return (
              <g key={act.id} transform={`translate(${x}, ${y})`}>
                <circle
                  r="7"
                  fill={isExec ? '#3DF2B6' : '#94A3B8'}
                  opacity="0.3"
                  className={isExec ? 'animate-ping' : ''}
                />
                <circle
                  r="4"
                  fill={isExec ? '#3DF2B6' : '#94A3B8'}
                  stroke="#0B0E14"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Interactive hover points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.deviationPct)}
              r={hoveredPoint?.ts === d.ts ? 5 : 2}
              fill={hoveredPoint?.ts === d.ts ? '#FFFFFF' : '#3DF2B6'}
              stroke="#0B0E14"
              strokeWidth="1.5"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(d)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Time labels across X axis */}
          {data
            .filter((_, i) => i % 6 === 0 || i === data.length - 1)
            .map((d, i) => (
              <text
                key={i}
                x={getX(data.indexOf(d))}
                y={padding.top + chartHeight + 16}
                fill="#64748B"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                {d.timeLabel}
              </text>
            ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-panel-elevated/95 border border-panel-border rounded-lg px-3 py-2 text-xs font-mono shadow-lg pointer-events-none z-10">
            <div className="text-slate-400 text-[10px]">{hoveredPoint.timeLabel}</div>
            <div className="text-white font-semibold mt-0.5">
              Deviation: <span className={Math.abs(hoveredPoint.deviationPct) > thresholdPct ? 'text-crimson' : 'text-mint'}>
                {hoveredPoint.deviationPct >= 0 ? '+' : ''}{hoveredPoint.deviationPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              DEX: ${hoveredPoint.dexPrice.toFixed(2)} · Ref: ${hoveredPoint.fairValue.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
