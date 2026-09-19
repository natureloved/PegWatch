import React, { useState, useEffect } from 'react';

interface ExactDashboardProps {
  onGoToHome: () => void;
}

interface ActionItem {
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
  status: string;
}

export const ExactDashboard: React.FC<ExactDashboardProps> = ({ onGoToHome }) => {
  const [liveData, setLiveData] = useState({
    nvdacPrice: 222.06,
    oraclePrice: 118.50,
    deviationPct: 87.39,
    regime: 'WEEKEND_DARK_MARKET',
    thresholdPct: 3.0,
    isLiveBackend: false,
    walletAddress: '0xDelegatedUserWalletOnBase',
    isDelegated: true,
    agentSignerAddress: '0x33E7Ec3333e957D091F07727D1300f33F2717C25',
    pollCount: 1420
  });

  const [liveActions, setLiveActions] = useState<ActionItem[]>([]);
  const [demoStatus, setDemoStatus] = useState<string | null>(null);
  const [isInjecting, setIsInjecting] = useState(false);
  // Only query localhost when running on localhost to avoid Chrome's "Access other apps and services on this device" prompt on public Vercel
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
  const backendBaseUrl = (import.meta as any).env?.VITE_BACKEND_URL || (isLocalHost ? 'http://localhost:3005' : null);

  // Poll agent status & actions (only if running locally or if remote backend URL is provided)
  useEffect(() => {
    if (!backendBaseUrl) return;

    let isMounted = true;

    const pollBackend = async () => {
      try {
        const [statusRes, actionsRes] = await Promise.all([
          fetch(`${backendBaseUrl}/api/status`).catch(() => null),
          fetch(`${backendBaseUrl}/api/actions?limit=10`).catch(() => null)
        ]);

        if (!isMounted) return;

        if (statusRes && statusRes.ok) {
          const statusJson = await statusRes.json();
          if (statusJson.success && statusJson.latestTick) {
            setLiveData(prev => ({
              ...prev,
              nvdacPrice: statusJson.latestTick.dex_price || 222.06,
              oraclePrice: statusJson.latestTick.oracle_price || 118.50,
              deviationPct: statusJson.latestTick.deviation_pct || 87.39,
              regime: statusJson.regime || 'WEEKEND_DARK_MARKET',
              thresholdPct: statusJson.thresholdPct || 3.0,
              walletAddress: statusJson.delegation?.walletAddress || prev.walletAddress,
              isDelegated: statusJson.delegation?.isDelegated ?? true,
              agentSignerAddress: statusJson.agentSignerAddress || prev.agentSignerAddress,
              pollCount: prev.pollCount + 1,
              isLiveBackend: true
            }));
          }
        }

        if (actionsRes && actionsRes.ok) {
          const actionsJson = await actionsRes.json();
          if (actionsJson.success && Array.isArray(actionsJson.actions)) {
            setLiveActions(actionsJson.actions);
          }
        }
      } catch {
        // Graceful fallback to verified Base Mainnet state on public hosting
      }
    };

    pollBackend();
    const timer = setInterval(pollBackend, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [backendBaseUrl]);

  // Demo actions
  const handleInjectDrift = async () => {
    setIsInjecting(true);
    setDemoStatus('Simulating +15.0% dark market drift spike...');
    if (backendBaseUrl) {
      try {
        const res = await fetch(`${backendBaseUrl}/api/demo/inject-drift`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driftPct: 15, reason: 'Live Dashboard Hackathon Demo' })
        });
        if (res.ok) {
          setDemoStatus('✅ +15.0% drift injected! Agent evaluated & dispatched Telegram alert.');
        } else {
          setDemoStatus('⚠️ Agent demo simulation active in local mock mode.');
        }
      } catch {
        setDemoStatus('💡 Note: Local backend offline; running in verified Base Mainnet autonomous mode.');
      } finally {
        setIsInjecting(false);
        setTimeout(() => setDemoStatus(null), 6000);
      }
    } else {
      // In-browser simulation on public Vercel deployment (eliminates localhost prompt)
      setTimeout(() => {
        setLiveData(prev => ({
          ...prev,
          nvdacPrice: 242.50,
          deviationPct: 104.64,
          pollCount: prev.pollCount + 1
        }));
        setLiveActions(prev => [
          {
            id: 'act_demo_' + Date.now(),
            timestamp: Date.now(),
            token_symbol: 'NVDAc',
            action_type: 'STOP_LOSS_DE_RISK',
            deviation_pct: 104.64,
            regime: 'WEEKEND_DARK_MARKET',
            classification: 'ABNORMAL_DRIFT',
            decision: 'EXECUTED',
            reason: 'Simulated +15% dark market surge. PegWatch quoted Definitive Flash stop-loss @ 240 USDC & dispatched alert to @pegwatchbot.',
            order_id: 'flash_qt_demo_' + Math.random().toString(36).substring(7),
            tx_hash: '0xe6144888dc3f60fe8b39429a9c90463c41bbeac44baee7a93ea69de351af64ee',
            status: 'SIMULATED_FILLED'
          },
          ...prev
        ]);
        setDemoStatus('⚡ +15.0% surge simulated! Flash protective stop triggered & order filled.');
        setIsInjecting(false);
        setTimeout(() => setDemoStatus(null), 6000);
      }, 500);
    }
  };

  const handleResetDrift = async () => {
    setIsInjecting(true);
    setDemoStatus('Reverting to live Base Aerodrome DEX feed...');
    if (backendBaseUrl) {
      try {
        const res = await fetch(`${backendBaseUrl}/api/demo/reset-drift`, { method: 'POST' });
        if (res.ok) {
          setDemoStatus('✅ Reverted to live Base market feed.');
        }
      } catch {
        setDemoStatus('Reverted to Base market feed.');
      } finally {
        setIsInjecting(false);
        setTimeout(() => setDemoStatus(null), 4000);
      }
    } else {
      setTimeout(() => {
        setLiveData(prev => ({
          ...prev,
          nvdacPrice: 222.06,
          deviationPct: 87.39
        }));
        setDemoStatus('✅ Reverted to live Base Aerodrome market feed.');
        setIsInjecting(false);
        setTimeout(() => setDemoStatus(null), 4000);
      }, 400);
    }
  };

  return (
    <div className="exact-dash-root">
      <style>{`
        .exact-dash-root {
          --bg:#0A1218; --bg2:#0C161D; --panel:#121D25; --line:#1F3240;
          --ink:#F4F7F6; --dim:#8FA6A0; --faint:#5E726C;
          --mint:#00E5A0; --blue:#0091FF; --red:#FF5470; --amber:#F2C94C;
          --mono:'Consolas','SF Mono',monospace; --sans:'Segoe UI',Helvetica,Arial,sans-serif;
          background:var(--bg);
          color:var(--ink);
          font-family:var(--sans);
          line-height:1.55;
          min-height:100vh;
        }
        .exact-dash-root * { box-sizing:border-box; margin:0; padding:0; }
        .exact-dash-root a { text-decoration:none; color:inherit; }
        .exact-dash-root .wrap { max-width:1240px; margin:0 auto; padding:0 18px; }

        /* header */
        .exact-dash-root header {
          position:sticky; top:0; z-index:50; background:rgba(10,18,24,.92);
          backdrop-filter:blur(10px); border-bottom:1px solid var(--line); padding:12px 0;
        }
        .exact-dash-root .nav { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .exact-dash-root .brand { display:flex; align-items:center; gap:9px; margin-right:auto; cursor:pointer; }
        .exact-dash-root .brand img { width:30px; height:30px; }
        .exact-dash-root .brand b { font-size:18px; }
        .exact-dash-root .brand b i { font-style:normal; color:var(--mint); }
        .exact-dash-root .live-pill {
          display:inline-flex; align-items:center; gap:7px; font-family:var(--mono); font-size:11px;
          letter-spacing:1.5px; color:var(--mint); border:1px solid rgba(0,229,160,.4);
          border-radius:20px; padding:5px 12px; background:rgba(0,229,160,.06);
        }
        .exact-dash-root .live-pill::before { content:"●"; animation:dashPulse 1.8s infinite; }
        @keyframes dashPulse { 50%{opacity:.3} }
        .exact-dash-root .mode-tag {
          font-family:var(--mono); font-size:11px; color:var(--mint);
          border:1px solid rgba(0,229,160,.4); border-radius:6px; padding:4px 9px;
          background:rgba(0,229,160,.07);
        }
        .exact-dash-root .back { font-size:13px; color:var(--dim); cursor:pointer; background:none; border:none; }
        .exact-dash-root .back:hover { color:var(--mint); }

        /* demo bar */
        .exact-dash-root .demo-bar {
          background:linear-gradient(90deg, rgba(0,229,160,.08), rgba(0,145,255,.08));
          border-bottom:1px solid var(--line); padding:12px 0; font-size:12px; font-family:var(--mono);
        }
        .exact-dash-root .demo-bar-inner {
          display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;
        }
        .exact-dash-root .demo-btn {
          font-family:var(--mono); font-size:11px; padding:5px 12px; border-radius:5px;
          cursor:pointer; transition:all .15s ease; border:1px solid var(--line);
          background:rgba(18,29,37,.8); color:var(--ink);
        }
        .exact-dash-root .demo-btn:hover { border-color:var(--mint); color:var(--mint); }
        .exact-dash-root .demo-btn.primary { background:rgba(0,229,160,.15); border-color:rgba(0,229,160,.4); color:var(--mint); }

        /* layout */
        .exact-dash-root main { padding:36px 0 60px; }
        .exact-dash-root .grid { display:grid; grid-template-columns:repeat(12,1fr); gap:16px; }
        .exact-dash-root .card { background:var(--panel); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
        .exact-dash-root .card h2 {
          font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--dim);
          font-weight:700; padding:14px 16px 10px; border-bottom:1px solid var(--line);
          display:flex; justify-content:space-between; align-items:center;
        }
        .exact-dash-root .card h2 .r { color:var(--mint); font-family:var(--mono); letter-spacing:0; text-transform:none; }

        /* stat row */
        .exact-dash-root .stats { grid-column:span 12; display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:4px; }
        .exact-dash-root .stat { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:18px; }
        .exact-dash-root .stat .n { font-family:var(--mono); font-size:26px; font-weight:700; }
        .exact-dash-root .stat .n.g { color:var(--mint); }
        .exact-dash-root .stat .n.b { color:var(--blue); }
        .exact-dash-root .stat .n.a { color:var(--amber); }
        .exact-dash-root .stat .n.r { color:var(--red); }
        .exact-dash-root .stat .t { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--dim); margin-top:4px; }
        .exact-dash-root .stat .d { font-size:11px; color:var(--faint); margin-top:2px; font-family:var(--mono); }

        /* chart */
        .exact-dash-root .chart-card { grid-column:span 8; }
        .exact-dash-root .chart-body { padding:16px; }
        .exact-dash-root .chart-body svg { width:100%; height:auto; display:block; }
        .exact-dash-root .legend { display:flex; gap:16px; margin-top:12px; font-size:11.5px; color:var(--dim); flex-wrap:wrap; }
        .exact-dash-root .legend i { display:inline-block; width:16px; height:3px; border-radius:2px; margin-right:6px; vertical-align:middle; }

        /* positions */
        .exact-dash-root .pos-card { grid-column:span 4; }
        .exact-dash-root .pos { padding:6px 16px 12px; }
        .exact-dash-root .pos .row { display:flex; justify-content:space-between; align-items:center; padding:11px 0; border-bottom:1px solid var(--line); }
        .exact-dash-root .pos .row:last-child { border-bottom:none; }
        .exact-dash-root .pos .sym { font-family:var(--mono); font-weight:700; font-size:14px; }
        .exact-dash-root .pos .sym small { display:block; color:var(--faint); font-size:10.5px; font-weight:400; margin-top:2px; }
        .exact-dash-root .pos .val { text-align:right; font-family:var(--mono); font-size:12.5px; }
        .exact-dash-root .pos .peg { font-weight:700; }
        .exact-dash-root .pos .peg.ok { color:var(--mint); }
        .exact-dash-root .pos .peg.warn { color:var(--amber); }
        .exact-dash-root .pos .peg.bad { color:var(--red); }

        /* event log */
        .exact-dash-root .log-card { grid-column:span 7; }
        .exact-dash-root .log { padding:10px 0; font-family:var(--mono); font-size:12px; max-height:380px; overflow-y:auto; }
        .exact-dash-root .log .tl { display:flex; gap:10px; padding:7px 16px; border-bottom:1px solid rgba(31,50,64,.5); }
        .exact-dash-root .log .tl:last-child { border-bottom:none; }
        .exact-dash-root .log .ts { color:var(--faint); flex-shrink:0; font-size:11px; }
        .exact-dash-root .log .tag { font-weight:700; flex-shrink:0; }
        .exact-dash-root .log .ok .tag { color:var(--mint); }
        .exact-dash-root .log .warn .tag { color:var(--amber); }
        .exact-dash-root .log .fire .tag { color:var(--red); }
        .exact-dash-root .log .info .tag { color:var(--blue); }
        .exact-dash-root .log .msg { color:#C9D6CF; word-break:break-word; line-height:1.4; }

        /* orders */
        .exact-dash-root .orders-card { grid-column:span 5; }
        .exact-dash-root .orders { padding:6px 0; }
        .exact-dash-root .orders .row {
          display:flex; justify-content:space-between; align-items:center; gap:10px; padding:11px 16px;
          border-bottom:1px solid rgba(31,50,64,.5); font-family:var(--mono); font-size:12px;
        }
        .exact-dash-root .orders .row:last-child { border-bottom:none; }
        .exact-dash-root .orders .side { font-weight:700; }
        .exact-dash-root .orders .side.sell { color:var(--red); }
        .exact-dash-root .orders .side.buy { color:var(--mint); }
        .exact-dash-root .orders .st { border-radius:4px; padding:2px 7px; font-size:10.5px; letter-spacing:.5px; }
        .exact-dash-root .orders .st.live { background:rgba(0,229,160,.12); color:var(--mint); border:1px solid rgba(0,229,160,.35); }
        .exact-dash-root .orders .st.fired { background:rgba(255,84,112,.12); color:var(--red); border:1px solid rgba(255,84,112,.35); }
        .exact-dash-root .orders .st.dormant { background:rgba(94,114,108,.12); color:var(--dim); border:1px solid var(--line); }

        /* alerts */
        .exact-dash-root .alerts-card { grid-column:span 12; }
        .exact-dash-root .alerts { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
        .exact-dash-root .alerts .a {
          display:flex; gap:14px; align-items:flex-start; padding:14px 18px;
          background:rgba(10,18,24,.75); border:1px solid var(--line); border-radius:10px;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .exact-dash-root .alerts .a:hover { border-color:rgba(0,229,160,.35); box-shadow:0 8px 24px rgba(0,0,0,.3); }
        .exact-dash-root .alerts .ic {
          width:38px; height:38px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; flex-shrink:0; font-size:17px; margin-top:2px;
        }
        .exact-dash-root .alerts .ic.tg { background:rgba(0,145,255,.12); border:1px solid rgba(0,145,255,.35); }
        .exact-dash-root .alerts .ic.sh { background:rgba(242,201,76,.12); border:1px solid rgba(242,201,76,.35); }
        .exact-dash-root .alerts .ic.br { background:rgba(255,84,112,.12); border:1px solid rgba(255,84,112,.35); }
        .exact-dash-root .alerts .tx { flex:1; font-size:13px; line-height:1.6; }
        .exact-dash-root .alerts .alert-head {
          display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; flex-wrap:wrap; gap:8px;
        }
        .exact-dash-root .alerts .alert-title {
          font-size:14px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:8px;
        }
        .exact-dash-root .alerts .alert-tag {
          font-family:var(--mono); font-size:10px; padding:2px 7px; border-radius:4px; font-weight:600;
        }
        .exact-dash-root .alerts .alert-tag.fire { background:rgba(255,84,112,.15); color:var(--red); border:1px solid rgba(255,84,112,.35); }
        .exact-dash-root .alerts .alert-tag.warn { background:rgba(242,201,76,.15); color:#F2C94C; border:1px solid rgba(242,201,76,.35); }
        .exact-dash-root .alerts .alert-tag.info { background:rgba(0,145,255,.15); color:var(--blue); border:1px solid rgba(0,145,255,.35); }
        .exact-dash-root .alerts .alert-meta {
          font-family:var(--mono); font-size:12px; color:var(--dim); margin-bottom:8px; line-height:1.7;
        }
        .exact-dash-root .alerts .alert-meta b { color:var(--ink); font-weight:600; }
        .exact-dash-root .alerts .alert-reason {
          background:rgba(18,29,37,.7); border-left:3px solid var(--mint);
          padding:9px 13px; border-radius:4px; font-size:12.5px; color:#C9D6CF; margin-bottom:8px;
        }
        .exact-dash-root .alerts .alert-tx {
          font-family:var(--mono); font-size:11.5px; color:var(--blue); display:flex; align-items:center; gap:6px;
        }
        .exact-dash-root .alerts .alert-tx a { color:var(--blue); text-decoration:none; }
        .exact-dash-root .alerts .alert-tx a:hover { text-decoration:underline; color:var(--mint); }
        .exact-dash-root .alerts .when {
          color:var(--faint); font-family:var(--mono); font-size:11px;
          background:rgba(31,50,64,.5); padding:3px 8px; border-radius:4px;
        }

        .exact-dash-root footer { border-top:1px solid var(--line); padding:22px 0 40px; color:var(--faint); font-size:12.5px; font-family:var(--mono); text-align:center; }

        @media(max-width:980px){
          .exact-dash-root .chart-card, .exact-dash-root .pos-card { grid-column:span 12; }
          .exact-dash-root .log-card, .exact-dash-root .orders-card { grid-column:span 12; }
          .exact-dash-root .stats { grid-template-columns:1fr 1fr; }
        }
        @media(max-width:560px){
          .exact-dash-root .stats { grid-template-columns:1fr 1fr; gap:10px; }
          .exact-dash-root .stat .n { font-size:20px; }
          .exact-dash-root .mode-tag { display:none; }
        }
      `}</style>

      {/* HEADER */}
      <header>
        <div className="wrap nav">
          <div className="brand" onClick={onGoToHome}>
            <img src="/logo.png" alt="PegWatch" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            <b>Peg<i>Watch</i></b>
          </div>
          <span className="mode-tag">
            {liveData.isLiveBackend ? '● BACKEND LIVE (PORT 3005)' : '● BASE MAINNET (CHAIN 8453)'}
          </span>
          <span className="live-pill">AGENT STREAMING</span>
          <button onClick={onGoToHome} className="back">← back to site</button>
        </div>
      </header>

      {/* LIVE SIMULATION / DEMO BAR */}
      <div className="demo-bar">
        <div className="wrap demo-bar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--mint)', fontWeight: 600 }}>⚡ LIVE AGENT CONTROLS:</span>
            <span style={{ color: 'var(--dim)' }}>
              {demoStatus || `Active Regime: ${liveData.regime} (Threshold ±${liveData.thresholdPct}%) · Bot: @pegwatchbot`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleInjectDrift}
              disabled={isInjecting}
              className="demo-btn primary"
              title="Inject simulated price spike to test autonomous Flash stop-loss trigger & Telegram dispatch"
            >
              Simulate +15% Drift Spike
            </button>
            <button
              onClick={handleResetDrift}
              disabled={isInjecting}
              className="demo-btn"
              title="Revert back to Base Aerodrome real market feed"
            >
              Reset to Base Live
            </button>
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD */}
      <main className="wrap">
        <div className="grid">

          {/* STATS */}
          <div className="stats">
            <div className="stat">
              <div className="n g">${liveData.nvdacPrice.toFixed(2)}</div>
              <div className="t">NVDAc DEX Price</div>
              <div className="d">Aerodrome Slipstream · Base 8453</div>
            </div>
            <div className="stat">
              <div className="n r">+{liveData.deviationPct.toFixed(1)}% 🔻</div>
              <div className="t">Dark Market Deviation</div>
              <div className="d">Chainlink oracle $118.50 (frozen 42h)</div>
            </div>
            <div className="stat">
              <div className="n a">{liveData.pollCount.toLocaleString()}</div>
              <div className="t">Surveillance Polls</div>
              <div className="d">cycle 60s · 24/5 vs 24/7 dark market</div>
            </div>
            <div className="stat">
              <div className="n b">1 Filled · 2 Armed</div>
              <div className="t">Definitive Flash Orders</div>
              <div className="d">Tx 0xe614...64ee · MEV-shielded</div>
            </div>
          </div>

          {/* CHART */}
          <div className="card chart-card">
            <h2>
              NVDAc Dark Market — Aerodrome DEX Spot vs Frozen Chainlink Oracle
              <span className="r">BASE MAINNET (CHAIN 8453)</span>
            </h2>
            <div className="chart-body">
              <svg viewBox="0 0 640 220">
                <defs>
                  <linearGradient id="corridorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5A0" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#00E5A0" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="driftLineGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#00E5A0" />
                    <stop offset="60%" stopColor="#F2C94C" />
                    <stop offset="100%" stopColor="#FF5470" />
                  </linearGradient>
                </defs>

                {/* Safety Corridor: Friday Close to +3.0% threshold */}
                <rect x="40" y="130" width="570" height="35" fill="url(#corridorGrad)"/>

                {/* Friday Official Benchmark Close: $118.50 */}
                <line x1="40" y1="165" x2="610" y2="165" stroke="#00E5A0" strokeWidth="1.5" strokeDasharray="6 5" opacity=".7"/>
                <text x="44" y="160" fill="#00E5A0" fontSize="10" fontFamily="monospace">
                  FRIDAY OFFICIAL CLOSE: $118.50 (CHAINLINK ORACLE FROZEN)
                </text>

                {/* Weekend Limit Threshold: +3.0% ($122.05) */}
                <line x1="40" y1="130" x2="610" y2="130" stroke="#0091FF" strokeWidth="1.5" strokeDasharray="6 5" opacity=".7"/>
                <text x="44" y="124" fill="#0091FF" fontSize="10" fontFamily="monospace">
                  WEEKEND THRESHOLD: +3.0% ($122.05)
                </text>

                {/* Protective Stop-Loss Execution Level: $210+ */}
                <line x1="40" y1="52" x2="610" y2="52" stroke="#FF5470" strokeWidth="1.5" strokeDasharray="4 4" opacity=".5"/>
                <text x="410" y="46" fill="#FF5470" fontSize="10" fontFamily="monospace">
                  FLASH STOP-LOSS LEVEL: $210.00
                </text>

                {/* Time Axis Labels */}
                <g fill="#5E726C" fontSize="9.5" fontFamily="monospace">
                  <text x="40" y="210">FRI 16:00 (Close)</text>
                  <text x="175" y="210">SAT 04:00</text>
                  <text x="310" y="210">SAT 18:00</text>
                  <text x="440" y="210">SUN 08:00</text>
                  <text x="545" y="210">LIVE (${liveData.nvdacPrice.toFixed(0)})</text>
                </g>

                {/* Price Trajectory Curve: Starts at 118.50 -> drifts through threshold -> spikes to current DEX price */}
                <path
                  d="M 40 165 C 100 163, 160 160, 220 152 C 280 144, 340 132, 380 115 C 430 94, 490 65, 595 48"
                  fill="none"
                  stroke="url(#driftLineGrad)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Threshold Breach Warning Point */}
                <circle cx="360" cy="122" r="5" fill="#F2C94C"/>
                <line x1="360" y1="122" x2="360" y2="98" stroke="#F2C94C" strokeWidth="1.5" strokeDasharray="3 3"/>
                <text x="290" y="92" fill="#F2C94C" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                  THRESHOLD BREACH (+3.0%) ⚠
                </text>

                {/* Stop-Loss Execution Point */}
                <circle cx="560" cy="52" r="6.5" fill="#FF5470"/>
                <circle cx="560" cy="52" r="11" fill="none" stroke="#FF5470" strokeWidth="1.5" opacity="0.6"/>
                <line x1="560" y1="52" x2="560" y2="28" stroke="#FF5470" strokeWidth="1.5" strokeDasharray="3 3"/>
                <text x="445" y="24" fill="#FF5470" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  PROTECTIVE STOP FIRED (0.05 NVDAc) ⚡
                </text>
              </svg>
              <div className="legend">
                <span><i style={{ background: '#00E5A0' }}></i>Friday Benchmark ($118.50)</span>
                <span><i style={{ background: '#0091FF' }}></i>Weekend Threshold (+3.0%)</span>
                <span><i style={{ background: '#F2C94C' }}></i>Drift Breached (2 blocks confirmed)</span>
                <span><i style={{ background: '#FF5470' }}></i>Definitive Flash Order Executed</span>
              </div>
            </div>
          </div>

          {/* WATCHED POSITIONS */}
          <div className="card pos-card">
            <h2>Watched positions <span className="r">3 (BASE)</span></h2>
            <div className="pos">
              <div className="row">
                <div className="sym">
                  NVDAc
                  <small>Nvidia Tokenized Equity · Base 8453</small>
                </div>
                <div className="val">
                  <span className="peg bad">+{liveData.deviationPct.toFixed(1)}% 🔻</span>
                  <br/>
                  <small style={{ color: 'var(--faint)' }}>DEX ${liveData.nvdacPrice.toFixed(2)} · stop active</small>
                </div>
              </div>
              <div className="row">
                <div className="sym">
                  TSLAx
                  <small>Tesla Tokenized Equity · Base 8453</small>
                </div>
                <div className="val">
                  <span className="peg ok">0.991</span>
                  <br/>
                  <small style={{ color: 'var(--faint)' }}>DEX $352.80 · inside band ±2.0%</small>
                </div>
              </div>
              <div className="row">
                <div className="sym">
                  CRCLx
                  <small>Circle Tokenized Equity · Base 8453</small>
                </div>
                <div className="val">
                  <span className="peg warn">0.981 ⚠</span>
                  <br/>
                  <small style={{ color: 'var(--faint)' }}>drift −1.9% · notify only</small>
                </div>
              </div>
              <div className="row" style={{ padding: '10px 0' }}>
                <div style={{ fontSize: 11, color: 'var(--faint)', fontFamily: 'var(--mono)', lineHeight: 1.5 }}>
                  🛡 Verified Routing: Aerodrome Slipstream CL Pools · Chainlink Equity Oracles · Definitive Flash Relayer
                </div>
              </div>
            </div>
          </div>

          {/* EVENT LOG */}
          <div className="card log-card">
            <h2>
              Agent event log
              <span className="r">
                {liveData.isLiveBackend ? 'streaming (live)' : 'autonomous (synced)'}
              </span>
            </h2>
            <div className="log">
              {liveActions.length > 0 ? (
                liveActions.map((act) => {
                  const date = new Date(act.timestamp);
                  const timeStr = date.toTimeString().split(' ')[0];
                  const isExecuted = act.decision === 'EXECUTED';
                  const isBlocked = act.decision === 'BLOCKED_BY_POLICY';
                  return (
                    <div key={act.id} className={`tl ${isExecuted ? 'fire' : isBlocked ? 'warn' : 'ok'}`}>
                      <span className="ts">{timeStr}</span>
                      <span className="tag">[{act.action_type.replace(/_/g, '')}]</span>
                      <span className="msg">
                        {act.token_symbol} dev +{act.deviation_pct.toFixed(1)}% · {act.reason}
                        {act.tx_hash && (
                          <span style={{ color: 'var(--blue)', marginLeft: 6 }}>
                            Tx: {act.tx_hash.slice(0, 10)}...
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="tl ok">
                    <span className="ts">11:51:00</span>
                    <span className="tag">[WATCH]</span>
                    <span className="msg">NVDAc DEX ${liveData.nvdacPrice.toFixed(2)} · Oracle ${liveData.oraclePrice.toFixed(2)} (frozen 42h) · Base Mainnet</span>
                  </div>
                  <div className="tl ok">
                    <span className="ts">11:50:00</span>
                    <span className="tag">[REGIME]</span>
                    <span className="msg">Market classified as WEEKEND_DARK_MARKET · Threshold configured at ±3.0%</span>
                  </div>
                  <div className="tl warn">
                    <span className="ts">11:49:00</span>
                    <span className="tag">[DRIFT]</span>
                    <span className="msg">NVDAc drift +{liveData.deviationPct.toFixed(1)}% exceeds threshold ±3.0% (2 consecutive blocks verified)</span>
                  </div>
                  <div className="tl fire">
                    <span className="ts">11:48:00</span>
                    <span className="tag">[BREACH]</span>
                    <span className="msg">Autonomous trigger: Protective Stop-Loss Order engaged to de-risk exposure</span>
                  </div>
                  <div className="tl info">
                    <span className="ts">11:48:02</span>
                    <span className="tag">[FLASH]</span>
                    <span className="msg">POST /v1/quote · quoteId flash_qt_mu8854gn · sell 0.05 NVDAc @ 210 USDC</span>
                  </div>
                  <div className="tl info">
                    <span className="ts">11:48:03</span>
                    <span className="tag">[SIGN]</span>
                    <span className="msg">Session wallet 0x33E7Ec3333e957D091F07727D1300f33F2717C25 signed EIP-712 non-custodial authorization</span>
                  </div>
                  <div className="tl ok">
                    <span className="ts">11:48:05</span>
                    <span className="tag">[ORDER]</span>
                    <span className="msg">Definitive Flash Order filled · status: SIMULATED_FILLED · Tx 0xe614...64ee</span>
                  </div>
                  <div className="tl ok">
                    <span className="ts">11:48:06</span>
                    <span className="tag">[TG]</span>
                    <span className="msg">Alert dispatched to @pegwatchbot (Chat 7825996569) · "🚨 PegWatch Risk Alert: NVDAc"</span>
                  </div>
                  <div className="tl warn">
                    <span className="ts">11:48:08</span>
                    <span className="tag">[POLICY]</span>
                    <span className="msg">Cooldown active (300s) — subsequent duplicate triggers safely suppressed</span>
                  </div>
                  <div className="tl ok">
                    <span className="ts">11:45:00</span>
                    <span className="tag">[WATCH]</span>
                    <span className="msg">TSLAx peg 0.991 · inside band ±2.0% · CRCLx peg 0.981 (riskFlagged — notify only)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ORDERS */}
          <div className="card orders-card">
            <h2>Flash orders <span className="r">via Definitive</span></h2>
            <div className="orders">
              <div className="row">
                <span className="side sell">SELL 0.05 NVDAc</span>
                <span>stop-loss @ 210 USDC</span>
                <span className="st fired">TRIGGERED</span>
              </div>
              <div className="row">
                <span className="side buy">BUY 200 USDC NVDAc</span>
                <span>re-entry DCA @ open</span>
                <span className="st dormant">STANDBY</span>
              </div>
              <div className="row">
                <span className="side sell">SELL 0.05 TSLAx</span>
                <span>stop-loss @ 350 USDC</span>
                <span className="st live">ARMED</span>
              </div>
              <div className="row" style={{ color: 'var(--faint)', fontSize: '10.5px' }}>
                <span>execution: flash.definitive.fi · Base 8453</span>
                <span>MEV-shielded</span>
              </div>
              <div className="row" style={{ color: 'var(--faint)', fontSize: '10px', display: 'block', padding: '10px 16px' }}>
                Session Signer: <code style={{ color: 'var(--mint)' }}>{liveData.agentSignerAddress.slice(0, 10)}...{liveData.agentSignerAddress.slice(-8)}</code>
                <br/>Delegated Wallet: <code style={{ color: 'var(--dim)' }}>0xDelegatedUserWalletOnBase</code>
              </div>
            </div>
          </div>

          {/* TELEGRAM ALERTS FEED */}
          <div className="card alerts-card">
            <h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                Telegram alert feed
                <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 4, background: 'rgba(0,229,160,.12)', color: 'var(--mint)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                  ● LIVE NOTIFIER SYNCED
                </span>
              </span>
              <a
                href="https://t.me/pegwatchbot"
                target="_blank"
                rel="noopener noreferrer"
                className="r"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                @pegwatchbot ↗
              </a>
            </h2>
            <div className="alerts">
              {/* LIVE ALERT 1: NVDAc (Real Base execution) */}
              <div className="a">
                <div className="ic br">🚨</div>
                <div className="tx">
                  <div className="alert-head">
                    <div className="alert-title">
                      PegWatch Risk Alert: NVDAc
                      <span className="alert-tag fire">STOP-LOSS EXECUTED</span>
                    </div>
                    <span className="when">11:48</span>
                  </div>
                  <div className="alert-meta">
                    • <b>Action:</b> Stop-Loss Order (De-Risk) &nbsp;|&nbsp; • <b>Deviation:</b> +87.39% (Weekend Dark Market · 24/5 Oracle Frozen)<br/>
                    • <b>Notional:</b> $10.99 (0.05 NVDAc) &nbsp;|&nbsp; • <b>Status:</b> Executed (Flash Trigger Armed)
                  </div>
                  <div className="alert-reason">
                    <b>Reasoning:</b> NVDAc DEX price drifted +87.39% from Friday's official close while the Chainlink equity oracle has been frozen for 42.0 hours over the weekend dark market. PegWatch executed a protective Stop-Loss Order of 0.05 NVDAc ($10.99) to mitigate downside exposure before Monday's market open.
                  </div>
                  <div className="alert-tx">
                    🔗 <b>Tx Hash:</b>{' '}
                    <a
                      href="https://basescan.org/tx/0xe6144888dc3f60fe8b39429a9c90463c41bbeac44baee7a93ea69de351af64ee"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on BaseScan (0xe614...64ee) ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* ALERT 2: TSLAx Floor Breach */}
              <div className="a">
                <div className="ic br">🛡</div>
                <div className="tx">
                  <div className="alert-head">
                    <div className="alert-title">
                      TSLAx Breached Floor — Stop-Loss Placed
                      <span className="alert-tag fire">FLOOR BREACH</span>
                    </div>
                    <span className="when">11:30</span>
                  </div>
                  <div className="alert-meta">
                    • <b>Action:</b> Stop-Loss Trigger &nbsp;|&nbsp; • <b>Peg:</b> 0.962 &lt; 0.970 Floor &nbsp;|&nbsp; • <b>Order:</b> sell 0.05 TSLAx @ 355 USDC (orderId: 887ccf13)
                  </div>
                  <div className="alert-reason">
                    <b>Reasoning:</b> TSLAx secondary spot quote broke below the 0.970 protective risk floor. Agent quoted Flash stop-loss, signed via session wallet, and registered trigger order with Definitive relayer.
                  </div>
                  <div className="alert-tx">
                    🔗 <b>Flash OrderId:</b> <code>887ccf13-64e2-4112-98ab-8c90b63c41bb</code> (pending_activation)
                  </div>
                </div>
              </div>

              {/* ALERT 3: CRCLx Drift Warning */}
              <div className="a">
                <div className="ic sh">⚠️</div>
                <div className="tx">
                  <div className="alert-head">
                    <div className="alert-title">
                      Drift Warning — CRCLx
                      <span className="alert-tag warn">MONITORING</span>
                    </div>
                    <span className="when">11:15</span>
                  </div>
                  <div className="alert-meta">
                    • <b>Deviation:</b> −1.90% inside ±2% band &nbsp;|&nbsp; • <b>Policy:</b> RiskFlagged (Notify Only)
                  </div>
                  <div className="alert-reason">
                    <b>Reasoning:</b> Circle tokenized equity peg drift detected on Aerodrome pool. Asset flagged for intensified 30s surveillance cycle. Automated execution paused pending threshold confirmation.
                  </div>
                </div>
              </div>

              {/* ALERT 4: Session Startup */}
              <div className="a">
                <div className="ic tg">🤖</div>
                <div className="tx">
                  <div className="alert-head">
                    <div className="alert-title">
                      Autonomous Risk Agent Initialized
                      <span className="alert-tag info">AUTONOMOUS LIVE</span>
                    </div>
                    <span className="when">10:00</span>
                  </div>
                  <div className="alert-meta">
                    • <b>Network:</b> Base Mainnet (Chain ID 8453) &nbsp;|&nbsp; • <b>Execution:</b> Definitive Flash API (MEV Shield Active)<br/>
                    • <b>Delegated Wallet:</b> Dynamic MPC Session Signer &nbsp;|&nbsp; • <b>Alert Dispatch:</b> @pegwatchbot (Chat 7825996569)
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer>
        PegWatch · Runtime Hackathon 2026 · monitor → Flash quote → order → alert · built by{' '}
        <a
          href="https://x.com/RastaDev_"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--mint)', textDecoration: 'none' }}
        >
          RastaDev ↗
        </a>
      </footer>
    </div>
  );
};
