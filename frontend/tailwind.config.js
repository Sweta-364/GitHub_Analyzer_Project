/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['JetBrains Mono', 'Fira Code', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#090e1a',
        },
        term: {
          bg:        '#0a0a0a',
          pane:      '#0d1a0d',
          green:     '#33ff00',
          dim:       '#22aa00',
          border:    '#1f521f',
          amber:     '#ffb000',
          'amber-dim': '#7a5500',
          red:       '#ff3333',
          muted:     '#4a7a4a',
          ghost:     '#111111',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'blink':      'blink 1s step-end infinite',
        'glitch':     'glitch 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                    to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        blink:   { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
        glitch:  {
          '0%, 100%': { transform: 'translate(0)' },
          '2%':  { transform: 'translate(-2px, 1px)' },
          '4%':  { transform: 'translate(2px, -1px)' },
          '6%':  { transform: 'translate(0)' },
        },
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 25%, rgba(51,255,0,0.05) 50%, transparent 75%)',
      },
    },
  },
  plugins: [],
}
