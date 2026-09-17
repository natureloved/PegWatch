# PegWatch 🛡️
> **Autonomous Risk Agent for Tokenized Equities on Base**  
> *Built for the Runtime Hackathon (NYC + Online, Sep 13–19, 2026)*  
> **Tracks:** Bankr (Automatic) • Definitive Flash • Dynamic Delegated Access

---

## The Problem (Why PegWatch Exists)

1. **Tokenized equities on Base** (Coinbase's B20 tokens: `NVDAc`, `AAPLc`, `TSLA`, `META`, `GOOGL`, etc.) trade **24/7** on decentralized exchanges like Aerodrome.
2. **Official on-chain price feeds** (Chainlink, per Base's official documentation) run **24/5** — they *"hold the last close on weekends and holidays"*. Base explicitly warns protocol developers: *"apply staleness bounds before relying on the price; never settle or liquidate against a frozen feed."*
3. From **Friday 4:00 PM ET to Monday 9:30 AM ET (~65.5 hours)**, holders have no active on-chain fair value, no automated monitoring, and no institutional protection against market-moving news or weekend illiquidity shocks. DEX prices can drift significantly from Friday's closing benchmark.
4. **Humans sleep.** The only actor that can respond at 3:00 AM on Saturday within pre-approved portfolio risk limits is an autonomous agent with a delegated wallet. **PegWatch is that agent.**

---

## System Architecture

```
┌────────────────────────────────── PRICE INGESTION ──────────────────────────────────┐
│ • Aerodrome B20 Pool (Base): Live DEX price via viem contract read (Slipstream/V2)  │
│ • Chainlink Equity Feed (Base): latestRoundData() + updatedAt (24/5 — frozen state) │
│ • Reference Fair Value = Chainlink Friday close; Deviation = (DEX − Fair) / Fair    │
└──────────────────────────────────────────┬──────────────────────────────────────────┘
                                           │ (Every 60s / 10s demo)
                                           ▼
┌────────────────────────────────── AGENT CORE ───────────────────────────────────────┐
│ 1. Time-Aware Regime: Weekday Open (±1.2%), Overnight (±2.0%), Weekend (±3.0%)     │
│ 2. Drift Classifier: Distinguishes benign weekend gaps from abnormal drift.         │
│    Requires N=2 consecutive breaches to eliminate single-block noise.               │
│ 3. Risk Policy Engine: Max notional ($50), cooldown (300s), and allowance limit.    │
│ 4. Plain-English Reasoner: 2-sentence rationale via Bankr LLM Gateway.              │
└──────────────────────────────────────────┬──────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────── EXECUTION RAIL ───────────────────────────────────┐
│ • Dynamic Delegated Wallet: Revocable, user-approved session signing.               │
│ • Definitive Flash (Definitive Fi):                                                 │
│     POST https://flash.definitive.fi/v1/quote                                       │
│       targetAsset=NVDAc, contraAsset=USDC, side=sell, orderType=stop-loss           │
│     → Signs evm.orderTypedData via Dynamic EIP-712 signer                           │
│     → POST /v1/order with quoteId & userSignature                                   │
│     → Polls execution status and BaseScan transaction hash                          │
└──────────────────────────────────────────┬──────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────── LEDGER & SURFACE ─────────────────────────────────┐
│ • SQLite Action Ledger: Full audit trail of timestamps, regimes, reasons, & txs.    │
│ • React + Vite HUD Dashboard: Real-time deviation gauge, SVG price chart, and feed. │
│ • One-Click Revoke: Immediate user revocation of agent signing delegation.          │
│ • Multi-Channel Alerts: Telegram webhook dispatch on de-risking events.             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Sponsor Integration Index (Code Audit Pointers)

Judges can inspect the exact files and lines implementing the sponsor rails:

| Sponsor Rail | Implementation File | Key Functions & Responsibilities |
|---|---|---|
| **Definitive Flash** | [`backend/src/execution/flashClient.ts`](backend/src/execution/flashClient.ts) | • `POST https://flash.definitive.fi/v1/quote` for stop-loss triggers<br>• EIP-712 typed data signing (`evm.orderTypedData`)<br>• `POST https://flash.definitive.fi/v1/order` submission<br>• Order polling and BaseScan tx extraction |
| **Dynamic** | [`backend/src/execution/riskPolicy.ts`](backend/src/execution/riskPolicy.ts)<br>[`backend/src/execution/walletSigner.ts`](backend/src/execution/walletSigner.ts) | • Delegated signing authority enforcement<br>• Instant user revocation (`is_delegated: 0`)<br>• Per-action notional guardrails ($50 cap) & daily allowance tracking |
| **Bankr LLM Gateway** | [`backend/src/reasoning/bankrReasoner.ts`](backend/src/reasoning/bankrReasoner.ts) | • `https://llm.bankr.bot/v1/chat/completions`<br>• Authenticates with `X-API-Key`<br>• Generates 2-sentence plain-English explanations of peg drift causes and de-risking intent |

---

## What is Live vs. Simulated (Honest Demo Disclosure)

In strict adherence to the hackathon rules:
- **Live On-Chain Data**: Aerodrome DEX prices and pool states are queried live from Base (`0xb20000000000000000000078ee7ce2fE4908108C`).
- **Live Oracles**: Chainlink reference prices, timestamps, and staleness bounds are verified on-chain.
- **Simulated Injected Drift**: Because crypto markets do not always experience macro shocks on demand during judge evaluations, the **Demo Simulation Station** on the dashboard allows judges to inject simulated peg drift (e.g. `-3.8%`) against real live market feeds. Every simulated input is transparently labeled in logs, ledger rows, and badges as `Simulated Input / Demo`.

---

## Quickstart & Smoke Tests

### 1. Installation
```bash
git clone https://github.com/RastaDev/PegWatch.git
cd PegWatch
npm install
npm --prefix frontend install
```

### 2. Environment Configuration
Copy the template and fill in any sponsor keys:
```bash
cp .env.example .env
```
*(PegWatch includes intelligent developer fallbacks for all rails so you can run and evaluate the system immediately without waiting for API provisioning).*

### 3. Run Phase 0 Smoke Tests (All 4 Passing)
```bash
npm run smoke:all
```
Or run individually:
```bash
npm run smoke:price   # Tests Aerodrome DEX + Chainlink feeds on Base
npm run smoke:flash   # Tests Definitive Flash quote & payload structure
npm run smoke:wallet  # Tests Dynamic / EVM Agent EIP-712 signer
npm run smoke:llm     # Tests Bankr LLM Gateway completion
```

### 4. Run Server & Live Dashboard
```bash
# Terminal 1: Backend Agent & API Server (Port 3005)
npm run dev:server

# Terminal 2: Vite React HUD Dashboard (Port 5173)
npm run dev:ui
```
Open **`http://localhost:5173`** in your browser to interact with the live dashboard!

---

## Judge Alignment & FAQ

### *"Why doesn't an arbitrageur fix the peg?"*
Arbitrageurs close price discrepancies eventually and opportunistically when liquidity permits; they do **not** protect an individual investor's portfolio balance in the meantime. PegWatch is a personal risk guardrail, not a market efficiency arbitrageur.

### *"Why trust the autonomous agent?"*
1. **Limited Authority**: The agent operates under strict delegated constraints (max $50 per order, 300s cooldown, daily spending allowance).
2. **One-Click Revoke**: Users can instantly revoke signing delegation from the dashboard, halting any future executions immediately.
3. **Auditable Ledger**: Every single action generates a cryptographic receipt, a plain-English AI rationale, and an on-chain transaction record.

### *"What if the oracle itself is frozen?"*
That is precisely the point of PegWatch: Chainlink equity oracles are designed to freeze over weekends (24/5). PegWatch recognizes that staleness is not an error—it is the signal that marks the beginning of the **65.5-hour Dark Market**.

---

## Roadmap

- **Dual-Regime Vault (PegVault)**: ERC-4626 tokenized vault that holds B20 equities during active market hours and automatically rotates into yield-bearing USDC/sUSDe when weekend peg drift volatility exceeds tolerance.
- **CCA Batch Auction Auctions**: Integration with Uniswap CCA batch auctions for dark market liquidity resolution.
- **Cross-Equity Expansion**: Expanding coverage from NVDAc to all 13 Base B20 equities (AAPLc, TSLAc, METAc, GOOGLc).

---

## Submission Checklist

- [x] **Autonomous Agent**: Core loop running 24/7 with 60s poller
- [x] **Definitive Flash Integration**: `/quote` + `/order` with EIP-712 typed data signing
- [x] **Dynamic Delegated Access**: Enforced risk guardrails with one-click revocation
- [x] **Bankr LLM Gateway**: Plain-English rationale generated for every decision
- [x] **Action Ledger**: SQLite persistence with inspectable transaction hashes
- [x] **Live HUD Dashboard**: React + Vite interface with live charts and demo simulator
- [x] **Public Verification**: 4 independent passing smoke tests (`smoke:all`)
