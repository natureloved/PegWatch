import React, { useEffect, useRef, useState } from 'react';

interface SplashBannerIntroProps {
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  alpha: number;
  speed: number;
}

export const SplashBannerIntro: React.FC<SplashBannerIntroProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAssembled, setIsAssembled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING RISK ENGINE & BASE TELEMETRY...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 680;
    const height = rect.height || (width * 9) / 16;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const colors = ['#00E5A0', '#0091FF', '#F4F7F6', '#64D2FF', '#FF5470'];
    const cols = 50;
    const rows = 28;
    const particles: Particle[] = [];

    const cellW = width / cols;
    const cellH = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const targetX = c * cellW + (Math.random() - 0.5) * cellW * 0.7;
        const targetY = r * cellH + (Math.random() - 0.5) * cellH * 0.7;

        // Dispersed floating particle starting location
        const angle = Math.random() * Math.PI * 2;
        const dist = 140 + Math.random() * 320;
        const startX = width / 2 + Math.cos(angle) * (width * 0.5 + dist * Math.random());
        const startY = height / 2 + Math.sin(angle) * (height * 0.5 + dist * Math.random());

        particles.push({
          x: startX,
          y: startY,
          targetX,
          targetY,
          size: 1.5 + Math.random() * 2.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.3 + Math.random() * 0.7,
          speed: 0.045 + Math.random() * 0.035
        });
      }
    }

    const startTime = performance.now();
    const duration = 2100;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;

        const fadeOut = t > 0.72 ? 1 - (t - 0.72) / 0.28 : 1;
        ctx.globalAlpha = p.alpha * Math.max(0, fadeOut);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;
        ctx.fill();
        ctx.restore();
      }

      if (t >= 0.8 && !isAssembled) {
        setIsAssembled(true);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Progress bar and status ticks
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 3.5;
        if (next < 35) {
          setStatusText('CONNECTING TO DEFINITIVE FLASH & DYNAMIC MPC...');
        } else if (next < 70) {
          setStatusText('VERIFYING BASE ORACLE 24/5 DARK MARKET REGIME...');
        } else if (next < 95) {
          setStatusText('PEGWATCH AUTONOMOUS RISK AGENT ARMED...');
        } else {
          setStatusText('SYSTEM READY · ENTERING MISSION CONTROL');
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(onComplete, 650);
          }, 350);
          return 100;
        }
        return next;
      });
    }, 85);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearInterval(interval);
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#070D12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        overflow: 'hidden'
      }}
    >
      {/* Subtle Background Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(800px 500px at 50% 45%, rgba(0, 229, 160, 0.08), transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: 24,
          right: 28,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#8FA6A0',
          borderRadius: 20,
          padding: '6px 14px',
          fontSize: 12,
          fontFamily: "'Consolas', monospace",
          cursor: 'pointer',
          letterSpacing: '1px',
          transition: 'all .2s ease',
          zIndex: 10
        }}
      >
        Skip →
      </button>

      {/* Center Banner Frame */}
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: isAssembled ? 'rgba(0, 229, 160, 0.4)' : 'rgba(31, 50, 64, 0.8)',
            background: '#0A1218',
            boxShadow: isAssembled
              ? '0 24px 70px rgba(0, 145, 255, 0.22), 0 0 40px rgba(0, 229, 160, 0.18)'
              : '0 20px 60px rgba(0, 0, 0, 0.8)',
            transition: 'border-color 0.6s ease, box-shadow 0.6s ease'
          }}
        >
          {/* Real Banner Image */}
          <img
            src="/banner.jpg"
            alt="PegWatch"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled ? 'scale(1)' : 'scale(1.04)',
              filter: isAssembled ? 'blur(0px)' : 'blur(6px)',
              transition: 'opacity 0.75s ease-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease'
            }}
          />

          {/* Particle Canvas Overlay */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5
            }}
          />

          {/* Scanline Sweep during Assembly */}
          {!isAssembled && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0, 229, 160, 0.15) 50%, rgba(0, 145, 255, 0.3) 52%, transparent 54%)',
                animation: 'introScanline 1.6s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 6
              }}
            />
          )}
        </div>

        {/* Loading Indicator & Status Bar */}
        <div style={{ width: '100%', marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: "'Consolas', monospace",
              fontSize: 11.5,
              color: '#8FA6A0',
              marginBottom: 8,
              letterSpacing: '0.8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#00E5A0',
                  boxShadow: '0 0 8px #00E5A0',
                  animation: 'pulseDot 1.4s infinite'
                }}
              />
              <span style={{ color: '#F4F7F6' }}>{statusText}</span>
            </div>
            <span style={{ color: '#00E5A0', fontWeight: 700 }}>{Math.round(progress)}%</span>
          </div>

          {/* Progress Track */}
          <div
            style={{
              width: '100%',
              height: 4,
              background: 'rgba(31, 50, 64, 0.6)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0091FF, #00E5A0)',
                boxShadow: '0 0 10px rgba(0, 229, 160, 0.6)',
                transition: 'width 0.1s linear'
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes introScanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
