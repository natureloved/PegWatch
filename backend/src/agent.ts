/**
 * PegWatch Autonomous Risk Agent Core Loop
 */

import { RegimeClassifier } from "./classifier/regimeClassifier.js";
import { PriceFeedService } from "./ingestion/priceFeed.js";
import { RiskPolicyEngine } from "./execution/riskPolicy.js";
import { AgentWalletSigner } from "./execution/walletSigner.js";
import { DefinitiveFlashClient } from "./execution/flashClient.js";
import { BankrReasoner } from "./reasoning/bankrReasoner.js";
import { AlertNotifier } from "./alerts/notifier.js";
import { db, AgentAction } from "./db/database.js";
import { ASSETS } from "./config/constants.js";
import * as dotenv from "dotenv";

dotenv.config();

export class PegWatchAgent {
  public classifier: RegimeClassifier;
  public priceFeed: PriceFeedService;
  public policy: RiskPolicyEngine;
  public signer: AgentWalletSigner;
  public flashClient: DefinitiveFlashClient;
  public reasoner: BankrReasoner;
  public notifier: AlertNotifier;

  private isRunning: boolean = false;
  private pollIntervalMs: number = 60000;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.classifier = new RegimeClassifier();
    this.priceFeed = new PriceFeedService(this.classifier);
    this.policy = new RiskPolicyEngine();
    this.signer = new AgentWalletSigner();
    this.flashClient = new DefinitiveFlashClient(this.signer);
    this.reasoner = new BankrReasoner();
    this.notifier = new AlertNotifier();

    const intervalSec = parseInt(process.env.POLL_INTERVAL_SECONDS || "10", 10);
    this.pollIntervalMs = Math.max(5000, intervalSec * 1000);
  }

  /**
   * Execute one complete monitoring & decision cycle
   */
  public async step(): Promise<void> {
    try {
      // 1. Ingest price and calculate deviation
      const tick = await this.priceFeed.pollCurrentState();
      
      // 2. Classify drift
      const classification = this.classifier.classify(tick.deviation_pct);

      console.log(`[AGENT TICK] ${new Date(tick.timestamp).toLocaleTimeString()} | DEX: $${tick.dex_price.toFixed(2)} | Oracle: $${tick.oracle_price.toFixed(2)} | Dev: ${tick.deviation_pct >= 0 ? "+" : ""}${tick.deviation_pct.toFixed(2)}% | Regime: ${classification.regime} | Class: ${classification.classification}`);

      // 3. Autonomous decision
      if (classification.shouldExecute) {
        console.log(`\n🚨 [AGENT TRIGGER] Abnormal drift confirmed! Evaluating risk policy...`);
        
        // Check safety guardrails and delegation
        const policyCheck = this.policy.checkExecution(tick.dex_price);

        if (!policyCheck.allowed) {
          console.warn(`[AGENT BLOCKED] ${policyCheck.reason}`);
          
          const blockedAction: AgentAction = {
            id: `act_blocked_${Date.now()}`,
            timestamp: Date.now(),
            token_symbol: ASSETS.NVDAC.symbol,
            action_type: "STOP_LOSS_BLOCKED",
            deviation_pct: tick.deviation_pct,
            regime: classification.regime,
            classification: classification.classification,
            decision: "BLOCKED_BY_POLICY",
            reason: policyCheck.reason || "Blocked by risk policy",
            order_id: null,
            tx_hash: null,
            explorer_url: null,
            status: "BLOCKED",
            qty: 0,
            notional_usd: 0,
            is_simulated: tick.is_simulated
          };

          db.insertAction(blockedAction);
          return;
        }

        // Policy approved execution: Call Definitive Flash
        console.log(`[AGENT EXECUTION] Initiating Flash de-risk order for ${policyCheck.qtyToSell} ${ASSETS.NVDAC.symbol} ($${policyCheck.notionalUsd})...`);
        
        // Stop-loss trigger 1% below current DEX price
        const triggerPrice = tick.dex_price * 0.99;
        const execResult = await this.flashClient.executeDeRiskOrder(
          policyCheck.qtyToSell,
          triggerPrice,
          "stop-loss",
          tick.is_simulated === 1
        );

        // Plain-English reasoning via Bankr LLM Gateway
        const reasoning = await this.reasoner.generateReasoning({
          tokenSymbol: ASSETS.NVDAC.symbol,
          dexPrice: tick.dex_price,
          oraclePrice: tick.oracle_price,
          deviationPct: tick.deviation_pct,
          stalenessSec: tick.staleness_sec,
          regime: classification.regime,
          actionType: "Stop-Loss Order",
          qty: execResult.targetQty,
          notionalUsd: execResult.notionalUsd
        });

        // Record in ledger
        const action: AgentAction = {
          id: `act_${Date.now()}`,
          timestamp: Date.now(),
          token_symbol: ASSETS.NVDAC.symbol,
          action_type: "STOP_LOSS_DE_RISK",
          deviation_pct: tick.deviation_pct,
          regime: classification.regime,
          classification: classification.classification,
          decision: "EXECUTED",
          reason: reasoning,
          order_id: execResult.orderId,
          tx_hash: execResult.txHash,
          explorer_url: execResult.explorerUrl,
          status: execResult.status,
          qty: execResult.targetQty,
          notional_usd: execResult.notionalUsd,
          is_simulated: execResult.isSimulated ? 1 : 0
        };

        db.insertAction(action);
        this.policy.recordAction(execResult.notionalUsd);
        await this.notifier.sendAlert(action);

        console.log(`[AGENT SUCCESS] Action recorded in ledger. Tx: ${execResult.txHash}`);
      }
    } catch (err: any) {
      console.error(`[AGENT ERROR] Step execution failed: ${err.message || err}`);
    }
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[AGENT] PegWatch autonomous agent started. Polling every ${this.pollIntervalMs / 1000}s...`);

    // Execute immediately, then loop
    this.step();
    this.timer = setInterval(() => this.step(), this.pollIntervalMs);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log("[AGENT] PegWatch agent stopped.");
  }
}

// Standalone runner when launched directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  const agent = new PegWatchAgent();
  agent.start();
}
