import { useState, useEffect } from 'react';
import type { Status, Action, Policy, DeviationPoint } from './types';
import initialStatus from './mocks/status.json';
import initialActions from './mocks/actions.json';
import initialPolicy from './mocks/policy.json';

import { LiveTickerBar } from './components/LiveTickerBar';
import { HeaderBar } from './components/HeaderBar';
import { LandingPage } from './components/LandingPage';
import { DeviationGauge } from './components/DeviationGauge';
import { FlashTerminal } from './components/FlashTerminal';
import { AiRiskCopilot } from './components/AiRiskCopilot';
import { PolicyPanel } from './components/PolicyPanel';
import { DeviationChart } from './components/DeviationChart';
import { ActionsLedger } from './components/ActionsLedger';
import { RevokeModal } from './components/RevokeModal';
import { DemoControls } from './components/DemoControls';
import { SimulatedBanner } from './components/SimulatedBanner';

const IS_MOCK = import.meta.env.VITE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'terminal'>('terminal');
  const [status, setStatus] = useState<Status>(initialStatus as Status);
  const [actions, setActions] = useState<Action[]>(initialActions as Action[]);
  const [policy, setPolicy] = useState<Policy>(initialPolicy as Policy);
  const [chartData, setChartData] = useState<DeviationPoint[]>([]);

  const [isSimulated, setIsSimulated] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isStandingDown, setIsStandingDown] = useState(false);

  // Seed 24h rolling deviation chart
  useEffect(() => {
    const points: DeviationPoint[] = [];
    const now = Math.floor(Date.now() / 1000);
    const baseFair = 216.0;

    for (let i = 24; i >= 0; i--) {
      const ts = now - i * 3600;
      const date = new Date(ts * 1000);
      const hours = date.getHours().toString().padStart(2, '0');
      const timeLabel = `${hours}:00`;

      // Seed gentle drift between -2.2% and -4.2%
      const jitter = Math.sin(i * 0.4) * 1.2 - 2.8;
      const deviationPct = parseFloat(jitter.toFixed(2));
      const dexPrice = parseFloat((baseFair * (1 + deviationPct / 100)).toFixed(2));

      // Weekend dark market window for last 18 hours
      const isWeekend = i <= 18;

      points.push({
        ts,
        timeLabel,
        deviationPct,
        dexPrice,
        fairValue: baseFair,
        isWeekend,
      });
    }

    setChartData(points);
  }, []);

  // 10s Polling Loop (Mock random walk or Live API)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSimulated || isStandingDown) return;

      if (IS_MOCK) {
        // Random walk jitter for mock live motion
        setStatus((prev) => {
          const jitter = (Math.random() - 0.5) * 0.15;
          const newDev = parseFloat((prev.deviationPct + jitter).toFixed(2));
          const newDex = parseFloat((prev.fairValue * (1 + newDev / 100)).toFixed(2));
          return {
            ...prev,
            dexPrice: newDex,
            deviationPct: newDev,
          };
        });
      } else {
        // Fetch from live agent backend
        fetch(`${API_URL}/status`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.latestTick) {
              const tick = data.latestTick;
              setStatus((prev) => ({
                ...prev,
                dexPrice: tick.dex_price,
                fairValue: tick.oracle_price,
                deviationPct: parseFloat(tick.deviation_pct.toFixed(2)),
                feedFrozen: tick.is_frozen === 1,
                feedUpdatedAt: Math.floor(Date.now() / 1000) - tick.staleness_sec,
                regime: (data.regime as any) || 'WEEKEND',
                thresholdPct: data.thresholdPct || 5.0,
              }));
            }
          })
          .catch((err) => console.warn('Failed to poll live agent API:', err));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isSimulated, isStandingDown]);

  // Demo Choreography: NORMAL -> ARMED -> ABNORMAL -> EXECUTED
  const handleArmNow = () => {
    setIsSimulated(true);

    // Step 1: Escalate to ARMED (Breach 1 of 2)
    setStatus((prev) => ({
      ...prev,
      deviationPct: -5.35,
      dexPrice: parseFloat((prev.fairValue * (1 - 0.0535)).toFixed(2)),
      classification: 'ARMED',
      breaches: 1,
    }));

    // Step 2 (after 2s): Escalate to ABNORMAL (Breach 2 of 2)
    setTimeout(() => {
      setStatus((prev) => ({
        ...prev,
        deviationPct: -5.48,
        dexPrice: parseFloat((prev.fairValue * (1 - 0.0548)).toFixed(2)),
        classification: 'ABNORMAL',
        breaches: 2,
      }));

      // Step 3 (after 1.2s): Execute Definitive Flash Stop-Loss
      setTimeout(() => {
        const newOrderId = `flash_order_${Date.now().toString(36)}`;
        const newTxHash = `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;

        const executedAction: Action = {
          id: `act-${Date.now()}`,
          ts: Math.floor(Date.now() / 1000),
          deviationPct: -5.48,
          regime: status.regime,
          classification: 'ABNORMAL',
          decision: 'De-risk 0.05 NVDAc → USDC via Flash Stop-Loss',
          reason: `Aerodrome NVDAc/USDC pool drifted −5.48% below Friday close ($${status.fairValue.toFixed(
            2
          )}) while the Chainlink equity oracle has remained frozen for 85.2 hours. Confirmed abnormal dark-market liquidity breach across 2 consecutive evaluations; executing protective stop-loss to defend portfolio margin.`,
          orderId: newOrderId,
          txHash: newTxHash,
          status: 'EXECUTED',
        };

        setActions((prev) => [executedAction, ...prev]);

        // Add pin to chart
        setChartData((prev) => {
          if (prev.length === 0) return prev;
          const copy = [...prev];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            deviationPct: -5.48,
            action: executedAction,
          };
          return copy;
        });
      }, 1200);
    }, 2000);
  };

  // Slider injection
  const handleInjectDrift = (val: number) => {
    setIsSimulated(true);
    const abs = Math.abs(val);
    const isBreach = abs > status.thresholdPct;
    const isArmed = isBreach && status.breaches === 0;

    setStatus((prev) => ({
      ...prev,
      deviationPct: val,
      dexPrice: parseFloat((prev.fairValue * (1 + val / 100)).toFixed(2)),
      classification: isBreach ? (isArmed ? 'ARMED' : 'ABNORMAL') : 'NORMAL',
      breaches: isBreach ? Math.max(1, prev.breaches) : 0,
    }));
  };

  // Reset to live / mock baseline
  const handleReset = () => {
    setIsSimulated(false);
    setStatus((prev) => ({
      ...prev,
      deviationPct: -3.71,
      dexPrice: 207.99,
      classification: 'NORMAL',
      breaches: 0,
    }));
  };

  // Dynamic Trigger Band Ratchet from Flash Terminal
  const handleBandRatchet = (delta: number) => {
    setStatus((prev) => ({
      ...prev,
      thresholdPct: Math.max(1.0, Math.min(10.0, prev.thresholdPct + delta)),
    }));
  };

  // Delegation Revocation
  const handleConfirmRevoke = () => {
    setPolicy((prev) => ({ ...prev, delegated: false }));
    setIsStandingDown(true);
  };

  const handleRestoreDelegation = () => {
    setPolicy((prev) => ({ ...prev, delegated: true }));
    setIsStandingDown(false);
  };

  return (
    <div
      className={`min-h-screen bg-obsidian text-slate-100 font-sans transition-opacity duration-300 ${
        isStandingDown ? 'opacity-70' : 'opacity-100'
      }`}
    >
      {/* 1. Multi-Asset Ticker Marquee Bar */}
      <LiveTickerBar
        primaryDeviation={status.deviationPct}
        primaryDexPrice={status.dexPrice}
      />

      {/* 2. Top Navigation Bar */}
      <HeaderBar
        status={status}
        policy={policy}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenRevokeModal={() => setIsRevokeModalOpen(true)}
        onRestoreDelegation={handleRestoreDelegation}
      />

      {/* VIEW A: LANDING PAGE */}
      {viewMode === 'landing' ? (
        <LandingPage
          onLaunchApp={() => setViewMode('terminal')}
          primaryDeviation={status.deviationPct}
          primaryDexPrice={status.dexPrice}
        />
      ) : (
        /* VIEW B: MISSION CONTROL TERMINAL */
        <>
          {/* Honest Simulated Drift Banner */}
          <SimulatedBanner
            active={isSimulated}
            driftPct={status.deviationPct}
            onReset={handleReset}
          />

          {/* Main Dashboard Layout */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Top Grid: Hero Deviation Gauge (Left) + Definitive Flash & Delegation Cards (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Dominant Semicircular HUD Gauge */}
              <div className="lg:col-span-7">
                <DeviationGauge status={status} />
              </div>

              {/* Right Column: Flash Execution Rail & Delegation Mandate */}
              <div className="lg:col-span-5 space-y-4">
                <FlashTerminal
                  currentPrice={status.dexPrice}
                  benchmarkPrice={status.fairValue}
                  activeThresholdPct={status.thresholdPct}
                  isDelegated={policy.delegated}
                  onAdjustBand={handleBandRatchet}
                />

                <PolicyPanel
                  policy={policy}
                  onOpenRevokeModal={() => setIsRevokeModalOpen(true)}
                  onRestoreDelegation={handleRestoreDelegation}
                />
              </div>
            </div>

            {/* Mid Section: AI Risk Copilot Stream + 24h Rolling Deviation Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <AiRiskCopilot
                  deviationPct={status.deviationPct}
                  regime={status.regime}
                  isFeedFrozen={status.feedFrozen}
                  dexPrice={status.dexPrice}
                  fairValue={status.fairValue}
                  latestActionReason={actions[0]?.reason}
                />
              </div>

              <div className="lg:col-span-7">
                <DeviationChart
                  data={chartData}
                  thresholdPct={status.thresholdPct}
                  actions={actions}
                />
              </div>
            </div>

            {/* Bottom Section: Full Agent Audit Trail Ledger */}
            <ActionsLedger actions={actions} />
          </main>

          {/* Revocation Confirmation Modal */}
          <RevokeModal
            isOpen={isRevokeModalOpen}
            onClose={() => setIsRevokeModalOpen(false)}
            onConfirm={handleConfirmRevoke}
            delegatedWallet={policy.delegatedWallet}
          />

          {/* Collapsible Demo Controls (Bottom-Left) */}
          <DemoControls
            isSimulated={isSimulated}
            onInjectDrift={handleInjectDrift}
            onArmNow={handleArmNow}
            onReset={handleReset}
          />
        </>
      )}
    </div>
  );
}

export default App;
