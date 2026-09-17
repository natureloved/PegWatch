/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0B0E14',
          subtle: '#0E121B',
        },
        panel: {
          DEFAULT: '#131824',
          elevated: '#1A2234',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        mint: {
          DEFAULT: '#3DF2B6',
          muted: 'rgba(61, 242, 182, 0.12)',
        },
        amber: {
          DEFAULT: '#F5B93D',
          muted: 'rgba(245, 185, 61, 0.15)',
        },
        crimson: {
          DEFAULT: '#F4506A',
          muted: 'rgba(244, 80, 106, 0.15)',
        },
        violet: {
          DEFAULT: '#8B7CF6',
          muted: 'rgba(139, 124, 246, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-red': 'flashRed 0.8s ease-out',
        'flash-delta': 'flashDelta 0.4s ease-out',
      },
      keyframes: {
        flashRed: {
          '0%': { borderColor: '#F4506A', boxShadow: '0 0 25px rgba(244, 80, 106, 0.6)' },
          '100%': { borderColor: 'rgba(255, 255, 255, 0.08)', boxShadow: 'none' },
        },
        flashDelta: {
          '0%': { opacity: '0.4', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
