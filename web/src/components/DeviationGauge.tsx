import React, { useEffect, useState, useRef } from 'react';
import type { Status } from '../types';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DeviationGaugeProps {
  status: Status;
}

export const DeviationGauge: React.FC<DeviationGaugeProps> = ({ status }) => {
  const [prevDev, setPrevDev] = useState(status.deviationPct);
  const [hasChanged, setHasChanged] = useState(false);
  const prevClassification = useRef(status.classification);
  const [flashingRed, setFlashingRed] = useState(false);

  // Trigger brief flash when deviation updates
  useEffect(() => {
    if (prevDev !== status.deviationPct) {
      setHasChanged(true);
      const timer = setTimeout(() => setHasChanged(false), 500);
      setPrevDev(status.deviationPct);
      return () => clearTimeout(timer);
    }
  }, [status.deviationPct, prevDev]);

  // Flash red on transition to ABNORMAL
  useEffect(() => {
    if (status.classification === 'ABNORMAL' && prevClassification.current !== 'ABNORMAL') {
      setFlashingRed(true);
      const timer = setTimeout(() => setFlashingRed(false), 1200);
      return () => clearTimeout(timer);
    }
    prevClassification.current = status.classification;
  }, [status.classification]);

  const threshold = status.thresholdPct || 5.0;
  const deviation = status.deviationPct;
  const clampedDev = Math.max(-10, Math.min(10, deviation));

  // Needle angle: -10% = 180deg (left), 0% = 90deg (top), +10% = 0deg (right)
  // angle = 90 - (clampedDev * 9) degrees
  const needleAngle = 90 - clampedDev * 9;

  // Calculate staleness
  const nowSec = Math.floor(Date.now() / 1000);
  const stalenessHours = Math.max(0, Math.floor((nowSec - status.feedUpdatedAt) / 3600));

  // Gauge state styling
  const isArmed = status.classification === 'ARMED';
  const isAbnormal = status.classification === 'ABNORMAL';

  let borderClasses = 'border-panel-border';
  if (flashingRed || isAbnormal) {
    borderClasses = 'border-crimson shadow-[0_0_35px_rgba(244,80,106,0.35)]';
  } else if (isArmed) {
    borderClasses = 'border-amber shadow-[0_0_30px_rgba(245,185,61,0.25)] animate-pulse-subtle';
  }

  // Determine deviation color
  const absDev = Math.abs(deviation);
  let devColor = 'text-mint';
  if (absDev > threshold) {
    devColor = 'text-crimson';
  } else if (absDev > threshold * 0.6) {
    devColor = 'text-amber';
  }

  // SVG Geometry for semicircular gauge
  const cx = 200;
  const cy = 190;
  const radius = 140;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Arc angles (0 to 180, where 0 is left, 90 is top, 180 is right):
  // Left danger: -10% to -threshold
  const leftDangerEnd = 90 - (threshold / 10) * 90;
  // Right danger: +threshold to +10%
  const rightDangerStart = 90 + (threshold / 10) * 90;

  return (
    <div
      className={`relative w-full bg-panel rounded-2xl p-6 border transition-all duration-500 overflow-hidden ${borderClasses}`}
    >
      {/* Ambience glow behind gauge */}
      <div
        className={`absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700 ${
          isAbnormal ? 'bg-crimson' : isArmed ? 'bg-amber' : 'bg-mint'
        }`}
      />

      {/* Header bar within Hero */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Real-Time Peg Deviation
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-panel-elevated text-slate-400 border border-panel-border">
            NVDAc / USDC
          </span>
        </div>

        {/* Escalation Status Pill */}
        {isArmed ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber text-amber text-xs font-mono font-semibold animate-pulse">
            <AlertCircle size={13} />
            <span>Breach {status.breaches}/{status.requiredBreaches} — confirming…</span>
          </div>
        ) : isAbnormal ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crimson-muted border border-crimson text-crimson text-xs font-mono font-semibold">
            <ShieldAlert size={13} />
            <span>ABNORMAL DRIFT TRIGGERED</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint-muted border border-mint/30 text-mint text-xs font-mono font-medium">
            <CheckCircle2 size={13} />
            <span>Safe Operating Band</span>
          </div>
        )}
      </div>

      {/* Dominant Semicircular SVG Gauge */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <svg
          viewBox="0 0 400 220"
          className="w-full max-w-[460px] h-auto overflow-visible select-none"
        >
          {/* Background Track Arc */}
          <path
            d={describeArc(cx, cy, radius, 0, 180)}
            fill="none"
            stroke="#1A2234"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Left Danger Band (-10% to -threshold) */}
          <path
            d={describeArc(cx, cy, radius, 0, leftDangerEnd)}
            fill="none"
            stroke="#F4506A"
            strokeWidth="14"
            strokeOpacity="0.8"
          />

          {/* Safe Band (-threshold to +threshold) */}
          <path
            d={describeArc(cx, cy, radius, leftDangerEnd, rightDangerStart)}
            fill="none"
            stroke="#3DF2B6"
            strokeWidth="14"
            strokeOpacity="0.4"
          />

          {/* Right Danger Band (+threshold to +10%) */}
          <path
            d={describeArc(cx, cy, radius, rightDangerStart, 180)}
            fill="none"
            stroke="#F4506A"
            strokeWidth="14"
            strokeOpacity="0.8"
          />

          {/* Threshold Tick Marks */}
          {[-10, -threshold, 0, threshold, 10].map((val) => {
            const angle = 90 - val * 9;
            const ptInner = polarToCartesian(cx, cy, radius - 12, 180 - angle);
            const ptOuter = polarToCartesian(cx, cy, radius + 12, 180 - angle);
            const isZero = val === 0;
            return (
              <g key={val}>
                <line
                  x1={ptInner.x}
                  y1={ptInner.y}
                  x2={ptOuter.x}
                  y2={ptOuter.y}
                  stroke={isZero ? '#FFFFFF' : Math.abs(val) >= threshold ? '#F4506A' : '#94A3B8'}
                  strokeWidth={isZero ? '2.5' : '1.5'}
                  strokeOpacity="0.75"
                />
              </g>
            );
          })}

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Tapered Pointer */}
            <polygon
              points={`${cx - 3.5},${cy} ${cx + 3.5},${cy} ${cx},${cy - radius + 5}`}
              fill={isAbnormal ? '#F4506A' : isArmed ? '#F5B93D' : '#3DF2B6'}
              style={{
                filter: isAbnormal
                  ? 'drop-shadow(0 0 6px rgba(244,80,106,0.8))'
                  : 'drop-shadow(0 0 6px rgba(61,242,182,0.8))',
              }}
            />
            {/* Hub Center */}
            <circle cx={cx} cy={cy} r="9" fill="#131824" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx={cx} cy={cy} r="4" fill={isAbnormal ? '#F4506A' : '#3DF2B6'} />
          </g>

          {/* Scale Labels */}
          <text x="50" y="210" fill="#64748B" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">
            −10%
          </text>
          <text x="200" y="42" fill="#64748B" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">
            0% (Fair)
          </text>
          <text x="350" y="210" fill="#64748B" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">
            +10%
          </text>
        </svg>

        {/* Center Monospace Readout with Delta Flash Animation */}
        <div className="absolute top-[105px] flex flex-col items-center select-none pointer-events-none">
          <div
            className={`text-5xl md:text-6xl font-mono font-bold tracking-tight transition-all duration-300 ${devColor} ${
              hasChanged ? 'scale-105 opacity-90' : 'scale-100 opacity-100'
            }`}
          >
            {deviation >= 0 ? '+' : ''}
            {deviation.toFixed(2)}%
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mt-1">
            Peg Deviation Spread
          </span>
        </div>
      </div>

      {/* Sub-readouts Row (Institutional metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-3 border-t border-panel-border text-center">
        {/* 1. DEX Price */}
        <div className="bg-obsidian/60 border border-panel-border/60 rounded-lg p-2.5">
          <div className="text-[10px] font-mono uppercase text-slate-400">DEX Price (Aerodrome)</div>
          <div className="text-base font-mono font-semibold text-white mt-0.5">
            ${status.dexPrice.toFixed(2)}
          </div>
        </div>

        {/* 2. Fair Value Benchmark */}
        <div className="bg-obsidian/60 border border-panel-border/60 rounded-lg p-2.5">
          <div className="text-[10px] font-mono uppercase text-slate-400">Fair Value (Chainlink)</div>
          <div className="text-base font-mono font-semibold text-slate-200 mt-0.5">
            ${status.fairValue.toFixed(2)}
          </div>
        </div>

        {/* 3. Oracle Staleness */}
        <div className="bg-obsidian/60 border border-panel-border/60 rounded-lg p-2.5">
          <div className="text-[10px] font-mono uppercase text-slate-400">Oracle Staleness</div>
          <div
            className={`text-base font-mono font-semibold mt-0.5 ${
              status.feedFrozen ? 'text-crimson' : 'text-slate-200'
            }`}
          >
            {stalenessHours > 0 ? `${stalenessHours}h ago` : 'Real-time'}
            {status.feedFrozen && <span className="text-[10px] ml-1 font-normal">(Frozen)</span>}
          </div>
        </div>

        {/* 4. Active Threshold */}
        <div className="bg-obsidian/60 border border-panel-border/60 rounded-lg p-2.5">
          <div className="text-[10px] font-mono uppercase text-slate-400">Active Threshold</div>
          <div className="text-base font-mono font-semibold text-amber-300 mt-0.5">
            ±{threshold.toFixed(1)}% <span className="text-[10px] text-slate-400">({status.regime})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
