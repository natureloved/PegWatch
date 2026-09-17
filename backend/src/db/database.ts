/**
 * PegWatch Database & Action Ledger (SQLite via better-sqlite3)
 */

import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

export interface PriceTick {
  id?: number;
  timestamp: number;
  token_symbol: string;
  dex_price: number;
  oracle_price: number;
  deviation_pct: number;
  is_frozen: number; // 1 or 0
  staleness_sec: number;
  regime: string;
  is_simulated: number; // 1 or 0
}

export interface AgentAction {
  id: string;
  timestamp: number;
  token_symbol: string;
  action_type: string;
  deviation_pct: number;
  regime: string;
  classification: string;
  decision: string;
  reason: string;
  order_id: string | null;
  tx_hash: string | null;
  explorer_url: string | null;
  status: string;
  qty: number;
  notional_usd: number;
  is_simulated: number;
}

export interface DelegationState {
  wallet_address: string;
  is_delegated: number; // 1 or 0
  max_allowance_usd: number;
  remaining_allowance_usd: number;
  updated_at: number;
}

class LedgerDb {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.resolve(process.cwd(), "pegwatch.db");
    this.db = new Database(finalPath);
    this.db.pragma("journal_mode = WAL");
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS price_ticks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        token_symbol TEXT NOT NULL,
        dex_price REAL NOT NULL,
        oracle_price REAL NOT NULL,
        deviation_pct REAL NOT NULL,
        is_frozen INTEGER NOT NULL,
        staleness_sec INTEGER NOT NULL,
        regime TEXT NOT NULL,
        is_simulated INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS agent_actions (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        token_symbol TEXT NOT NULL,
        action_type TEXT NOT NULL,
        deviation_pct REAL NOT NULL,
        regime TEXT NOT NULL,
        classification TEXT NOT NULL,
        decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        order_id TEXT,
        tx_hash TEXT,
        explorer_url TEXT,
        status TEXT NOT NULL,
        qty REAL NOT NULL,
        notional_usd REAL NOT NULL,
        is_simulated INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS risk_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS delegation_state (
        wallet_address TEXT PRIMARY KEY,
        is_delegated INTEGER NOT NULL DEFAULT 1,
        max_allowance_usd REAL NOT NULL DEFAULT 500.0,
        remaining_allowance_usd REAL NOT NULL DEFAULT 500.0,
        updated_at INTEGER NOT NULL
      );
    `);

    // Ensure default delegation record exists
    const row = this.db.prepare("SELECT wallet_address FROM delegation_state LIMIT 1").get();
    if (!row) {
      this.db.prepare(`
        INSERT INTO delegation_state (wallet_address, is_delegated, max_allowance_usd, remaining_allowance_usd, updated_at)
        VALUES ('0xDelegatedUserWalletOnBase', 1, 500.0, 500.0, ?)
      `).run(Date.now());
    }
  }

  public insertPriceTick(tick: Omit<PriceTick, "id">): void {
    const stmt = this.db.prepare(`
      INSERT INTO price_ticks (timestamp, token_symbol, dex_price, oracle_price, deviation_pct, is_frozen, staleness_sec, regime, is_simulated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      tick.timestamp,
      tick.token_symbol,
      tick.dex_price,
      tick.oracle_price,
      tick.deviation_pct,
      tick.is_frozen,
      tick.staleness_sec,
      tick.regime,
      tick.is_simulated
    );
  }

  public getRecentTicks(limit = 60): PriceTick[] {
    const stmt = this.db.prepare(`
      SELECT * FROM price_ticks ORDER BY timestamp DESC LIMIT ?
    `);
    const rows = stmt.all(limit) as PriceTick[];
    return rows.reverse();
  }

  public insertAction(action: AgentAction): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agent_actions (
        id, timestamp, token_symbol, action_type, deviation_pct, regime,
        classification, decision, reason, order_id, tx_hash, explorer_url,
        status, qty, notional_usd, is_simulated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      action.id,
      action.timestamp,
      action.token_symbol,
      action.action_type,
      action.deviation_pct,
      action.regime,
      action.classification,
      action.decision,
      action.reason,
      action.order_id,
      action.tx_hash,
      action.explorer_url,
      action.status,
      action.qty,
      action.notional_usd,
      action.is_simulated
    );
  }

  public getRecentActions(limit = 50): AgentAction[] {
    const stmt = this.db.prepare(`
      SELECT * FROM agent_actions ORDER BY timestamp DESC LIMIT ?
    `);
    return stmt.all(limit) as AgentAction[];
  }

  public getDelegation(): DelegationState {
    const stmt = this.db.prepare(`SELECT * FROM delegation_state LIMIT 1`);
    return stmt.get() as DelegationState;
  }

  public setDelegation(isDelegated: boolean, remainingAllowance?: number): void {
    const current = this.getDelegation();
    const newAllowance = remainingAllowance !== undefined ? remainingAllowance : current.remaining_allowance_usd;
    const stmt = this.db.prepare(`
      UPDATE delegation_state 
      SET is_delegated = ?, remaining_allowance_usd = ?, updated_at = ?
      WHERE wallet_address = ?
    `);
    stmt.run(isDelegated ? 1 : 0, newAllowance, Date.now(), current.wallet_address);
  }

  public setConfig(key: string, value: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO risk_config (key, value) VALUES (?, ?)
    `);
    stmt.run(key, value);
  }

  public getConfig(key: string): string | null {
    const stmt = this.db.prepare(`SELECT value FROM risk_config WHERE key = ?`);
    const row = stmt.get(key) as { value: string } | undefined;
    return row ? row.value : null;
  }

  public getAllConfig(): Record<string, string> {
    const stmt = this.db.prepare(`SELECT key, value FROM risk_config`);
    const rows = stmt.all() as { key: string; value: string }[];
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  }
}

export const db = new LedgerDb();
