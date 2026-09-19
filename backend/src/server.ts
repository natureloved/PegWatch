/**
 * PegWatch REST API Server
 */

import express from "express";
import cors from "cors";
import { PegWatchAgent } from "./agent.js";
import { db } from "./db/database.js";
import { ASSETS, DEFAULT_RISK_CONFIG } from "./config/constants.js";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3001", 10);

app.use(cors());
app.use(express.json());

// Initialize autonomous agent
const agent = new PegWatchAgent();
agent.start();

/**
 * GET /api/status: Current health, market state, prices, and agent status
 */
app.get("/api/status", async (req, res) => {
  try {
    const ticks = db.getRecentTicks(1);
    const latestTick = ticks.length > 0 ? ticks[ticks.length - 1] : null;
    const delegation = db.getDelegation();
    const injected = agent.priceFeed.getInjectedDrift();
    const currentRegime = agent.classifier.getMarketRegime();
    const activeThreshold = agent.classifier.getThreshold(currentRegime);

    res.json({
      success: true,
      timestamp: Date.now(),
      targetAsset: ASSETS.NVDAC,
      regime: currentRegime,
      thresholdPct: activeThreshold,
      latestTick,
      delegation: {
        walletAddress: delegation.wallet_address,
        isDelegated: delegation.is_delegated === 1,
        maxAllowanceUsd: delegation.max_allowance_usd,
        remainingAllowanceUsd: delegation.remaining_allowance_usd,
        updatedAt: delegation.updated_at
      },
      agentSignerAddress: agent.signer.address,
      injectedDrift: injected,
      config: DEFAULT_RISK_CONFIG
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/history: Time series price ticks for the dashboard chart
 */
app.get("/api/history", (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string || "60", 10);
    const ticks = db.getRecentTicks(limit);
    res.json({ success: true, count: ticks.length, ticks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/actions: Action ledger stream with rationale and receipts
 */
app.get("/api/actions", (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string || "50", 10);
    const actions = db.getRecentActions(limit);
    res.json({ success: true, count: actions.length, actions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/demo/inject-drift & /api/agent/inject-drift: Inject simulated drift for live hackathon demo
 */
app.post(["/api/demo/inject-drift", "/api/agent/inject-drift"], async (req, res) => {
  try {
    const { driftPct, reason } = req.body;
    if (typeof driftPct !== "number") {
      res.status(400).json({ success: false, error: "driftPct must be a number" });
      return;
    }

    agent.priceFeed.injectDrift(driftPct, reason || "Hackathon Demo Injection");
    console.log(`[DEMO] Injected drift: ${driftPct}% (${reason || "Demo"})`);

    // Trigger immediate agent step for responsive demonstration
    await agent.step();

    res.json({
      success: true,
      message: `Injected simulated drift of ${driftPct}% against live oracle`,
      injectedDrift: agent.priceFeed.getInjectedDrift()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/demo/reset-drift & /api/agent/reset-drift: Clear simulated drift and revert to live market
 */
app.post(["/api/demo/reset-drift", "/api/agent/reset-drift"], async (req, res) => {
  try {
    agent.priceFeed.resetDrift();
    agent.classifier.reset();
    console.log("[DEMO] Reset simulated drift. Reverting to live market prices.");

    await agent.step();

    res.json({
      success: true,
      message: "Reverted to live market feed"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/delegation/toggle: Grant or revoke agent signing delegation
 */
app.post("/api/delegation/toggle", (req, res) => {
  try {
    const current = db.getDelegation();
    const newState = current.is_delegated === 1 ? false : true;
    db.setDelegation(newState);

    console.log(`[DELEGATION] Wallet delegation toggled to: ${newState ? "ACTIVE" : "REVOKED"}`);

    res.json({
      success: true,
      isDelegated: newState,
      message: newState ? "Dynamic signing rights GRANTED" : "Dynamic signing rights REVOKED"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 PegWatch REST API Server active on http://localhost:${port}`);
  console.log(`==================================================\n`);
});
