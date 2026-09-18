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
  const needleAngle = 90 - clampedDev * 9;

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
  let statusBadge = 'Safe Operating Band';
  let badgeClasses = 'bg-mint-muted text-mint border-mint/40';

  if (absDev > threshold) {
    devColor = 'text-crimson';
    statusBadge = 'Abnormal Drift Triggered';
    badgeClasses = 'bg-crimson-muted text-crimson border-crimson/40';
  } else if (absDev > threshold * 0.6) {
    devColor = 'text-amber';
    statusBadge = 'Breach Confirming (1/2)';
    badgeClasses = 'bg-amber-muted text-amber border-amber/40';
  }

  // SVG Geometry for semicircular gauge
  const cx = 200;
  const cy = 185;
  const radius = 135;

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

  // Danger arcs
  const leftDangerEnd = 90 - (threshold / 10) * 90;
  const rightDangerStart = 90 + (threshold / 10) * 90;

  return (
    <div
      className={`relative w-full bg-panel rounded-2xl p-6 border transition-all duration-500 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${borderClasses}`}
    >
      {/* Ambience glow behind gauge */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700 ${
          isAbnormal ? 'bg-crimson' : isArmed ? 'bg-amber' : 'bg-mint'
        }`}
      />

      {/* Header bar within gauge card */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            Real-Time Peg Deviation
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-obsidian border border-slate-700 text-slate-300">
            NVDAc / USDC
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${badgeClasses}`}
          >
            {isAbnormal ? (
              <ShieldAlert size={13} className="text-crimson" />
            ) : isArmed ? (
              <AlertCircle size={13} className="text-amber animate-pulse" />
            ) : (
              <CheckCircle2 size={13} className="text-mint" />
            )}
            <span>{statusBadge}</span>
          </span>
        </div>
      </div>

      {/* Main Gauge Graphic */}
      <div className="relative flex flex-col items-center justify-center my-2 select-none">
        <svg
          viewBox="0 0 400 230"
          className="w-full max-w-[460px] overflow-visible drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
        >
          <defs>
            <linearGradient id="safeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3DF2B6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3DF2B6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="dangerLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F4506A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F5B93D" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="dangerRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5B93D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F4506A" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowMint" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={describeArc(cx, cy, radius, 0, 180)}
            fill="none"
            stroke="#1A2234"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Left Breach Zone Arc */}
          <path
            d={describeArc(cx, cy, radius, 0, leftDangerEnd)}
            fill="none"
            stroke="url(#dangerLeft)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Safe Band Zone Arc */}
          <path
            d={describeArc(cx, cy, radius, leftDangerEnd, rightDangerStart)}
            fill="none"
            stroke="url(#safeGradient)"
            strokeWidth="14"
          />

          {/* Right Breach Zone Arc */}
          <path
            d={describeArc(cx, cy, radius, rightDangerStart, 180)}
            fill="none"
            stroke="url(#dangerRight)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Subtle tick markers every 2.5% */}
          {[-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10].map((tick) => {
            const angle = 90 - tick * 9;
            const ptInner = polarToCartesian(cx, cy, radius - 12, angle);
            const ptOuter = polarToCartesian(cx, cy, radius + 12, angle);
            const isZero = tick === 0;
            const isThreshold = Math.abs(tick) === threshold;

            return (
              <g key={tick}>
                <line
                  x1={ptInner.x}
                  y1={ptInner.y}
                  x2={ptOuter.x}
                  y2={ptOuter.y}
                  stroke={isZero ? '#FFFFFF' : isThreshold ? '#F5B93D' : '#334155'}
                  strokeWidth={isZero || isThreshold ? '2' : '1'}
                  strokeDasharray={isThreshold ? '2 2' : 'none'}
                />
              </g>
            );
          })}

          {/* Threshold Boundary Dashed Markers */}
          <line
            x1={polarToCartesian(cx, cy, radius - 18, leftDangerEnd).x}
            y1={polarToCartesian(cx, cy, radius - 18, leftDangerEnd).y}
            x2={polarToCartesian(cx, cy, radius + 18, leftDangerEnd).x}
            y2={polarToCartesian(cx, cy, radius + 18, leftDangerEnd).y}
            stroke="#F4506A"
            strokeWidth="2.5"
          />
          <line
            x1={polarToCartesian(cx, cy, radius - 18, rightDangerStart).x}
            y1={polarToCartesian(cx, cy, radius - 18, rightDangerStart).y}
            x2={polarToCartesian(cx, cy, radius + 18, rightDangerStart).x}
            y2={polarToCartesian(cx, cy, radius + 18, rightDangerStart).y}
            stroke="#F4506A"
            strokeWidth="2.5"
          />

          {/* Scale Labels */}
          <text x="35" y="215" fill="#64748B" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600">
            -10%
          </text>
          <text x="175" y="42" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600">
            0% (Fair)
          </text>
          <text x="340" y="215" fill="#64748B" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600">
            +10%
          </text>

          {/* Animated Needle */}
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${needleAngle}deg)`,
              transition: 'transform 700ms cubic-bezier(0.34, 1.45, 0.64, 1)',
            }}
          >
            {/* Needle Shaft */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius + 10}
              stroke={absDev > threshold ? '#F4506A' : absDev > threshold * 0.6 ? '#F5B93D' : '#3DF2B6'}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#glowMint)"
            />
            {/* Needle Arrow Tip */}
            <circle
              cx={cx}
              cy={cy - radius + 12}
              r="4.5"
              fill={absDev > threshold ? '#F4506A' : absDev > threshold * 0.6 ? '#F5B93D' : '#3DF2B6'}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </g>

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r="12" fill="#0B0E14" stroke="#334155" strokeWidth="2.5" />
          <circle
            cx={cx}
            cy={cy}
            r="6"
            fill={absDev > threshold ? '#F4506A' : absDev > threshold * 0.6 ? '#F5B93D' : '#3DF2B6'}
          />
        </svg>

        {/* Center Monospace Readout with Live Delta Flash */}
        <div className="absolute top-[82px] flex flex-col items-center justify-center text-center pointer-events-none">
          <div
            className={`text-5xl font-mono font-extrabold tracking-tight transition-all duration-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] ${devColor} ${
              hasChanged ? 'scale-105 opacity-90' : 'scale-100 opacity-100'
            }`}
          >
            {deviation >= 0 ? '+' : ''}
            {deviation.toFixed(2)}%
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1 font-semibold">
            Peg Deviation Spread
          </span>

          {/* Breach confirmation step indicator when armed */}
          {isArmed && (
            <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-muted border border-amber/40 text-[10px] font-mono text-amber animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              <span>Breach 1/2 Confirmed · Evaluating Block 2</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Telemetry Sub-Readouts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-panel-border font-mono text-xs relative z-10">
        {/* DEX Price */}
        <div className="p-3 rounded-xl bg-obsidian border border-panel-border hover:border-slate-700 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-1">
            DEX Price (Aerodrome)
          </span>
          <span className="text-base font-bold text-white tracking-tight">
            ${status.dexPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-mint block mt-0.5">● Slipstream V2</span>
        </div>

        {/* Fair Value Benchmark */}
        <div className="p-3 rounded-xl bg-obsidian border border-panel-border hover:border-slate-700 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-1">
            Fair Value (Chainlink)
          </span>
          <span className="text-base font-bold text-white tracking-tight">
            ${status.fairValue.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Friday Close Benchmark</span>
        </div>

        {/* Oracle Staleness */}
        <div className="p-3 rounded-xl bg-obsidian border border-panel-border hover:border-slate-700 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-1">
            Oracle Staleness
          </span>
          <span className="text-base font-bold text-violet tracking-tight">
            85h ago (Frozen)
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Dark Market Active</span>
        </div>

        {/* Active Threshold */}
        <div className="p-3 rounded-xl bg-obsidian border border-panel-border hover:border-slate-700 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-1">
            Active Threshold
          </span>
          <span className="text-base font-bold text-amber tracking-tight">
            ±{threshold.toFixed(1)}% ({status.regime})
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Flash Trigger Limit</span>
        </div>
      </div>
    </div>
  );
};
