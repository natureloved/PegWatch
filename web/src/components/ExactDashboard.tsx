import React from 'react';

interface ExactDashboardProps {
  onGoToHome: () => void;
}

export const ExactDashboard: React.FC<ExactDashboardProps> = ({ onGoToHome }) => {
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
          font-family:var(--mono); font-size:11px; color:var(--amber);
          border:1px solid rgba(242,201,76,.4); border-radius:6px; padding:4px 9px;
          background:rgba(242,201,76,.07);
        }
        .exact-dash-root .mode-tag b { color:var(--amber); }
        .exact-dash-root .back { font-size:13px; color:var(--dim); cursor:pointer; background:none; border:none; }
        .exact-dash-root .back:hover { color:var(--mint); }

        /* layout */
        .exact-dash-root main { padding:22px 0 60px; }
        .exact-dash-root .grid { display:grid; grid-template-columns:repeat(12,1fr); gap:16px; }
        .exact-dash-root .card { background:var(--panel); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
        .exact-dash-root .card h2 {
          font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--dim);
          font-weight:700; padding:14px 16px 10px; border-bottom:1px solid var(--line);
          display:flex; justify-content:space-between; align-items:center;
        }
        .exact-dash-root .card h2 .r { color:var(--mint); font-family:var(--mono); letter-spacing:0; text-transform:none; }

        /* stat row */
        .exact-dash-root .stats { grid-column:span 12; display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .exact-dash-root .stat { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:18px; }
        .exact-dash-root .stat .n { font-family:var(--mono); font-size:26px; font-weight:700; }
        .exact-dash-root .stat .n.g { color:var(--mint); }
        .exact-dash-root .stat .n.b { color:var(--blue); }
        .exact-dash-root .stat .n.a { color:var(--amber); }
        .exact-dash-root .stat .t { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--dim); margin-top:4px; }
        .exact-dash-root .stat .d { font-size:11px; color:var(--faint); margin-top:2px; font-family:var(--mono); }

        /* chart */
        .exact-dash-root .chart-card { grid-column:span 8; }
        .exact-dash-root .chart-body { padding:16px; }
        .exact-dash-root .chart-body svg { width:100%; height:auto; display:block; }
        .exact-dash-root .legend { display:flex; gap:16px; margin-top:10px; font-size:11.5px; color:var(--dim); flex-wrap:wrap; }
        .exact-dash-root .legend i { display:inline-block; width:18px; height:3px; border-radius:2px; margin-right:6px; vertical-align:middle; }

        /* positions */
        .exact-dash-root .pos-card { grid-column:span 4; }
        .exact-dash-root .pos { padding:6px 16px 12px; }
        .exact-dash-root .pos .row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--line); }
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
        .exact-dash-root .log { padding:10px 0; font-family:var(--mono); font-size:12.3px; }
        .exact-dash-root .log .tl { display:flex; gap:10px; padding:7px 16px; border-bottom:1px solid rgba(31,50,64,.5); }
        .exact-dash-root .log .tl:last-child { border-bottom:none; }
        .exact-dash-root .log .ts { color:var(--faint); flex-shrink:0; }
        .exact-dash-root .log .tag { font-weight:700; flex-shrink:0; }
        .exact-dash-root .log .ok .tag { color:var(--mint); }
        .exact-dash-root .log .warn .tag { color:var(--amber); }
        .exact-dash-root .log .fire .tag { color:var(--red); }
        .exact-dash-root .log .info .tag { color:var(--blue); }
        .exact-dash-root .log .msg { color:#C9D6CF; word-break:break-word; }

        /* orders */
        .exact-dash-root .orders-card { grid-column:span 5; }
        .exact-dash-root .orders { padding:6px 0; }
        .exact-dash-root .orders .row {
          display:flex; justify-content:space-between; gap:10px; padding:11px 16px;
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
        .exact-dash-root .alerts { padding:6px 0; }
        .exact-dash-root .alerts .a { display:flex; gap:12px; align-items:flex-start; padding:11px 16px; border-bottom:1px solid rgba(31,50,64,.5); }
        .exact-dash-root .alerts .a:last-child { border-bottom:none; }
        .exact-dash-root .alerts .ic {
          width:34px; height:34px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; flex-shrink:0; font-size:15px;
        }
        .exact-dash-root .alerts .ic.tg { background:rgba(0,145,255,.12); border:1px solid rgba(0,145,255,.35); }
        .exact-dash-root .alerts .ic.sh { background:rgba(0,229,160,.1); border:1px solid rgba(0,229,160,.3); }
        .exact-dash-root .alerts .ic.br { background:rgba(255,84,112,.1); border:1px solid rgba(255,84,112,.3); }
        .exact-dash-root .alerts .tx { font-size:13.5px; }
        .exact-dash-root .alerts .tx b { display:block; font-size:13px; }
        .exact-dash-root .alerts .tx span { color:var(--dim); font-size:12.5px; font-family:var(--mono); }
        .exact-dash-root .alerts .when { margin-left:auto; color:var(--faint); font-family:var(--mono); font-size:11px; flex-shrink:0; }

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
            <svg viewBox="0 0 512 512" style={{ width: 30, height: 30 }}>
              <defs>
                <linearGradient id="exactDashShieldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#00E5A0"/>
                  <stop offset="1" stopColor="#0091FF"/>
                </linearGradient>
              </defs>
              <path d="M256 40 L432 104 V268 C432 376 356 446 256 476 C156 446 80 376 80 268 V104 Z"
                    fill="none" stroke="url(#exactDashShieldGrad)" strokeWidth="22" strokeLinejoin="round"/>
              <line x1="140" y1="212" x2="372" y2="212" stroke="#00E5A0" strokeWidth="14" strokeLinecap="round"/>
              <line x1="140" y1="300" x2="372" y2="300" stroke="#0091FF" strokeWidth="14" strokeLinecap="round"/>
              <path d="M150 256 C185 220 215 292 250 256 C280 226 300 190 330 172"
                    fill="none" stroke="#F4F7F6" strokeWidth="16" strokeLinecap="round"/>
              <circle cx="330" cy="172" r="18" fill="#FF5470"/>
            </svg>
            <b>Peg<i>Watch</i></b>
          </div>
          <span className="mode-tag">DEMO_MODE=<b>true</b></span>
          <span className="live-pill">AGENT LIVE</span>
          <button onClick={onGoToHome} className="back">← back to site</button>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <main className="wrap">
        <div className="grid">

          {/* STATS */}
          <div className="stats">
            <div className="stat">
              <div className="n g">0.991</div>
              <div className="t">TSLAx peg</div>
              <div className="d">band ±2% · floor 0.97</div>
            </div>
            <div className="stat">
              <div className="n b">17</div>
              <div className="t">Polls / last hr</div>
              <div className="d">interval 60s</div>
            </div>
            <div className="stat">
              <div className="n a">1</div>
              <div className="t">Drift warnings</div>
              <div className="d">last 24h</div>
            </div>
            <div className="stat">
              <div className="n">1</div>
              <div className="t">Breaches handled</div>
              <div className="d">stop-loss placed</div>
            </div>
          </div>

          {/* CHART */}
          <div className="card chart-card">
            <h2>TSLAx / USDC — peg vs band <span className="r">SOLANA</span></h2>
            <div className="chart-body">
              <svg viewBox="0 0 640 220">
                <rect x="30" y="46" width="590" height="70" fill="#00E5A0" opacity="0.05"/>
                <line x1="30" y1="46" x2="620" y2="46" stroke="#00E5A0" strokeWidth="1.6" strokeDasharray="7 6" opacity=".8"/>
                <line x1="30" y1="116" x2="620" y2="116" stroke="#0091FF" strokeWidth="1.6" strokeDasharray="7 6" opacity=".8"/>
                <text x="34" y="38" fill="#00E5A0" fontSize="10.5" fontFamily="monospace">1.02 — UPPER BAND</text>
                <text x="34" y="132" fill="#0091FF" fontSize="10.5" fontFamily="monospace">0.98</text>
                <text x="560" y="132" fill="#FF5470" fontSize="10.5" fontFamily="monospace">FLOOR 0.97</text>
                {/* time labels */}
                <g fill="#5E726C" fontSize="9.5" fontFamily="monospace">
                  <text x="30" y="212">23:00</text>
                  <text x="170" y="212">01:00</text>
                  <text x="310" y="212">02:30</text>
                  <text x="450" y="212">03:00</text>
                  <text x="580" y="212">03:05</text>
                </g>
                {/* peg line: stable -> drift -> breach */}
                <path d="M30 78 C90 74 130 84 190 80 C250 76 300 84 350 92 C390 98 420 110 460 128 C500 146 540 168 575 186"
                      fill="none" stroke="#E8F0EC" strokeWidth="3" strokeLinecap="round"/>
                {/* drift warning marker */}
                <circle cx="460" cy="128" r="5.5" fill="#F2C94C"/>
                <line x1="460" y1="128" x2="460" y2="112" stroke="#F2C94C" strokeWidth="1.5" strokeDasharray="3 4"/>
                <text x="404" y="106" fill="#F2C94C" fontSize="10" fontFamily="monospace">DRIFT ⚠</text>
                {/* breach marker */}
                <circle cx="575" cy="186" r="7" fill="#FF5470"/>
                <line x1="575" y1="186" x2="575" y2="166" stroke="#FF5470" strokeWidth="1.5" strokeDasharray="3 4"/>
                <text x="520" y="160" fill="#FF5470" fontSize="10" fontFamily="monospace">BREACH → STOP FIRED</text>
              </svg>
              <div className="legend">
                <span><i style={{ background: '#00E5A0' }}></i>upper band 1.02</span>
                <span><i style={{ background: '#0091FF' }}></i>lower band 0.98 / floor 0.97</span>
                <span><i style={{ background: '#F2C94C' }}></i>drift warning</span>
                <span><i style={{ background: '#FF5470' }}></i>breach — protective action</span>
              </div>
            </div>
          </div>

          {/* WATCHED POSITIONS */}
          <div className="card pos-card">
            <h2>Watched positions <span className="r">3</span></h2>
            <div className="pos">
              <div className="row">
                <div className="sym">TSLAx<small>Tesla xStock · Solana</small></div>
                <div className="val"><span className="peg bad">0.962 🔻</span><br/><small style={{ color: 'var(--faint)' }}>breached · stop active</small></div>
              </div>
              <div className="row">
                <div className="sym">NVDAx<small>NVIDIA xStock · Solana</small></div>
                <div className="val"><span className="peg ok">0.998</span><br/><small style={{ color: 'var(--faint)' }}>inside band</small></div>
              </div>
              <div className="row">
                <div className="sym">CRCLx<small>Circle xStock · Solana</small></div>
                <div className="val"><span className="peg warn">0.981 ⚠</span><br/><small style={{ color: 'var(--faint)' }}>drift −1.1% · watching</small></div>
              </div>
              <div className="row" style={{ padding: '10px 0' }}>
                <div style={{ fontSize: 11, color: 'var(--faint)', fontFamily: 'var(--mono)' }}>
                  risk filter: CRCLx is riskFlagged — orders require manual confirm
                </div>
              </div>
            </div>
          </div>

          {/* EVENT LOG */}
          <div className="card log-card">
            <h2>Agent event log <span className="r">streaming</span></h2>
            <div className="log">
              <div className="tl ok"><span className="ts">02:59:41</span><span className="tag">[WATCH]</span><span className="msg">TSLAx peg 0.998 · inside band ±2%</span></div>
              <div className="tl ok"><span className="ts">03:00:12</span><span className="tag">[WATCH]</span><span className="msg">TSLAx peg 0.987 · inside band ±2%</span></div>
              <div className="tl warn"><span className="ts">03:00:43</span><span className="tag">[DRIFT]</span><span className="msg">TSLAx peg 0.974 · drift −1.3% — watching</span></div>
              <div className="tl fire"><span className="ts">03:01:02</span><span className="tag">[BREACH]</span><span className="msg">peg 0.962 &lt; floor 0.97 → protective action</span></div>
              <div className="tl info"><span className="ts">03:01:03</span><span className="tag">[FLASH]</span><span className="msg">POST /v1/quote · stop-loss · sell 0.05 TSLAx @ 355 USDC</span></div>
              <div className="tl info"><span className="ts">03:01:04</span><span className="tag">[FLASH]</span><span className="msg">quote ok · signing with session wallet</span></div>
              <div className="tl ok"><span className="ts">03:01:05</span><span className="tag">[FLASH]</span><span className="msg">POST /v1/order · orderId 887ccf13 · pending_activation</span></div>
              <div className="tl ok"><span className="ts">03:01:05</span><span className="tag">[TG]</span><span className="msg">alert sent → chat 7825996569 · "🛡 TSLAx breached floor — stop placed"</span></div>
              <div className="tl ok"><span className="ts">03:05:00</span><span className="tag">[WATCH]</span><span className="msg">NVDAx peg 0.998 · CRCLx peg 0.981 (riskFlagged — notify only)</span></div>
            </div>
          </div>

          {/* ORDERS */}
          <div className="card orders-card">
            <h2>Flash orders <span className="r">via Definitive</span></h2>
            <div className="orders">
              <div className="row">
                <span className="side sell">SELL 0.05 TSLAx</span>
                <span>stop-loss @ 355</span>
                <span className="st fired">TRIGGERED</span>
              </div>
              <div className="row">
                <span className="side buy">BUY 200 USDC NVDAx</span>
                <span>re-entry DCA · 7d</span>
                <span className="st dormant">STANDBY</span>
              </div>
              <div className="row">
                <span className="side sell">SELL 0.02 NVDAx</span>
                <span>stop-loss @ 205</span>
                <span className="st live">ARMED</span>
              </div>
              <div className="row" style={{ color: 'var(--faint)', fontSize: '10.5px' }}>
                <span>execution: flash.definitive.fi · non-custodial</span>
                <span>MEV-protected</span>
              </div>
            </div>
          </div>

          {/* ALERTS */}
          <div className="card alerts-card">
            <h2>Telegram alert feed <span className="r">@PegWatchBot</span></h2>
            <div className="alerts">
              <div className="a">
                <div className="ic br">🛡</div>
                <div className="tx">
                  <b>TSLAx breached floor — stop-loss placed</b>
                  <span>peg 0.962 &lt; 0.97 · sell 0.05 TSLAx @ 355 USDC · orderId 887ccf13</span>
                </div>
                <span className="when">03:01</span>
              </div>
              <div className="a">
                <div className="ic sh">⚠️</div>
                <div className="tx">
                  <b>Drift warning — TSLAx</b>
                  <span>peg 0.974 · −1.3% inside band · monitoring intensified</span>
                </div>
                <span className="when">03:00</span>
              </div>
              <div className="a">
                <div className="ic tg">🤖</div>
                <div className="tx">
                  <b>Agent session started</b>
                  <span>DEMO_MODE · 3 positions watched · poll 60s · Flash armed</span>
                </div>
                <span className="when">22:00</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer>
        PegWatch · Runtime Hackathon 2026 · monitor → Flash quote → order → alert · demo data
      </footer>
    </div>
  );
};
