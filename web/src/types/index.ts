export type Regime = 'WEEKDAY_OPEN' | 'OVERNIGHT' | 'WEEKEND' | 'HOLIDAY';

export interface Status {
  regime: Regime;
  feedFrozen: boolean;          // Chainlink updatedAt stale > 24h
  feedUpdatedAt: number;        // unix seconds
  dexPrice: number;             // Aerodrome live price
  fairValue: number;            // Chainlink/last-close reference
  deviationPct: number;         // (dex − fair)/fair × 100
  thresholdPct: number;         // active threshold for current regime
  classification: 'NORMAL' | 'ABNORMAL' | 'ARMED'; // ARMED = 1 of N breaches
  breaches: number;             // consecutive breaches so far
  requiredBreaches: number;
}

export interface Action {
  id: string;
  ts: number;
  deviationPct: number;
  regime: Regime;
  classification: 'ABNORMAL';
  decision: string;             // e.g. "De-risk 0.05 NVDAc → USDC"
  reason: string;               // plain-English agent rationale (LLM)
  orderId?: string;             // Flash order id
  txHash?: string;              // 0x… — link to Basescan
  status: 'EXECUTED' | 'PENDING' | 'FAILED' | 'HALTED_LIMITS';
}

export interface Policy {
  maxActionNotionalUsd: number;
  maxDeviationPct: number;
  weekendDeviationPct: number;
  cooldownMinutes: number;
  delegated: boolean;           // Dynamic delegation active?
  delegatedWallet: string;      // 0x…
  revocable: true;
}

export interface DeviationPoint {
  ts: number;
  timeLabel: string;
  deviationPct: number;
  dexPrice: number;
  fairValue: number;
  isWeekend: boolean;
  action?: Action;
}
