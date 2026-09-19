import React, { useState, useEffect } from 'react';

interface ExactHomepageProps {
  onGoToDashboard: () => void;
}

export const ExactHomepage: React.FC<ExactHomepageProps> = ({ onGoToDashboard }) => {
  const [timeStr, setTimeStr] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="exact-page-root">
      <style>{`
        .exact-page-root {
          --bg:#0A1218; --bg2:#0E1E28; --panel:#121D25; --line:#1F3240;
          --ink:#F4F7F6; --dim:#8FA6A0; --faint:#5E726C;
          --mint:#00E5A0; --blue:#0091FF; --red:#FF5470;
          --mono:'Consolas','SF Mono',monospace; --sans:'Segoe UI',Helvetica,Arial,sans-serif;
          background:var(--bg);
          color:var(--ink);
          font-family:var(--sans);
          line-height:1.6;
          overflow-x:hidden;
          min-height:100vh;
        }
        .exact-page-root * { box-sizing:border-box; }
        .exact-page-root a { text-decoration:none; color:inherit; }
        .exact-page-root .wrap { max-width:1140px; margin:0 auto; padding:0 24px; }
        .exact-page-root .mono { font-family:var(--mono); }

        /* header */
        .exact-page-root header {
          position:fixed; top:0; left:0; right:0; z-index:50;
          background:rgba(10,18,24,.88); backdrop-filter:blur(12px);
          border-bottom:1px solid var(--line); padding:14px 0;
          transition: border-color .3s ease;
        }
        .exact-page-root .nav { display:flex; align-items:center; justify-content:space-between; }
        .exact-page-root .brand { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .exact-page-root .brand img { width:34px; height:34px; transition: transform .3s ease; }
        .exact-page-root .brand:hover img { transform: scale(1.08) rotate(-3deg); }
        .exact-page-root .brand b { font-size:19px; letter-spacing:.5px; }
        .exact-page-root .brand b i { font-style:normal; color:var(--mint); }
        .exact-page-root .nav-links { display:flex; gap:26px; align-items:center; font-size:14px; color:var(--dim); }
        .exact-page-root .nav-links a:hover { color:var(--mint); }

        .exact-page-root .btn {
          display:inline-block; background:var(--mint); color:#06231A; font-weight:700;
          padding:11px 22px; border-radius:8px; font-size:14px; transition:transform .2s,box-shadow .2s;
          cursor:pointer; border:none; text-align:center; position:relative; overflow:hidden;
        }
        .exact-page-root .btn:hover { transform:translateY(-2px); box-shadow:0 10px 26px rgba(0,229,160,.35); }
        .exact-page-root .btn.ghost { background:transparent; border:1.5px solid var(--line); color:var(--ink); }
        .exact-page-root .btn.ghost:hover { border-color:var(--mint); color:var(--mint); box-shadow:none; }

        /* Shimmer sweep on primary CTA button */
        .exact-page-root .btn-shimmer::after {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(60deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: rotate(25deg) translateY(-120%);
          animation: shimmerSweep 4.5s infinite ease-in-out;
        }
        @keyframes shimmerSweep {
          0%, 75% { transform: rotate(25deg) translateY(-120%); }
          100% { transform: rotate(25deg) translateY(120%); }
        }

        /* hero */
        .exact-page-root .hero { position:relative; padding:170px 0 70px; overflow:hidden; }
        .exact-page-root .hero::before {
          content:""; position:absolute; inset:0;
          background:
            radial-gradient(1000px 520px at 80% -10%, rgba(0,229,160,.12), transparent 60%),
            radial-gradient(700px 420px at 15% 70%, rgba(0,145,255,.09), transparent 60%);
          animation: auraShift 9s ease-in-out infinite alternate;
        }
        @keyframes auraShift {
          0% { transform: scale(1) translateY(0); opacity: 0.75; }
          100% { transform: scale(1.06) translateY(-16px); opacity: 1; }
        }
        .exact-page-root .hero::after {
          content:""; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(31,50,64,.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31,50,64,.25) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse 75% 65% at 50% 45%, #000 25%, transparent 80%);
          pointer-events: none;
          opacity: 0.65;
        }

        .exact-page-root .hero .wrap {
          position:relative; display:grid; grid-template-columns:1.05fr .95fr; gap:54px; align-items:center; z-index:2;
        }
        .exact-page-root .kicker {
          display:inline-flex; align-items:center; gap:9px; border:1px solid var(--line);
          background:rgba(0,229,160,.06); color:var(--mint); border-radius:30px;
          padding:7px 16px; font-size:12px; letter-spacing:2.5px; text-transform:uppercase; font-weight:700; margin-bottom:24px;
          animation: pulseKicker 3s infinite ease-in-out;
        }
        @keyframes pulseKicker {
          0%, 100% { border-color: var(--line); }
          50% { border-color: rgba(0,229,160,.4); box-shadow: 0 0 16px rgba(0,229,160,.15); }
        }
        .exact-page-root .kicker b {
          width:7px; height:7px; border-radius:50%; background:var(--red);
          animation:heroPulse 1.6s infinite;
        }
        @keyframes heroPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(255,84,112,.6)}
          50%{box-shadow:0 0 0 8px rgba(255,84,112,0)}
        }
        .exact-page-root h1 {
          font-size:clamp(38px,5.4vw,62px); line-height:1.08; font-weight:800; letter-spacing:-.02em; margin-bottom:20px;
        }
        .exact-page-root h1 em { font-style:normal; color:var(--mint); text-shadow: 0 0 28px rgba(0,229,160,.35); }
        .exact-page-root .hero .sub { color:var(--dim); font-size:17.5px; max-width:520px; margin-bottom:32px; }
        .exact-page-root .cta-row { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:44px; }
        .exact-page-root .hero-badges { display:flex; gap:10px; flex-wrap:wrap; }
        .exact-page-root .badge {
          font-family:var(--mono); font-size:11.5px; letter-spacing:1px; color:var(--dim);
          border:1px solid var(--line); border-radius:6px; padding:6px 12px; background:var(--panel);
          transition: transform .2s ease, border-color .2s ease, color .2s ease;
        }
        .exact-page-root .badge:hover {
          transform: translateY(-2px); border-color: rgba(0,229,160,.4); color: var(--ink);
        }
        .exact-page-root .badge b { color:var(--mint); font-weight:600; }

        /* live terminal mock */
        .exact-page-root .term {
          background:var(--panel); border:1px solid var(--line); border-radius:16px;
          overflow:hidden; box-shadow:0 40px 90px rgba(0,0,0,.5);
          animation:fadeUp .9s .2s both, floatTerm 6s ease-in-out infinite alternate 1.1s;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes floatTerm {
          0% { transform: translateY(0); box-shadow: 0 35px 80px rgba(0,0,0,.5); }
          100% { transform: translateY(-7px); box-shadow: 0 45px 95px rgba(0,229,160,.12); }
        }
        .exact-page-root .term-bar {
          display:flex; align-items:center; gap:8px; padding:12px 16px; border-bottom:1px solid var(--line);
          font-family:var(--mono); font-size:11.5px; color:var(--dim); background:rgba(18,29,37,.95);
        }
        .exact-page-root .term-bar .d { width:10px; height:10px; border-radius:50%; }
        .exact-page-root .term-bar .live { margin-left:auto; color:var(--mint); font-weight:700; }
        .exact-page-root .term-bar .live::before { content:"●"; margin-right:6px; animation:dotPulse 1.8s infinite; }
        @keyframes dotPulse { 50%{opacity:.25} }
        .exact-page-root .term-body { padding:18px; font-family:var(--mono); font-size:12.8px; line-height:1.85; }
        .exact-page-root .tl { display:flex; gap:10px; opacity:0; animation:typeIn .4s forwards; }
        @keyframes typeIn { to{opacity:1} }
        .exact-page-root .tl .ts { color:var(--faint); flex-shrink:0; }
        .exact-page-root .tl.ok .tag { color:var(--mint); }
        .exact-page-root .tl.warn .tag { color:#F2C94C; }
        .exact-page-root .tl.fire .tag { color:var(--red); }
        .exact-page-root .tag { font-weight:700; }
        .exact-page-root .cursor-blink { animation: cursorBlink 1s infinite steps(2); }
        @keyframes cursorBlink { 0%, 100% { opacity:1; } 50% { opacity:0; } }

        .exact-page-root .fill-bar { height:5px; background:var(--line); border-radius:4px; overflow:hidden; margin:12px 0 4px; }
        .exact-page-root .fill-bar i {
          display:block; height:100%; width:100%;
          background:linear-gradient(90deg,var(--mint),var(--blue));
          transform-origin:left; animation:drain 6s ease-in-out infinite;
        }
        @keyframes drain { 0%{transform:scaleX(1)} 70%{transform:scaleX(.12)} 72%{transform:scaleX(1)} }

        /* terminal chart svg animations */
        .exact-page-root .chart { margin-top:14px; background:#0C161D; border:1px solid var(--line); border-radius:10px; padding:14px; }
        .exact-page-root .chart svg { width:100%; height:auto; display:block; }
        .exact-page-root .band-line { animation: dashFlow 25s linear infinite; }
        @keyframes dashFlow { to { stroke-dashoffset: -120; } }

        .exact-page-root .peg-curve {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawCurve 3.2s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseCurve 3s ease-in-out infinite alternate 3.2s;
        }
        @keyframes drawCurve { to { stroke-dashoffset: 0; } }
        @keyframes pulseCurve {
          0% { opacity: 0.9; stroke-width: 3px; }
          100% { opacity: 1; stroke-width: 3.5px; filter: drop-shadow(0 0 6px rgba(255,255,255,0.45)); }
        }

        .exact-page-root .breach-dot { animation: dotThrob 1.6s ease-in-out infinite alternate; }
        @keyframes dotThrob {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px #FF5470); }
          100% { transform: scale(1.3); filter: drop-shadow(0 0 10px #FF5470); }
        }
        .exact-page-root .breach-ripple {
          animation: sonarPing 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          transform-origin: 480px 108px;
        }
        @keyframes sonarPing {
          0% { r: 6px; opacity: 1; stroke-width: 2.2px; }
          100% { r: 26px; opacity: 0; stroke-width: 0.5px; }
        }

        /* live market ticker marquee */
        .exact-page-root .ticker-strip {
          background: #080E13;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          overflow: hidden;
          padding: 11px 0;
          position: relative;
        }
        .exact-page-root .ticker-track {
          display: flex;
          gap: 36px;
          width: max-content;
          animation: marqueeScroll 32s linear infinite;
        }
        .exact-page-root .ticker-track:hover { animation-play-state: paused; }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .exact-page-root .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-family: var(--mono);
          font-size: 12.5px;
          color: var(--ink);
          white-space: nowrap;
        }
        .exact-page-root .ticker-item .dot { font-size: 9px; }
        .exact-page-root .ticker-item .dot.g { color: var(--mint); }
        .exact-page-root .ticker-item .dot.b { color: var(--blue); }
        .exact-page-root .ticker-item .dot.a { color: #F2C94C; }
        .exact-page-root .ticker-item .dot.r { color: var(--red); }
        .exact-page-root .ticker-item .tag {
          font-size: 10.5px; padding: 2px 7px; border-radius: 4px; background: rgba(255,255,255,.07); color: var(--dim);
        }
        .exact-page-root .ticker-item .tag.ok { background: rgba(0,229,160,.12); color: var(--mint); }
        .exact-page-root .ticker-item .tag.warn { background: rgba(242,201,76,.12); color: #F2C94C; }
        .exact-page-root .ticker-item .tag.red { background: rgba(255,84,112,.12); color: var(--red); }

        /* sections */
        .exact-page-root section { padding:90px 0; }
        .exact-page-root .sec-label {
          color:var(--mint); font-size:12px; letter-spacing:3.5px; text-transform:uppercase; font-weight:800;
          margin-bottom:14px; display:flex; align-items:center; gap:12px;
        }
        .exact-page-root .sec-label::before { content:""; width:30px; height:2px; background:var(--mint); }
        .exact-page-root h2 { font-size:clamp(26px,3.6vw,40px); font-weight:800; letter-spacing:-.015em; margin-bottom:14px; }
        .exact-page-root h2 em { font-style:normal; color:var(--mint); text-shadow:0 0 20px rgba(0,229,160,.3); }
        .exact-page-root .lead { color:var(--dim); font-size:16.5px; max-width:640px; margin-bottom:48px; }

        /* how it works */
        .exact-page-root .grid3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:20px; }
        .exact-page-root .card {
          background:var(--panel); border:1px solid var(--line); border-radius:14px;
          padding:28px; transition:transform .35s cubic-bezier(0.16,1,0.3,1), border-color .35s, box-shadow .35s;
          position: relative;
        }
        .exact-page-root .card:hover {
          transform:translateY(-7px);
          border-color:rgba(0,229,160,.45);
          box-shadow: 0 16px 36px rgba(0,229,160,.14);
        }
        .exact-page-root .card:hover .ic {
          transform: scale(1.1) rotate(5deg);
          background: rgba(0,229,160,.18);
        }
        .exact-page-root .card .step {
          font-family:var(--mono); font-size:11px; letter-spacing:2px; color:var(--mint); font-weight:700; margin-bottom:14px;
        }
        .exact-page-root .card .ic {
          width:46px; height:46px; border-radius:11px; background:rgba(0,229,160,.09);
          display:flex; align-items:center; justify-content:center; margin-bottom:16px;
          transition: transform .3s ease, background .3s ease;
        }
        .exact-page-root .card .ic svg {
          width:23px; height:23px; stroke:var(--mint); fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round;
        }
        .exact-page-root .card h3 { font-size:18.5px; margin-bottom:9px; color:var(--ink); }
        .exact-page-root .card p { color:var(--dim); font-size:14.5px; }
        .exact-page-root .card .ep {
          display:inline-block; margin-top:14px; font-family:var(--mono); font-size:11px; color:var(--blue);
          background:rgba(0,145,255,.08); border:1px solid rgba(0,145,255,.25); border-radius:5px; padding:3px 9px;
        }

        /* dashboard preview strip */
        .exact-page-root .dark-strip { background:var(--bg2); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
        .exact-page-root .metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:18px; margin-top:44px; }
        .exact-page-root .metric {
          background:var(--panel); border:1px solid var(--line); border-left:3px solid var(--mint);
          border-radius:10px; padding:22px; transition: transform .3s ease, box-shadow .3s ease;
        }
        .exact-page-root .metric:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(0,0,0,.45);
        }
        .exact-page-root .metric .n {
          font-size:36px; font-weight:800; font-family:var(--mono); display:inline-block; transition: transform .25s ease;
        }
        .exact-page-root .metric:hover .n { transform: scale(1.08); }
        .exact-page-root .metric .n.g { color:var(--mint); }
        .exact-page-root .metric .n.b { color:var(--blue); }
        .exact-page-root .metric .n.r { color:var(--red); }
        .exact-page-root .metric .t { color:var(--dim); font-size:12px; letter-spacing:1.6px; text-transform:uppercase; margin-top:6px; }

        /* stack */
        .exact-page-root .stack-row { display:flex; gap:14px; flex-wrap:wrap; margin-top:8px; }
        .exact-page-root .stack {
          background:var(--panel); border:1px solid var(--line); border-radius:10px;
          padding:18px 22px; flex:1; min-width:240px;
          transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
        }
        .exact-page-root .stack:hover {
          transform: translateY(-4px);
          border-color: rgba(0,145,255,.5);
          box-shadow: 0 12px 30px rgba(0,145,255,.14);
        }
        .exact-page-root .stack b { display:block; font-size:15px; margin-bottom:4px; }
        .exact-page-root .stack span { color:var(--dim); font-size:13px; }

        /* banner showcase */
        .exact-page-root .banner-container {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--line);
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
          position: relative;
          background: var(--panel);
          transition: transform .4s cubic-bezier(0.16,1,0.3,1), box-shadow .4s ease;
        }
        .exact-page-root .banner-container:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 30px 80px rgba(0,145,255,.22), 0 0 40px rgba(0,229,160,.12);
          border-color: rgba(0,229,160,.4);
        }

        /* footer */
        .exact-page-root footer { border-top:1px solid var(--line); padding:38px 0; color:var(--faint); font-size:13.5px; }
        .exact-page-root .foot { display:flex; justify-content:space-between; gap:20px; flex-wrap:wrap; align-items:center; }
        .exact-page-root .foot a { color:var(--dim); transition: color .2s; }
        .exact-page-root .foot a:hover { color:var(--mint); }

        @media(max-width:920px){
          .exact-page-root .hero .wrap { grid-template-columns:1fr; gap:40px; }
          .exact-page-root .nav-links a:not(.btn) { display:none; }
        }
        @media(max-width:560px){
          .exact-page-root section { padding:60px 0; }
          .exact-page-root .hero { padding:130px 0 60px; }
          .exact-page-root .term-body { font-size:11px; }
          .exact-page-root .ticker-strip { display:none; }
        }
      `}</style>

      {/* HEADER */}
      <header>
        <div className="wrap nav">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.png" alt="PegWatch Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <b>Peg<i>Watch</i></b>
          </div>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <button onClick={onGoToDashboard} className="btn btn-shimmer" style={{ padding: '9px 18px' }}>
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="hero" id="top">
        <div className="wrap">
          <div>
            <span className="kicker">
              <b></b> Runtime Hackathon · AI Agents × Crypto Rails
            </span>
            <h1>The peg breaks at 3AM.<br /><em>Your agent is already</em> selling.</h1>
            <p className="sub">
              PegWatch watches tokenized-equity pegs around the clock. When drift breaches the band, it doesn't ping you and wait — it quotes and places the protective stop through Definitive Flash, then tells you what it did.
            </p>
            <div className="cta-row">
              <button onClick={onGoToDashboard} className="btn btn-shimmer">Watch It Work</button>
              <a href="#how" className="btn ghost">How It Works</a>
            </div>
            <div className="hero-badges">
              <span className="badge">Non-custodial · <b>funds stay in wallet</b></span>
              <span className="badge">Execution · <b>Definitive Flash API</b></span>
              <span className="badge">Alerts · <b>Telegram</b></span>
            </div>
          </div>

          {/* LIVE TERMINAL MOCK */}
          <div className="term" id="terminal">
            <div className="term-bar">
              <span className="d" style={{ background: '#FF5470' }}></span>
              <span className="d" style={{ background: '#F2C94C' }}></span>
              <span className="d" style={{ background: '#00E5A0' }}></span>
              <span style={{ marginLeft: 8 }}>pegwatch-agent — session [{timeStr}]</span>
              <span className="live">LIVE</span>
            </div>
            <div className="term-body">
              <div className="tl ok" style={{ animationDelay: '.2s' }}>
                <span className="ts">02:59:41</span>
                <span className="tag">[WATCH]</span>
                <span>NVDAc DEX $222.06 · Oracle $118.50 (Base)</span>
              </div>
              <div className="tl ok" style={{ animationDelay: '.7s' }}>
                <span className="ts">03:00:12</span>
                <span className="tag">[REGIME]</span>
                <span>Market: WEEKEND_DARK_MARKET · Limit ±3.0%</span>
              </div>
              <div className="tl warn" style={{ animationDelay: '1.2s' }}>
                <span className="ts">03:00:43</span>
                <span className="tag">[DRIFT]</span>
                <span>NVDAc drift +87.4% ⚠ exceeds weekend threshold</span>
              </div>
              <div className="fill-bar"><i></i></div>
              <div className="tl fire" style={{ animationDelay: '1.8s' }}>
                <span className="ts">03:01:02</span>
                <span className="tag">[BREACH]</span>
                <span>2 blocks confirmed → protective action via Flash</span>
              </div>
              <div className="tl" style={{ animationDelay: '2.4s' }}>
                <span className="ts">03:01:03</span>
                <span className="tag">[FLASH]</span>
                <span>POST /v1/quote · stop-loss · sell 0.05 NVDAc @ 210 USDC</span>
              </div>
              <div className="tl" style={{ animationDelay: '3.0s' }}>
                <span className="ts">03:01:04</span>
                <span className="tag">[FLASH]</span>
                <span>quoteId flash_qt_mu8854gn · signing EIP-712 session</span>
              </div>
              <div className="tl ok" style={{ animationDelay: '3.6s' }}>
                <span className="ts">03:01:05</span>
                <span className="tag">[FLASH]</span>
                <span>order status: SIMULATED_FILLED · Tx 0xe614...64ee ✅</span>
              </div>
              <div className="tl ok" style={{ animationDelay: '4.2s' }}>
                <span className="ts">03:01:05</span>
                <span className="tag">[TG]</span>
                <span>→ Telegram: "🚨 PegWatch Risk Alert: NVDAc Stop Placed"</span>
              </div>
              <div className="tl ok" style={{ animationDelay: '4.8s', marginTop: 6, color: 'var(--mint)' }}>
                <span className="ts">{timeStr}</span>
                <span className="tag">[POLL]</span>
                <span>polling Aerodrome DEX · 60s cycle active<span className="cursor-blink">_</span></span>
              </div>

              {/* TERMINAL CHART SVG */}
              <div className="chart">
                <svg viewBox="0 0 520 130">
                  <rect x="10" y="30" width="500" height="46" fill="#00E5A0" opacity="0.07"/>
                  <line className="band-line" x1="10" y1="30" x2="510" y2="30" stroke="#00E5A0" strokeWidth="1.5" strokeDasharray="6 5" opacity=".7"/>
                  <line className="band-line" x1="10" y1="76" x2="510" y2="76" stroke="#0091FF" strokeWidth="1.5" strokeDasharray="6 5" opacity=".7"/>
                  <path className="peg-curve" d="M10 55 C70 48 110 62 170 55 C230 48 270 66 330 72 C390 78 440 96 480 108"
                        fill="none" stroke="#E8F0EC" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="480" cy="108" r="6" fill="#FF5470" className="breach-dot"/>
                  <circle cx="480" cy="108" r="6" fill="none" stroke="#FF5470" strokeWidth="1.5" className="breach-ripple"/>
                  <text x="14" y="24" fill="#00E5A0" fontSize="10" fontFamily="monospace" letterSpacing="1">BAND TOP</text>
                  <text x="14" y="92" fill="#0091FF" fontSize="10" fontFamily="monospace" letterSpacing="1">BAND FLOOR</text>
                  <text x="430" y="122" fill="#FF5470" fontSize="10" fontFamily="monospace">BREACH→STOP</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE MARKET TICKER STRIP */}
      <div className="ticker-strip">
        <div className="ticker-track">
          <div className="ticker-item"><span className="dot g">●</span> <b>NVDAc/USD:</b> $219.54 <span className="tag warn">ORACLE FROZEN 65.5h</span></div>
          <div className="ticker-item"><span className="dot g">●</span> <b>TSLAx/USDC:</b> 0.991 <span className="tag ok">INSIDE BAND ±2%</span></div>
          <div className="ticker-item"><span className="dot a">●</span> <b>CRCLx/USDC:</b> 0.981 <span className="tag warn">MONITORING</span></div>
          <div className="ticker-item"><span className="dot b">●</span> <b>EXECUTION:</b> DEFINITIVE FLASH <span className="tag ok">MEV-SHIELDED</span></div>
          <div className="ticker-item"><span className="dot g">●</span> <b>SIGNING:</b> DYNAMIC DELEGATED <span className="tag ok">NON-CUSTODIAL</span></div>
          <div className="ticker-item"><span className="dot r">●</span> <b>DARK MARKET:</b> 24/7 ACTIVE <span className="tag red">PROTECTION ARMED</span></div>
          
          {/* Repeat for seamless infinite loop */}
          <div className="ticker-item"><span className="dot g">●</span> <b>NVDAc/USD:</b> $219.54 <span className="tag warn">ORACLE FROZEN 65.5h</span></div>
          <div className="ticker-item"><span className="dot g">●</span> <b>TSLAx/USDC:</b> 0.991 <span className="tag ok">INSIDE BAND ±2%</span></div>
          <div className="ticker-item"><span className="dot a">●</span> <b>CRCLx/USDC:</b> 0.981 <span className="tag warn">MONITORING</span></div>
          <div className="ticker-item"><span className="dot b">●</span> <b>EXECUTION:</b> DEFINITIVE FLASH <span className="tag ok">MEV-SHIELDED</span></div>
          <div className="ticker-item"><span className="dot g">●</span> <b>SIGNING:</b> DYNAMIC DELEGATED <span className="tag ok">NON-CUSTODIAL</span></div>
          <div className="ticker-item"><span className="dot r">●</span> <b>DARK MARKET:</b> 24/7 ACTIVE <span className="tag red">PROTECTION ARMED</span></div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <section id="how">
        <div className="wrap">
          <div className="sec-label">How It Works</div>
          <h2>Detect. Protect. <em>Report.</em></h2>
          <p className="lead">
            Three steps, fully autonomous, fully non-custodial. The agent never holds your funds — it only ever signs intents against your wallet.
          </p>
          <div className="grid3">
            <div className="card">
              <div className="step">STEP 01 — DETECT</div>
              <div className="ic">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              </div>
              <h3>Continuous peg surveillance</h3>
              <p>The agent polls the tokenized equity's reference price against its onchain peg every cycle, tracking drift inside a configurable band (default ±2%).</p>
              <span className="ep">price poller · drift engine</span>
            </div>

            <div className="card">
              <div className="step">STEP 02 — PROTECT</div>
              <div className="ic">
                <svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <h3>Protective order, placed</h3>
              <p>On breach, the agent quotes a stop-loss through Definitive Flash, signs with the session wallet, and submits — MEV-protected, managed execution, funds never leave your custody until the trigger fires.</p>
              <span className="ep">POST /v1/quote → sign → POST /v1/order</span>
            </div>

            <div className="card">
              <div className="step">STEP 03 — REPORT</div>
              <div className="ic">
                <svg viewBox="0 0 24 24"><path d="M3 7h18v12H3z"/><path d="M3 7l9 6 9-6"/></svg>
              </div>
              <h3>You hear it first</h3>
              <p>Every action — drift warnings, breaches, order IDs, fills — lands in Telegram with receipts. You always know what your agent did and why.</p>
              <span className="ep">Telegram Bot API</span>
            </div>
          </div>

          {/* METRICS ROW */}
          <div className="metrics">
            <div className="metric"><div className="n g">24/7</div><div className="t">Peg surveillance</div></div>
            <div className="metric"><div className="n b">&lt;60s</div><div className="t">Breach → order placed</div></div>
            <div className="metric"><div className="n r">0</div><div className="t">Custody over user funds</div></div>
            <div className="metric"><div className="n g">12</div><div className="t">Chains via Flash</div></div>
          </div>
        </div>
      </section>

      {/* STACK SECTION */}
      <section className="dark-strip" id="stack">
        <div className="wrap">
          <div className="sec-label">Stack</div>
          <h2>Built on rails that <em>actually execute</em></h2>
          <p className="lead">Every layer is production infrastructure, not mockups.</p>
          <div className="stack-row">
            <div className="stack">
              <b style={{ color: 'var(--mint)' }}>Definitive Flash API</b>
              <span>Stop-loss / TP / bracket orders, MEV protection, managed execution across 12 chains — the agent's execution layer.</span>
            </div>
            <div className="stack">
              <b style={{ color: 'var(--blue)' }}>xStocks (tokenized equities)</b>
              <span>TSLAx, NVDAx &amp; more — the asset class the agent defends. Searched live via Flash /v1/search.</span>
            </div>
            <div className="stack">
              <b style={{ color: 'var(--mint)' }}>Telegram Bot API</b>
              <span>Every drift, breach, and order lands in your pocket with a full audit trail.</span>
            </div>
            <div className="stack">
              <b style={{ color: 'var(--blue)' }}>Session signer</b>
              <span>Dedicated burner wallet: the agent signs intents, you keep custody. Key hygiene documented in the README.</span>
            </div>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer>
        <div className="wrap foot">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="PegWatch" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            <span>PegWatch — Runtime Hackathon 2026 · AI agents × crypto rails</span>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="https://t.me/pegwatchbot" target="_blank" rel="noopener noreferrer">@pegwatchbot</a>
            <a href="https://github.com/natureloved/PegWatch" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://docs.definitive.fi/developers/flash-api-new" target="_blank" rel="noopener noreferrer">Flash docs</a>
            <a
              href="https://x.com/RastaDev_"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--mint)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              built by RastaDev ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
