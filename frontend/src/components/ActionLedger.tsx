import React, { useState } from "react";
import { ExternalLink, ShieldCheck, ShieldAlert, Sparkles, Hash } from "lucide-react";
import type { AgentAction } from "../types";

interface ActionLedgerProps {
  actions: AgentAction[];
}

export const ActionLedger: React.FC<ActionLedgerProps> = ({ actions }) => {
  const [filter, setFilter] = useState<"ALL" | "EXECUTED" | "BLOCKED">("ALL");

  const filteredActions = actions.filter((act) => {
    if (filter === "EXECUTED") return act.decision === "EXECUTED";
    if (filter === "BLOCKED") return act.decision === "BLOCKED_BY_POLICY";
    return true;
  });

  return (
    <div className="glass-panel">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: "600" }}>
            Autonomous Action Ledger & AI Reasoning Feed
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
            Inspectable record of all trigger evaluations, Flash orders, and Bankr LLM rationales
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            id="filter-all"
            className={`btn-preset ${filter === "ALL" ? "danger" : ""}`}
            style={{ padding: "4px 10px", fontSize: "11px" }}
            onClick={() => setFilter("ALL")}
          >
            All ({actions.length})
          </button>
          <button
            id="filter-executed"
            className={`btn-preset ${filter === "EXECUTED" ? "danger" : ""}`}
            style={{ padding: "4px 10px", fontSize: "11px" }}
            onClick={() => setFilter("EXECUTED")}
          >
            Executed ({actions.filter(a => a.decision === "EXECUTED").length})
          </button>
          <button
            id="filter-blocked"
            className={`btn-preset ${filter === "BLOCKED" ? "danger" : ""}`}
            style={{ padding: "4px 10px", fontSize: "11px" }}
            onClick={() => setFilter("BLOCKED")}
          >
            Blocked ({actions.filter(a => a.decision === "BLOCKED_BY_POLICY").length})
          </button>
        </div>
      </div>

      {filteredActions.length === 0 ? (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
          No autonomous actions recorded yet in ledger. Agent is monitoring 24/7.
        </div>
      ) : (
        <div className="ledger-table-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Asset</th>
                <th>Deviation</th>
                <th>Decision & Order</th>
                <th>Plain-English AI Rationale (Bankr)</th>
                <th>Receipt / Tx</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.map((act) => {
                const isExecuted = act.decision === "EXECUTED";
                const isSimulated = act.is_simulated === 1;

                return (
                  <tr key={act.id}>
                    {/* Timestamp */}
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(act.timestamp).toLocaleTimeString()}
                      <div style={{ fontSize: "10px", opacity: 0.7 }}>
                        {new Date(act.timestamp).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Asset */}
                    <td>
                      <span className="badge" style={{ padding: "3px 8px", fontSize: "11px" }}>
                        {act.token_symbol}
                      </span>
                    </td>

                    {/* Deviation & Regime */}
                    <td>
                      <div style={{ color: "var(--color-crimson)", fontFamily: "var(--font-mono)", fontWeight: "600" }}>
                        {act.deviation_pct >= 0 ? "+" : ""}{act.deviation_pct.toFixed(2)}%
                      </div>
                      <span className="badge purple" style={{ fontSize: "10px", padding: "2px 6px", marginTop: "4px" }}>
                        {act.regime}
                      </span>
                    </td>

                    {/* Decision & Order */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {isExecuted ? (
                          <span className="badge emerald" style={{ fontSize: "11px", padding: "3px 8px" }}>
                            <ShieldCheck size={12} /> EXECUTED
                          </span>
                        ) : (
                          <span className="badge crimson" style={{ fontSize: "11px", padding: "3px 8px" }}>
                            <ShieldAlert size={12} /> BLOCKED
                          </span>
                        )}
                        {isSimulated && (
                          <span className="badge purple" style={{ fontSize: "10px", padding: "2px 6px" }}>
                            Demo
                          </span>
                        )}
                      </div>

                      {isExecuted && (
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                          Qty: {act.qty} {act.token_symbol} (${act.notional_usd.toFixed(2)})
                        </div>
                      )}
                    </td>

                    {/* AI Reasoning */}
                    <td style={{ maxWidth: "420px" }}>
                      <div className="reasoning-box">
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-cyan)", fontSize: "11px", marginBottom: "3px", fontWeight: "600" }}>
                          <Sparkles size={12} />
                          <span>Bankr Reasoner</span>
                        </div>
                        {act.reason}
                      </div>
                    </td>

                    {/* Receipt / Tx Link */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      {act.order_id && (
                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "4px" }}>
                          Flash ID: <span style={{ color: "var(--color-cyan)" }}>{act.order_id}</span>
                        </div>
                      )}

                      {act.explorer_url ? (
                        <a
                          href={act.explorer_url}
                          target="_blank"
                          rel="noreferrer"
                          className="tx-link"
                          style={{ fontSize: "11px" }}
                        >
                          <Hash size={11} />
                          <span>{act.tx_hash?.slice(0, 8)}...{act.tx_hash?.slice(-6)}</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          None (Policy Blocked)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
