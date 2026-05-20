/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '6xl': ['60px', { lineHeight: '68px', letterSpacing: '-0.04em' }],
        '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.035em' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.03em' }],
        '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.025em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        'xl':  ['20px', { lineHeight: '28px', letterSpacing: '-0.015em' }],
        'lg':  ['17px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        'base':['15px', { lineHeight: '22px', letterSpacing: '0' }],
        'sm':  ['13px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'xs':  ['11px', { lineHeight: '16px', letterSpacing: '0.06em' }],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          container: '#DBEAFE',
          on: '#ffffff',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          container: '#EFF6FF',
          on: '#1D4ED8',
        },
        tertiary: {
          DEFAULT: '#6E6E73',
          container: '#F5F5F7',
          on: '#1D1D1F',
        },
        surface: {
          lowest: '#F5F5F7',
          low: '#FAFAFA',
          high: '#E5E5EA',
          highest: '#D1D1D6',
          bright: '#ffffff',
        },
        background: '#ffffff',
      },
      boxShadow: {
        'sm':  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'md':  '0 4px 16px rgba(0,0,0,0.08)',
        'lg':  '0 8px 32px rgba(0,0,0,0.12)',
        'glow-blue': '0 0 0 4px rgba(37,99,235,0.15)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      keyframes: {
        'sla-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'sla-pulse': 'sla-pulse 1.5s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
