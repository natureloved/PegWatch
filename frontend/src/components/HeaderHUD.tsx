import React from "react";
import { Shield, ShieldAlert, Radio, Activity, Clock } from "lucide-react";
import type { StatusResponse } from "../types";

interface HeaderHUDProps {
  status: StatusResponse | null;
  onToggleDelegation: () => void;
  isToggling: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  status,
  onToggleDelegation,
  isToggling
}) => {
  const isWeekend = status?.regime.includes("WEEKEND");
  const isDelegated = status?.delegation.isDelegated ?? true;
  const stalenessHours = status?.latestTick 
    ? (status.latestTick.staleness_sec / 3600).toFixed(1) 
    : "42.0";

  return (
    <header className="glass-panel header-hud">
      {/* Brand & Identity */}
      <div className="brand-group">
        <div className="brand-logo">
          <Activity size={24} color="#ffffff" />
        </div>
        <div>
          <div className="brand-title">PegWatch</div>
          <div className="brand-subtitle">Autonomous Risk Agent • Base</div>
        </div>
      </div>

      {/* Live System State & Regimes */}
      <div className="hud-status-group">
        {/* Base Network Node */}
        <div className="badge cyan">
          <div className="pulse-dot" />
          <span>Base Mainnet (8453)</span>
        </div>

        {/* Market Regime Badge */}
        <div className={`badge ${isWeekend ? "purple" : "emerald"}`}>
          <Clock size={13} />
          <span>
            {isWeekend 
              ? `Weekend Dark Market (Frozen ${stalenessHours}h)` 
              : `Active Session: ${status?.regime || "REGULAR"}`}
          </span>
        </div>

        {/* Agent Signer Address */}
        <div className="badge" title="PegWatch Autonomous Signer">
          <Radio size={13} color="#94a3b8" />
          <span>Signer: {status?.agentSignerAddress?.slice(0, 6)}...{status?.agentSignerAddress?.slice(-4)}</span>
        </div>

        {/* Delegated Wallet & One-Click Revoke */}
        <div className="badge" style={{ borderColor: isDelegated ? "rgba(0, 230, 118, 0.3)" : "rgba(255, 42, 85, 0.4)" }}>
          {isDelegated ? (
            <Shield size={14} color="var(--color-emerald)" />
          ) : (
            <ShieldAlert size={14} color="var(--color-crimson)" />
          )}
          <span>
            Delegation: {isDelegated ? "ACTIVE" : "REVOKED"}
            {isDelegated && ` ($${status?.delegation.remainingAllowanceUsd.toFixed(0)} left)`}
          </span>
          
          <button
            id="btn-toggle-delegation"
            className={`btn ${isDelegated ? "btn-revoke" : "btn-grant"}`}
            style={{ padding: "4px 10px", fontSize: "11px", marginLeft: "4px" }}
            onClick={onToggleDelegation}
            disabled={isToggling}
          >
            {isDelegated ? "Revoke Signing" : "Grant Signing"}
          </button>
        </div>
      </div>
    </header>
  );
};
