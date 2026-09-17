import React, { useState } from 'react';
import { Sliders, RotateCcw, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface DemoControlsProps {
  isSimulated: boolean;
  onInjectDrift: (driftPct: number) => void;
  onArmNow: () => void;
  onReset: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  isSimulated,
  onInjectDrift,
  onArmNow,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sliderVal, setSliderVal] = useState(-5.3);

  const presets = [
    { label: 'Normal (+0.4%)', val: 0.4 },
    { label: 'Weekend Gap (-3.2%)', val: -3.2 },
    { label: 'Breach (-5.4%)', val: -5.4 },
    { label: 'Flash Crash (-7.8%)', val: -7.8 },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      {/* Collapsed Bar / Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-panel border border-slate-700 hover:border-slate-500 shadow-xl cursor-pointer text-xs font-mono select-none"
      >
        <Sliders size={14} className="text-violet-400" />
        <span className="text-white font-semibold">Demo Controls</span>
        {isSimulated && (
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
            Active
          </span>
        )}
        <span className="text-slate-400 ml-auto">
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </span>
      </div>

      {/* Expanded Drawer */}
      {isOpen && (
        <div className="mt-2 p-4 rounded-xl bg-panel border border-slate-700 shadow-2xl space-y-3.5 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 border-b border-panel-border text-[11px] font-mono">
            <span className="text-slate-400 uppercase">Simulated Market Drift</span>
            <span className="text-slate-500">Demo Rehearsal</span>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setSliderVal(p.val);
                  onInjectDrift(p.val);
                }}
                className="px-2.5 py-1.5 rounded bg-obsidian border border-panel-border hover:border-slate-600 text-[11px] font-mono text-slate-300 hover:text-white transition-colors text-left"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Deviation Offset:</span>
              <span className={`font-bold ${Math.abs(sliderVal) > 5 ? 'text-crimson' : 'text-mint'}`}>
                {sliderVal >= 0 ? '+' : ''}{sliderVal.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-10.0"
              max="10.0"
              step="0.1"
              value={sliderVal}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSliderVal(val);
                onInjectDrift(val);
              }}
              className="w-full accent-mint bg-obsidian h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Arm Now (Escalation Trigger) & Reset */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onArmNow}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-crimson-muted border border-crimson/40 text-crimson hover:bg-crimson hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer"
              title="Choreograph full NORMAL -> ARMED -> ABNORMAL -> EXECUTED demo flow"
            >
              <Sparkles size={13} />
              <span>Arm Now (Demo)</span>
            </button>

            <button
              onClick={onReset}
              className="p-2 rounded-lg bg-panel-elevated border border-panel-border text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Revert to genuine live feed"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
