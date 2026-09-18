/**
 * PegWatch Protocol Constants & Asset Configurations
 */

export const BASE_CHAIN_ID = 8453;

// Assets on Base
export const ASSETS = {
  NVDAC: {
    symbol: "NVDAc",
    name: "NVIDIA (Coinbase Tokenized Equity)",
    address: "0xb20000000000000000000078ee7ce2fE4908108C" as `0x${string}`,
    decimals: 8, // Confirmed 8 decimals on Base via Definitive Flash /v1/search
    // Chainlink Reference Price feed for NVDAc on Base
    chainlinkFeed: (process.env.CHAINLINK_NVDA_FEED_ADDRESS || "0xa50ba344175782782b545d6541fce2cfa0c1f6b1") as `0x${string}`,
    // Benchmark Friday Close price when oracle freezes
    benchmarkFridayCloseUsd: 118.50,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
    decimals: 6,
  }
};

// Default Risk Parameters
export const DEFAULT_RISK_CONFIG = {
  // Deviation thresholds in %
  weekdayThresholdPct: 1.2,
  overnightThresholdPct: 2.0,
  weekendThresholdPct: 3.0,
  // Consecutive breaches required to confirm abnormal drift
  consecutiveBreachesRequired: 2,
  // Execution limits
  maxNotionalPerActionUsd: 50.0,
  cooldownSeconds: 300, // 5 minutes cooldown between actions
  dailyCapNotionalUsd: 500.0,
  // Order settings
  defaultSellQty: 0.05, // ~ $6 to $10 de-risk order size
  maxSlippagePct: 1.0,
};

// Market Regimes
export enum MarketRegime {
  WEEKDAY_REGULAR = "WEEKDAY_REGULAR",       // Mon-Fri 9:30 AM - 4:00 PM ET
  OVERNIGHT = "OVERNIGHT",                   // Mon-Thu 4:00 PM - 9:30 AM ET
  WEEKEND_DARK_MARKET = "WEEKEND_DARK_MARKET" // Fri 4:00 PM - Mon 9:30 AM ET (65.5 hours)
}

export const FLASH_API_BASE_URL = "https://flash.definitive.fi/v1";
export const FLASH_PUBLIC_DEV_KEY = "dpka_513a2bd7_57a2_46d2_927b_2a3857fe271b";
export const FLASH_MCP_PACKAGE = "@definitive-fi/flash-mcp";

// Flash Integrator Monetization (Optional fee hook)
export const FLASH_INTEGRATOR_CONFIG = {
  flashIntegratorFeeBps: 10, // 0.10% protocol fee
  feeRecipient: "0x0113c233c1628d09B5927ea948197793d56B0233" as `0x${string}`,
};

export const BANKR_LLM_GATEWAY_URL = "https://llm.bankr.bot/v1/chat/completions";
