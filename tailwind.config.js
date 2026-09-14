/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36aaf5',
          500: '#0c8ee6',
          600: '#0171c6',
          700: '#025aa1',
          800: '#064d84',
          900: '#0b416e',
          950: '#072a4a',
        },
        accent: {
          terracotta: '#E05D44',
          coral: '#FF6B6B',
          amber: '#F59E0B',
          emerald: '#10B981',
          violet: '#8B5CF6',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
        'floating': '0 10px 30px -5px rgba(15, 23, 42, 0.18)',
        'sheet': '0 -8px 30px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        }
      },
      animation: {
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
