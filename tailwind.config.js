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
          surface: '#0a0f1a',
          glass: 'rgba(13,20,32,0.92)',
          card: '#111927',
          'card-hover': '#162032',
          'nav-hover': 'rgba(30,64,175,0.15)',
        },
        border: 'rgba(255,255,255,0.07)',
        'border-accent': 'rgba(30,64,175,0.4)',
        accent: '#1e40af',
        'accent-glow': 'rgba(30,64,175,0.25)',
        'text-glow': 'rgba(240,244,255,0.1)',
        'text-primary': '#f0f4ff',
        'text-secondary': '#8ba3c7',
        'text-muted': '#4a6080',
        green: '#059669',
        amber: '#f59e0b',
        red: '#ef4444',
      },
      backdropBlur: {
        xs: '2px',
        sm: '12px',
      },
      boxShadow: {
        glow: '0 0 32px rgba(30,64,175,0.25)',
        'glow-lg': '0 0 48px rgba(30,64,175,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
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
        glowPulse: {
          '0%': { boxShadow: '0 0 20px var(--accent-glow)' },
          '100%': { boxShadow: '0 0 40px var(--accent-glow)' },
        },
      },
    },
  },

  plugins: [],
};
