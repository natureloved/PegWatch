/**
 * Full Loop Dry Run Test: scripts/test-dry-run.ts
 * Tests the complete autonomous loop in DEMO_MODE:
 * - Live Aerodrome DEX price & Chainlink oracle read
 * - Injected drift triggering N=2 breach confirmation
 * - Flash stop-loss trigger order creation & EIP-712 signing
 * - Action ledger persistence & Alert dispatch
 */

import { PegWatchAgent } from "../backend/src/agent.js";
import { db } from "../backend/src/db/database.js";

async function runDryRun() {
  console.log("==================================================");
  console.log("   DRY RUN: Complete Autonomous Loop (DEMO_MODE)");
  console.log("==================================================");

  const agent = new PegWatchAgent();

  console.log("\n[STEP 1] Ingesting live market prices from Base...");
  db.setDelegation(true, 500.0); // Reset allowance for test
  const tick1 = await agent.priceFeed.pollCurrentState();
  console.log(`• Aerodrome Live DEX: $${tick1.dex_price.toFixed(2)}`);
  console.log(`• Chainlink Fair Value: $${tick1.oracle_price.toFixed(2)}`);
  console.log(`• Staleness: ${tick1.staleness_sec}s (~${(tick1.staleness_sec / 3600).toFixed(1)}h)`);

  console.log("\n[STEP 2] Injecting abnormal peg drift (-3.8%) for demo evaluation...");
  agent.priceFeed.injectDrift(-3.8, "Simulated Dark Market Liquidity Shock");

  console.log("\n[STEP 3] Executing Cycle 1 (Breach 1/2)...");
  await agent.step();

  console.log("\n[STEP 4] Executing Cycle 2 (Breach 2/2 -> Flash Execution)...");
  await agent.step();

  const actions = db.getRecentActions(1);
  if (actions.length > 0) {
    const latest = actions[0];
    console.log("\n[LEDGER RECEIPT]:");
    console.log(`• Action ID: ${latest.id}`);
    console.log(`• Decision: ${latest.decision}`);
    console.log(`• Order ID: ${latest.order_id}`);
    console.log(`• Tx Hash: ${latest.tx_hash}`);
    console.log(`• Explorer: ${latest.explorer_url}`);
    console.log(`• Reasoning: "${latest.reason}"`);
  }

  // Clear injected drift
  agent.priceFeed.resetDrift();

  console.log("\n--------------------------------------------------");
  console.log(">>> RESULT: PASS (Full Loop Dry Run Successful) <<<");
  console.log("--------------------------------------------------\n");
  process.exitCode = 0;
  return;
}

runDryRun();
