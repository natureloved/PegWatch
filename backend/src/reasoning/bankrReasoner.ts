/**
 * PegWatch Reasoner: Plain-English Rationale via Bankr LLM Gateway
 */

import { BANKR_LLM_GATEWAY_URL } from "../config/constants.js";

export interface ReasoningContext {
  tokenSymbol: string;
  dexPrice: number;
  oraclePrice: number;
  deviationPct: number;
  stalenessSec: number;
  regime: string;
  actionType: string;
  qty: number;
  notionalUsd: number;
}

export class BankrReasoner {
  private isEnabled: boolean;
  private apiKey?: string;

  constructor() {
    // Bankr Agent API is scaffolded; disabled under $0 free tier rule
    this.isEnabled = process.env.BANKR_ENABLED === "true";
    this.apiKey = process.env.BANKR_API_KEY;
  }

  /**
   * Generates a 2-sentence plain-English rationale for the action
   */
  public async generateReasoning(ctx: ReasoningContext): Promise<string> {
    const stalenessHours = (ctx.stalenessSec / 3600).toFixed(1);
    const deviationFormatted = `${ctx.deviationPct >= 0 ? "+" : ""}${ctx.deviationPct.toFixed(2)}%`;

    if (this.isEnabled && process.env.BANKR_API_KEY) {
      try {
        const prompt = {
          model: "bankr-default",
          messages: [
            {
              role: "system",
              content: "You are PegWatch, an autonomous risk agent on Base. Write exactly 2 concise sentences explaining why this protective de-risking action was executed. Focus on the tokenized stock peg drift and the weekend dark market oracle freeze."
            },
            {
              role: "user",
              content: `Token: ${ctx.tokenSymbol}
DEX Price: $${ctx.dexPrice.toFixed(2)}
Chainlink Oracle Price: $${ctx.oraclePrice.toFixed(2)}
Deviation: ${deviationFormatted}
Oracle Staleness: ${ctx.stalenessSec}s (${stalenessHours} hours stale)
Market Regime: ${ctx.regime}
Action: ${ctx.actionType} of ${ctx.qty} ${ctx.tokenSymbol} ($${ctx.notionalUsd} notional)`
            }
          ],
          max_tokens: 140,
          temperature: 0.3
        };

        const res = await fetch(BANKR_LLM_GATEWAY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.apiKey || "",
            "Authorization": `Bearer ${this.apiKey || ""}`
          },
          body: JSON.stringify(prompt)
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) return text;
        }
      } catch (err: any) {
        console.warn(`[REASONER] Bankr Gateway call failed: ${err.message}. Using deterministic heuristic.`);
      }
    }

    // Heuristic Reasoner Fallback
    const actionLabel = ctx.actionType.includes("STOP") ? "Stop-Loss Order" : "Protective Order";
    if (ctx.regime.includes("WEEKEND")) {
      return `${ctx.tokenSymbol} DEX price drifted ${deviationFormatted} from Friday's official close while the Chainlink equity oracle has been frozen for ${stalenessHours} hours over the weekend dark market. PegWatch executed a protective ${actionLabel} of ${ctx.qty} ${ctx.tokenSymbol} ($${ctx.notionalUsd}) to mitigate downside exposure before Monday's market open.`;
    } else {
      return `${ctx.tokenSymbol} DEX price deviated ${deviationFormatted} from fair value, exceeding the active volatility guardrail. PegWatch placed an automated protective ${actionLabel} for ${ctx.qty} ${ctx.tokenSymbol} ($${ctx.notionalUsd}) within delegated user risk parameters.`;
    }
  }
}
