/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dfe8ff',
          200: '#c4d4ff',
          300: '#9db3ff',
          400: '#7188ff',
          500: '#4a5cf7',
          600: '#3640eb',
          700: '#2c30cc',
          800: '#292aa3',
          900: '#272a80',
          950: '#181a4d',
        },
        ember: {
          50: '#fff4ed',
          100: '#ffe5d3',
          200: '#ffc7a6',
          300: '#ffa06e',
          400: '#ff7033',
          500: '#fd4d0d',
          600: '#ee3403',
          700: '#c52405',
          800: '#9c1e0c',
          900: '#7e1c0d',
          950: '#440b04',
        },
        leaf: {
          50: '#eefbf1',
          100: '#d6f5df',
          200: '#b0e9c1',
          300: '#7bd79b',
          400: '#45bd75',
          500: '#22a058',
          600: '#158046',
          700: '#12653a',
          800: '#125031',
          900: '#10422a',
          950: '#062418',
        },
        surface: {
          light: '#f7f8fc',
          dark: '#0b0d17',
        },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 8px 24px -8px rgba(15, 23, 42, 0.10)',
        glow: '0 0 0 1px rgba(74, 92, 247, 0.15), 0 12px 40px -12px rgba(74, 92, 247, 0.45)',
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 12px 28px -10px rgba(15, 23, 42, 0.18)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)',
        'aurora':
          'radial-gradient(60% 60% at 20% 20%, rgba(74,92,247,0.25) 0%, transparent 60%), radial-gradient(50% 50% at 80% 0%, rgba(253,77,13,0.18) 0%, transparent 60%), radial-gradient(60% 60% at 80% 80%, rgba(34,160,88,0.2) 0%, transparent 60%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: 0, transform: 'translateX(24px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        'shimmer': 'shimmer 1.6s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'toast-in': 'toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
