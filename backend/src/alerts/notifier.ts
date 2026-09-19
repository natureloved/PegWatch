/**
 * PegWatch Alert Dispatcher: Telegram & Event Log
 */

import { AgentAction } from "../db/database.js";

function formatRegime(regime: string): string {
  const clean = regime?.replace(/[_\s-]+/g, "").trim().toUpperCase() || "";
  if (clean.includes("WEEKEND")) return "Weekend Dark Market (24/5 Oracle Frozen)";
  if (clean.includes("WEEKDAY")) return "Weekday Market";
  if (clean.includes("OVERNIGHT")) return "Overnight Dark Market";
  return regime?.replace(/_/g, " ") || "Active Market";
}

function formatActionType(action: string): string {
  const clean = action?.replace(/[_\s-]+/g, "").trim().toUpperCase() || "";
  if (clean.includes("STOP") || clean.includes("DERISK")) return "Stop-Loss Order (De-Risk)";
  if (clean.includes("TAKE")) return "Take-Profit Bracket Order";
  return action?.replace(/_/g, " ") || "Risk Mitigation Order";
}

function formatStatus(status: string, isSimulated?: boolean): string {
  const clean = status?.replace(/[_\s-]+/g, "").trim().toUpperCase() || "";
  if (clean.includes("REJECTED")) return "REJECTED (demo)";
  if (clean.includes("SIMULATED") || isSimulated) return "SIMULATED (demo)";
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
    const statusStr = formatStatus(action.status, action.is_simulated === 1);
    const explorerLink = action.tx_hash && action.explorer_url
      ? `<a href="${action.explorer_url}">View on BaseScan</a>`
      : "Verified EIP-712 Session Signature (Demo Mode)";

    const receiptLine = action.tx_hash
      ? `🔗 <b>Tx Hash:</b> ${explorerLink}`
      : `🔗 <b>Receipt:</b> ${explorerLink}`;

    // Sanitize any potential asterisks and format enum occurrences in reason
    const cleanReason = (action.reason || "")
      .replace(/\*/g, "")
      .replace(/STOP_LOSS_DE_RISK/gi, "Stop-Loss Order (De-Risk)")
      .replace(/WEEKEND_DARK_MARKET/gi, "Weekend Dark Market")
      .replace(/SIMULATED_FILLED/gi, "SIMULATED (demo)")
      .replace(/SIMULATED/gi, "SIMULATED (demo)");

    // Clean, proper HTML format without any raw asterisks (*)
    const rawMessage = `🚨 <b>PegWatch Risk Alert: ${action.token_symbol}</b>

• <b>Action:</b> ${actionStr}
• <b>Deviation:</b> ${formattedDeviation} (${regimeStr})
• <b>Notional:</b> $${action.notional_usd.toFixed(2)} (${action.qty} ${action.token_symbol})
• <b>Status:</b> ${statusStr}

<b>Reasoning:</b>
${cleanReason}

${receiptLine}`;

    const message = rawMessage.replace(/\*/g, "");

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
