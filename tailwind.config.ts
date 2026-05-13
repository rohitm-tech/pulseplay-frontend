import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#03140c',
          900: '#052a18',
          800: '#0a3d24',
          700: '#0f5132',
        },
        flood: {
          400: '#5eead4',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
        strobe: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(45, 212, 191, 0.25)',
        card: '0 8px 32px rgba(0, 0, 0, 0.35)',
      },
      keyframes: {
        pulseLive: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
      },
      animation: {
        'pulse-live': 'pulseLive 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
