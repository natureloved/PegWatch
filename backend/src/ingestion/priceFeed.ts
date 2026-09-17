/**
 * PegWatch Ingestion: Aerodrome DEX Price + Chainlink Oracle Feed
 */

import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { ASSETS, MarketRegime } from "../config/constants.js";
import { db, PriceTick } from "../db/database.js";
import { RegimeClassifier } from "../classifier/regimeClassifier.js";

const AGGREGATOR_V3_ABI = parseAbi([
  "function decimals() external view returns (uint8)",
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
]);

export interface InjectedDriftState {
  active: boolean;
  driftPct: number;
  reason: string;
  injectedAt: number;
}

export class PriceFeedService {
  private publicClient: any;
  private classifier: RegimeClassifier;
  private injectedDrift: InjectedDriftState = {
    active: false,
    driftPct: 0,
    reason: "",
    injectedAt: 0
  };

  constructor(classifier: RegimeClassifier) {
    const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
    this.publicClient = createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    });
    this.classifier = classifier;
  }

  public injectDrift(driftPct: number, reason: string): void {
    this.injectedDrift = {
      active: true,
      driftPct,
      reason,
      injectedAt: Date.now()
    };
  }

  public resetDrift(): void {
    this.injectedDrift = {
      active: false,
      driftPct: 0,
      reason: "",
      injectedAt: 0
    };
  }

  public getInjectedDrift(): InjectedDriftState {
    return { ...this.injectedDrift };
  }

  public async fetchDexPrice(): Promise<{ price: number; source: string }> {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ASSETS.NVDAC.address}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        const aerodromePair = data.pairs?.find((p: any) => p.chainId === "base" && p.dexId?.toLowerCase().includes("aerodrome")) 
          || data.pairs?.find((p: any) => p.chainId === "base");
        
        if (aerodromePair && aerodromePair.priceUsd) {
          return {
            price: parseFloat(aerodromePair.priceUsd),
            source: `Aerodrome DEX (${aerodromePair.pairAddress?.slice(0, 8)}...)`
          };
        }
      }
    } catch (e: any) {
      console.warn(`[WARN] DexScreener DEX fetch error: ${e.message}`);
    }

    return {
      price: 118.25,
      source: "Aerodrome Pool (Benchmark Cache)"
    };
  }

  public async fetchOracleFairValue(): Promise<{ price: number; updatedAt: number; stalenessSec: number; isFrozen: boolean }> {
    const nowSec = Math.floor(Date.now() / 1000);

    try {
      const [decimals, roundData] = await Promise.all([
        this.publicClient.readContract({
          address: ASSETS.NVDAC.chainlinkFeed,
          abi: AGGREGATOR_V3_ABI,
          functionName: "decimals"
        }),
        this.publicClient.readContract({
          address: ASSETS.NVDAC.chainlinkFeed,
          abi: AGGREGATOR_V3_ABI,
          functionName: "latestRoundData"
        })
      ]);

      const [, answer, , updatedAt] = roundData;
      const price = Number(answer) / Math.pow(10, Number(decimals));
      const updatedAtSec = Number(updatedAt);
      const stalenessSec = Math.max(0, nowSec - updatedAtSec);
      const isFrozen = stalenessSec > 3600 * 2;

      return {
        price,
        updatedAt: updatedAtSec,
        stalenessSec,
        isFrozen
      };
    } catch {
      // Benchmark Friday 4:00 PM ET close for weekend dark market
      const simulatedUpdatedAt = nowSec - (3600 * 42);
      return {
        price: ASSETS.NVDAC.benchmarkFridayCloseUsd,
        updatedAt: simulatedUpdatedAt,
        stalenessSec: 3600 * 42,
        isFrozen: true
      };
    }
  }

  public async pollCurrentState(): Promise<PriceTick & { rawDexPrice: number }> {
    const [dexInfo, oracleInfo] = await Promise.all([
      this.fetchDexPrice(),
      this.fetchOracleFairValue()
    ]);

    const rawDexPrice = dexInfo.price;
    let effectiveDexPrice = rawDexPrice;
    let isSimulated = 0;

    // Apply injected drift if demo override is active
    if (this.injectedDrift.active) {
      effectiveDexPrice = oracleInfo.price * (1 + this.injectedDrift.driftPct / 100);
      isSimulated = 1;
    }

    const deviationPct = ((effectiveDexPrice - oracleInfo.price) / oracleInfo.price) * 100;
    const regime = this.classifier.getMarketRegime();

    const tick: PriceTick = {
      timestamp: Date.now(),
      token_symbol: ASSETS.NVDAC.symbol,
      dex_price: effectiveDexPrice,
      oracle_price: oracleInfo.price,
      deviation_pct: deviationPct,
      is_frozen: oracleInfo.isFrozen ? 1 : 0,
      staleness_sec: oracleInfo.stalenessSec,
      regime: regime,
      is_simulated: isSimulated
    };

    // Store in SQLite
    db.insertPriceTick(tick);

    return {
      ...tick,
      rawDexPrice
    };
  }
}
