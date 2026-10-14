/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F7F8FA',
          dark: '#0B0F17',
        },
        card: {
          light: '#FFFFFF',
          dark: '#131926',
        },
        navy: {
          900: '#0F172A',
          800: '#17202F',
          700: '#233044',
          600: '#334155',
          500: '#475569',
        },
        primary: {
          DEFAULT: '#5B5CE2',
          hover: '#4A4BC8',
          light: '#EEF0FF',
          dark: '#4344B5',
        },
        border: {
          light: '#E7E9EF',
          dark: '#1E293B',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#78350F',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          dark: '#7F1D1D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 2px 8px -2px rgba(23, 32, 47, 0.06), 0 1px 4px -1px rgba(23, 32, 47, 0.04)',
        glow: '0 0 20px -3px rgba(91, 92, 226, 0.35)',
      }
    },
  },
  plugins: [],
}
