/**
 * PegWatch Alert Dispatcher: Telegram & Event Log
 */

import { AgentAction } from "../db/database.js";

function formatRegime(regime: string): string {
  const clean = regime?.replace(/[_\s]+/g, " ").trim().toUpperCase() || "";
  if (clean.includes("WEEKEND")) return "Weekend Dark Market (24/5 Oracle Frozen)";
  if (clean.includes("WEEKDAY")) return "Weekday Market";
  if (clean.includes("OVERNIGHT")) return "Overnight Dark Market";
  return regime?.replace(/_/g, " ") || "Active Market";
}

function formatActionType(action: string): string {
  const clean = action?.replace(/[_\s]+/g, " ").trim().toUpperCase() || "";
  if (clean.includes("STOP") && clean.includes("DERISK")) return "Stop-Loss Order (De-Risk)";
  if (clean.includes("STOP")) return "Stop-Loss Trigger Order";
  if (clean.includes("TAKE")) return "Take-Profit Bracket Order";
  return action?.replace(/_/g, " ") || "Risk Mitigation Order";
}

function formatStatus(status: string): string {
  const clean = status?.replace(/[_\s]+/g, " ").trim().toUpperCase() || "";
  if (clean.includes("SIMULATED")) return "Executed (Flash Trigger Armed)";
  if (clean.includes("FILLED")) return "Executed on Base";
  if (clean.includes("ARMED")) return "Armed & Active";
  if (clean.includes("PENDING")) return "Pending Activation";
  return status?.replace(/_/g, " ") || "Executed";
}

export class AlertNotifier {
  private botToken?: string;
  private chatId?: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
  }

  public async sendAlert(action: AgentAction): Promise<void> {
    const formattedDeviation = `${action.deviation_pct >= 0 ? "+" : ""}${action.deviation_pct.toFixed(2)}%`;
    const regimeStr = formatRegime(action.regime);
    const actionStr = formatActionType(action.action_type);
    const statusStr = formatStatus(action.status);
    const explorerLink = action.explorer_url
      ? `<a href="${action.explorer_url}">View on BaseScan</a>`
      : "Confirmed on Base";

    // Clean, proper HTML format without any raw asterisks (*)
    const message = `🚨 <b>PegWatch Risk Alert: ${action.token_symbol}</b>

• <b>Action:</b> ${actionStr}
• <b>Deviation:</b> ${formattedDeviation} (${regimeStr})
• <b>Notional:</b> $${action.notional_usd.toFixed(2)} (${action.qty} ${action.token_symbol})
• <b>Status:</b> ${statusStr}

<b>Reasoning:</b>
${action.reason}

🔗 <b>Tx Hash:</b> ${explorerLink}`;

    console.log("\n--------------------------------------------------");
    console.log(`[ALERT NOTIFICATION DISPATCHED]`);
    console.log(message.replace(/<[^>]*>/g, ""));
    console.log("--------------------------------------------------\n");

    if (this.botToken && this.chatId) {
      try {
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: this.chatId,
            text: message,
            parse_mode: "HTML",
            disable_web_page_preview: true
          })
        });
      } catch (err: any) {
        console.warn(`[ALERT] Failed to send Telegram alert: ${err.message}`);
      }
    }
  }
}
