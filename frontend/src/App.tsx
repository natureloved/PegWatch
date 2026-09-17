import { useState, useEffect } from "react";
import { HeaderHUD } from "./components/HeaderHUD";
import { MetricsBar } from "./components/MetricsBar";
import { DeviationChart } from "./components/DeviationChart";
import { DemoStation } from "./components/DemoStation";
import { ActionLedger } from "./components/ActionLedger";
import type { StatusResponse, PriceTick, AgentAction } from "./types";
import { Info } from "lucide-react";

const API_BASE = "http://localhost:3005/api";

export function App() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [ticks, setTicks] = useState<PriceTick[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  // Fetch live state from backend
  const fetchData = async () => {
    try {
      const [statusRes, historyRes, actionsRes] = await Promise.all([
        fetch(`${API_BASE}/status`).then((r) => r.json()),
        fetch(`${API_BASE}/history?limit=60`).then((r) => r.json()),
        fetch(`${API_BASE}/actions?limit=50`).then((r) => r.json()),
      ]);

      if (statusRes.success) setStatus(statusRes);
      if (historyRes.success) setTicks(historyRes.ticks || []);
      if (actionsRes.success) setActions(actionsRes.actions || []);
    } catch (err) {
      console.warn("Error polling PegWatch API:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Delegation Toggle
  const handleToggleDelegation = async () => {
    setIsToggling(true);
    try {
      const res = await fetch(`${API_BASE}/delegation/toggle`, { method: "POST" }).then((r) => r.json());
      if (res.success) {
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to toggle delegation:", err);
    } finally {
      setIsToggling(false);
    }
  };

  // Demo Inject Drift
  const handleInjectDrift = async (driftPct: number, reason: string) => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE}/demo/inject-drift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driftPct, reason }),
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to inject simulated drift:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Reset Drift
  const handleResetDrift = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE}/demo/reset-drift`, { method: "POST" });
      await fetchData();
    } catch (err) {
      console.error("Failed to reset drift:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* 1. Header HUD */}
      <HeaderHUD
        status={status}
        onToggleDelegation={handleToggleDelegation}
        isToggling={isToggling}
      />

      {/* 2. Key Metrics Bar */}
      <MetricsBar status={status} />

      {/* 3. Demo Simulation Station (Labeled Transparently) */}
      <DemoStation
        injectedDrift={status?.injectedDrift}
        onInject={handleInjectDrift}
        onReset={handleResetDrift}
        isLoading={isLoading}
      />

      {/* 4. Live Deviation Chart & Real-Time Price Series */}
      <DeviationChart
        ticks={ticks}
        actions={actions}
        thresholdPct={status?.thresholdPct || 3.0}
      />

      {/* 5. Autonomous Action Ledger & Bankr AI Reasoning Feed */}
      <ActionLedger actions={actions} />

      {/* 6. Product Architecture & Judge Explainer Card */}
      <footer className="glass-panel" style={{ border: "1px solid var(--border-subtle)", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(0, 82, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Info size={20} color="var(--color-cyan)" />
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "15px", fontWeight: "600", marginBottom: "6px" }}>
              Why PegWatch Exists: The 65.5-Hour Dark Market Gap
            </h4>
            <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
              Tokenized equities on Base (e.g. NVDAc) trade 24/7 on decentralized exchanges like Aerodrome. 
              However, official Chainlink price feeds run <strong>24/5</strong> and freeze from Friday 4:00 PM ET to Monday 9:30 AM ET (~65.5 hours), holding the last close.
              When market-moving news strikes or liquidity dries up over the weekend, DEX prices drift far from fair value.
              <strong> PegWatch is the autonomous risk agent that monitors this peg spread, reasons about the drift via the Bankr LLM Gateway, and executes protective de-risk stop-loss orders via Definitive Flash through a Dynamic delegated wallet.</strong>
            </p>

            <div style={{ marginTop: "12px", display: "flex", gap: "18px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "var(--text-muted)" }}>Target Asset: <strong style={{ color: "#ffffff" }}>NVDAc</strong></span>
              <span style={{ color: "var(--text-muted)" }}>DEX Pool: <strong style={{ color: "var(--color-cyan)" }}>Aerodrome Base</strong></span>
              <span style={{ color: "var(--text-muted)" }}>Execution Rail: <strong style={{ color: "#c084fc" }}>Definitive Flash API</strong></span>
              <span style={{ color: "var(--text-muted)" }}>Delegation Rail: <strong style={{ color: "var(--color-emerald)" }}>Dynamic TSS-MPC</strong></span>
              <span style={{ color: "var(--text-muted)" }}>AI Reasoner: <strong style={{ color: "#a5f3fc" }}>Bankr LLM Gateway</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
