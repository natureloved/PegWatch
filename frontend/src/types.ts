export interface TargetAsset {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainlinkFeed: string;
  benchmarkFridayCloseUsd: number;
}

export interface PriceTick {
  id?: number;
  timestamp: number;
  token_symbol: string;
  dex_price: number;
  oracle_price: number;
  deviation_pct: number;
  is_frozen: number;
  staleness_sec: number;
  regime: string;
  is_simulated: number;
}

export interface AgentAction {
  id: string;
  timestamp: number;
  token_symbol: string;
  action_type: string;
  deviation_pct: number;
  regime: string;
  classification: string;
  decision: string;
  reason: string;
  order_id: string | null;
  tx_hash: string | null;
  explorer_url: string | null;
  status: string;
  qty: number;
  notional_usd: number;
  is_simulated: number;
}

export interface DelegationState {
  walletAddress: string;
  isDelegated: boolean;
  maxAllowanceUsd: number;
  remainingAllowanceUsd: number;
  updatedAt: number;
}

export interface InjectedDrift {
  active: boolean;
  driftPct: number;
  reason: string;
  injectedAt: number;
}

export interface RiskConfig {
  weekdayThresholdPct: number;
  overnightThresholdPct: number;
  weekendThresholdPct: number;
  consecutiveBreachesRequired: number;
  maxNotionalPerActionUsd: number;
  cooldownSeconds: number;
  dailyCapNotionalUsd: number;
  defaultSellQty: number;
  maxSlippagePct: number;
}

export interface StatusResponse {
  success: boolean;
  timestamp: number;
  targetAsset: TargetAsset;
  regime: string;
  thresholdPct: number;
  latestTick: PriceTick | null;
  delegation: DelegationState;
  agentSignerAddress: string;
  injectedDrift: InjectedDrift;
  config: RiskConfig;
}
