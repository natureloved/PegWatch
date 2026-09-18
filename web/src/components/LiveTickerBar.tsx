import React from 'react';
import { Activity, Clock } from 'lucide-react';

interface TickerAsset {
  symbol: string;
  name: string;
  dexPrice: number;
  oraclePrice: number;
  deviationPct: number;
  status: 'SAFE' | 'MONITORING' | 'BREACH';
  volume24h: string;
  isPrimary?: boolean;
}

interface LiveTickerBarProps {
  primaryDeviation?: number;
  primaryDexPrice?: number;
  onSelectAsset?: (symbol: string) => void;
}

export const LiveTickerBar: React.FC<LiveTickerBarProps> = ({
  primaryDeviation = -3.71,
  primaryDexPrice = 207.99,
  onSelectAsset: _onSelectAsset,
}) => {
  const assets: TickerAsset[] = [
    {
      symbol: 'NVDAc',
      name: 'NVIDIA Tokenized',
      dexPrice: primaryDexPrice,
      oraclePrice: 216.00,
      deviationPct: primaryDeviation,
      status: Math.abs(primaryDeviation) > 5.0 ? 'BREACH' : Math.abs(primaryDeviation) > 3.0 ? 'MONITORING' : 'SAFE',
      volume24h: '$3.4M',
      isPrimary: true,
    },
    {
      symbol: 'AAPLc',
      name: 'Apple Tokenized',
      dexPrice: 184.20,
      oraclePrice: 184.50,
      deviationPct: -0.16,
      status: 'SAFE',
      volume24h: '$1.9M',
    },
    {
      symbol: 'TSLAc',
      name: 'Tesla Tokenized',
      dexPrice: 248.50,
      oraclePrice: 247.90,
      deviationPct: 0.24,
      status: 'SAFE',
      volume24h: '$4.2M',
    },
    {
      symbol: 'COINc',
      name: 'Coinbase Tokenized',
      dexPrice: 262.10,
      oraclePrice: 263.00,
      deviationPct: -0.34,
      status: 'SAFE',
      volume24h: '$2.8M',
    },
    {
      symbol: 'GOOGLc',
      name: 'Google Tokenized',
      dexPrice: 172.40,
      oraclePrice: 172.80,
      deviationPct: -0.23,
      status: 'SAFE',
      volume24h: '$1.1M',
    },
  ];

  return (
    <div className="w-full bg-obsidian/90 border-b border-panel-border px-4 py-2 font-mono text-xs backdrop-blur-md overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 min-w-max">
        {/* Left Indicator: 24/7 DEX Pulse */}
        <div className="flex items-center gap-2 pr-4 border-r border-panel-border text-slate-400">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-mint animate-ping absolute opacity-75" />
            <span className="w-2 h-2 rounded-full bg-mint" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Base DEX Stream (24/7)
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock size={10} /> Chainlink Frozen 85h
          </span>
        </div>

        {/* Ticker Assets Strip */}
        <div className="flex items-center gap-4">
          {assets.map((asset) => {
            const isNegative = asset.deviationPct < 0;
            const badgeColor =
              asset.status === 'BREACH'
                ? 'bg-crimson-muted text-crimson border-crimson/30'
                : asset.status === 'MONITORING'
                ? 'bg-amber-muted text-amber border-amber/30'
                : 'bg-mint-muted text-mint border-mint/30';

            return (
              <div
                key={asset.symbol}
                className={`flex items-center gap-2.5 px-3 py-1 rounded-lg border transition-all ${
                  asset.isPrimary
                    ? 'bg-panel-elevated/80 border-mint/30 shadow-[0_0_12px_rgba(61,242,182,0.1)]'
                    : 'bg-panel/50 border-panel-border/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white tracking-wide">
                    {asset.symbol}
                  </span>
                  {asset.isPrimary && (
                    <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  )}
                </div>

                <span className="text-slate-300 font-semibold">
                  ${asset.dexPrice.toFixed(2)}
                </span>

                <span
                  className={`text-[11px] ${
                    isNegative ? 'text-crimson' : 'text-mint'
                  }`}
                >
                  {asset.deviationPct > 0 ? '+' : ''}
                  {asset.deviationPct.toFixed(2)}%
                </span>

                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border ${badgeColor}`}
                >
                  {asset.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2 pl-4 border-l border-panel-border text-[11px] text-slate-400">
          <Activity size={12} className="text-mint" />
          <span>Managed Orders: <strong className="text-white">Active</strong></span>
        </div>
      </div>
    </div>
  );
};
