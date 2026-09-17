/**
 * PegWatch Alert Dispatcher: Telegram & Event Log
 */

import { AgentAction } from "../db/database.js";

export class AlertNotifier {
  private botToken?: string;
  private chatId?: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
  }

  public async sendAlert(action: AgentAction): Promise<void> {
    const formattedDeviation = `${action.deviation_pct >= 0 ? "+" : ""}${action.deviation_pct.toFixed(2)}%`;
    const message = `🚨 *PegWatch Risk Alert: ${action.token_symbol}*
• *Action*: ${action.action_type}
• *Deviation*: ${formattedDeviation} (${action.regime})
• *Reasoning*: ${action.reason}
• *Notional*: $${action.notional_usd.toFixed(2)} (${action.qty} ${action.token_symbol})
• *Status*: ${action.status}
• *Tx Hash*: [BaseScan Explorer](${action.explorer_url})`;

    console.log("\n--------------------------------------------------");
    console.log(`[ALERT NOTIFICATION DISPATCHED]`);
    console.log(message);
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
            parse_mode: "Markdown"
          })
        });
      } catch (err: any) {
        console.warn(`[ALERT] Failed to send Telegram alert: ${err.message}`);
      }
    }
  }
}
