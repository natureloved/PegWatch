import React, { useEffect, useRef, useState } from 'react';

interface BannerParticleRevealProps {
  imageSrc: string;
  altText: string;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  speed: number;
}

export const BannerParticleReveal: React.FC<BannerParticleRevealProps> = ({ imageSrc, altText }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAssembled, setIsAssembled] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animFrameRef = useRef<number>(0);

  const startParticleAnimation = () => {
    setIsAssembled(false);
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 720;
    const height = rect.height || (width * 9) / 16;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Particle color palette: Mint, Electric Blue, Bright White, Coral Accent
    const colors = ['#00E5A0', '#0091FF', '#F4F7F6', '#64D2FF', '#FF5470'];

    // Generate ~1400 dispersed particles across a grid
    const cols = 48;
    const rows = 27;
    const particles: Particle[] = [];

    const cellW = width / cols;
    const cellH = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Target coordinate on the banner grid
        const targetX = c * cellW + (Math.random() - 0.5) * cellW * 0.8;
        const targetY = r * cellH + (Math.random() - 0.5) * cellH * 0.8;

        // Dispersed start coordinate floating from outside/random aura
        const angle = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 260;
        const startX = width / 2 + Math.cos(angle) * (width * 0.5 + dist * Math.random());
        const startY = height / 2 + Math.sin(angle) * (height * 0.5 + dist * Math.random());

        particles.push({
          x: startX,
          y: startY,
          targetX,
          targetY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 1.4 + Math.random() * 2.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.2 + Math.random() * 0.8,
          speed: 0.045 + Math.random() * 0.04
        });
      }
    }

    const startTime = performance.now();
    const duration = 2200; // 2.2s assembly

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, width, height);

      let convergedCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth convergence physics with easing
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const distSq = dx * dx + dy * dy;

        p.x += dx * p.speed;
        p.y += dy * p.speed;

        if (distSq < 4) {
          convergedCount++;
        }

        // Draw glowing particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;

        // Fade out canvas particles as the image crystallizes
        const fadeOut = progress > 0.75 ? 1 - (progress - 0.75) / 0.25 : 1;
        ctx.globalAlpha = p.alpha * fadeOut;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;
        ctx.fill();
        ctx.restore();
      }

      // When sufficiently converged or time elapsed, crystallize into full image
      if (progress >= 0.85 && !isAssembled) {
        setIsAssembled(true);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    // Start animation once container is mounted and image is ready
    const timer = setTimeout(() => {
      startParticleAnimation();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [imageLoaded]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', position: 'relative' }}>
      {/* Cybernetic HUD Frame Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        padding: '0 4px',
        fontFamily: "var(--mono, monospace)",
        fontSize: 11,
        color: 'var(--dim, #8FA6A0)',
        letterSpacing: '1px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isAssembled ? 'var(--mint, #00E5A0)' : '#0091FF',
            boxShadow: isAssembled ? '0 0 8px #00E5A0' : '0 0 8px #0091FF'
          }}></span>
          <span>ASSET // PEGWATCH_OFFICIAL_BANNER</span>
        </div>
        <button
          onClick={startParticleAnimation}
          style={{
            background: 'rgba(0, 229, 160, 0.08)',
            border: '1px solid rgba(0, 229, 160, 0.3)',
            color: 'var(--mint, #00E5A0)',
            borderRadius: 5,
            padding: '3px 9px',
            fontSize: 10.5,
            cursor: 'pointer',
            fontFamily: 'var(--mono, monospace)',
            transition: 'all .2s ease'
          }}
          title="Replay particle materialization"
        >
          ⚡ Replay Assembly
        </button>
      </div>

      {/* Main Banner Box with Reduced Frame */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid var(--line, #1F3240)',
          background: '#070D12',
          boxShadow: isAssembled
            ? '0 20px 50px rgba(0, 145, 255, 0.18), 0 0 30px rgba(0, 229, 160, 0.12)'
            : '0 20px 50px rgba(0, 0, 0, 0.7)',
          aspectRatio: '16 / 9',
          transition: 'box-shadow 0.6s ease, border-color 0.6s ease',
          borderColor: isAssembled ? 'rgba(0, 229, 160, 0.35)' : 'var(--line, #1F3240)'
        }}
      >
        {/* Full Banner Image (Fades in when particles assemble) */}
        <img
          src={imageSrc}
          alt={altText}
          onLoad={() => setImageLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: isAssembled ? 1 : 0,
            transform: isAssembled ? 'scale(1)' : 'scale(1.03)',
            filter: isAssembled ? 'blur(0px)' : 'blur(8px)',
            transition: 'opacity 0.75s ease-out, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), filter 0.65s ease'
          }}
        />

        {/* Canvas Particle Overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />

        {/* Luminous Sweep Scanline during Assembly */}
        {!isAssembled && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(0, 229, 160, 0.12) 50%, rgba(0, 145, 255, 0.25) 52%, transparent 54%)',
              pointerEvents: 'none',
              animation: 'bannerScanSweep 1.8s ease-in-out infinite'
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes bannerScanSweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
