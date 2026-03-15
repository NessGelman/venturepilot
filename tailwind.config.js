/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          base: '#080c14',
          surface: '#0d1420',
          card: '#111927',
          'card-hover': '#162032',
        },
        border: 'rgba(255,255,255,0.07)',
        accent: '#6366f1',
        'text-primary': '#f0f4ff',
        'text-secondary': '#8ba3c7',
        'text-muted': '#4a6080',
        green: '#10b981',
        amber: '#f59e0b',
        red: '#ef4444',
        purple: '#a855f7',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 32px rgba(99,102,241,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
