/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          900: '#050510',
          800: '#0a0a1a',
          700: '#111122',
          600: '#1a1a2e',
          500: '#242438',
        },
        cyber: {
          cyan: '#00f5ff',
          blue: '#00a8ff',
          purple: '#a855f7',
          pink: '#ec4899',
        },
        neon: {
          emerald: '#10b981',
          green: '#22c55e',
          red: '#ef4444',
          coral: '#f97316',
          amber: '#fbbf24',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'progress': 'progress 1s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        progress: {
          '0%': { strokeDashoffset: '440' },
          '100%': { strokeDashoffset: 'var(--progress-offset)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 245, 255, 0.3)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.3)',
        'glow-amber': '0 0 15px rgba(251, 191, 36, 0.3)',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
