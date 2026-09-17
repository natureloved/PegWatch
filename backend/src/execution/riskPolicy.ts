/**
 * PegWatch Risk Policy & Delegation Enforcer
 */

import { DEFAULT_RISK_CONFIG } from "../config/constants.js";
import { db } from "../db/database.js";

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  qtyToSell: number;
  notionalUsd: number;
}

export class RiskPolicyEngine {
  private lastActionTimestamp: number = 0;

  public checkExecution(
    currentDexPrice: number,
    requestedQty: number = DEFAULT_RISK_CONFIG.defaultSellQty
  ): PolicyCheckResult {
    const delegation = db.getDelegation();

    // 1. Delegation Check
    if (!delegation || delegation.is_delegated !== 1) {
      return {
        allowed: false,
        reason: "Autonomous execution blocked: Dynamic delegation has been REVOKED by user.",
        qtyToSell: 0,
        notionalUsd: 0
      };
    }

    // 2. Cooldown Check
    const now = Date.now();
    const cooldownMs = DEFAULT_RISK_CONFIG.cooldownSeconds * 1000;
    if (this.lastActionTimestamp > 0 && now - this.lastActionTimestamp < cooldownMs) {
      const remainingSec = Math.ceil((cooldownMs - (now - this.lastActionTimestamp)) / 1000);
      return {
        allowed: false,
        reason: `Autonomous execution blocked: Cooldown active (${remainingSec}s remaining).`,
        qtyToSell: 0,
        notionalUsd: 0
      };
    }

    // 3. Notional per action limit
    let notional = requestedQty * currentDexPrice;
    let finalQty = requestedQty;

    if (notional > DEFAULT_RISK_CONFIG.maxNotionalPerActionUsd) {
      // Clamp to max allowed notional per action
      finalQty = parseFloat((DEFAULT_RISK_CONFIG.maxNotionalPerActionUsd / currentDexPrice).toFixed(4));
      notional = finalQty * currentDexPrice;
    }

    // 4. Daily Allowance Check
    if (notional > delegation.remaining_allowance_usd) {
      if (delegation.remaining_allowance_usd <= 0.5) {
        return {
          allowed: false,
          reason: `Autonomous execution blocked: Daily allowance depleted ($${delegation.remaining_allowance_usd.toFixed(2)} remaining).`,
          qtyToSell: 0,
          notionalUsd: 0
        };
      }
      // Clamp to remaining allowance
      finalQty = parseFloat((delegation.remaining_allowance_usd / currentDexPrice).toFixed(4));
      notional = finalQty * currentDexPrice;
    }

    return {
      allowed: true,
      qtyToSell: finalQty,
      notionalUsd: parseFloat(notional.toFixed(2))
    };
  }

  public recordAction(notionalSpent: number): void {
    this.lastActionTimestamp = Date.now();
    const delegation = db.getDelegation();
    const newAllowance = Math.max(0, delegation.remaining_allowance_usd - notionalSpent);
    db.setDelegation(true, newAllowance);
  }

  public getLastActionTimestamp(): number {
    return this.lastActionTimestamp;
  }
}
