/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        upay: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          brand: '#00875A', // Upay Deep Emerald
          dark: '#0A2518',  // Upay Deep Charcoal Forest
          navy: '#06160F',
          gold: '#FFAB00',
          alert: '#DE350B',
          surface: '#F4F5F7',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'Hind Siliguri', 'sans-serif'],
      },
      boxShadow: {
        'fintech': '0 4px 20px -2px rgba(10, 37, 24, 0.08), 0 2px 6px -1px rgba(10, 37, 24, 0.04)',
        'fintech-lg': '0 12px 32px -4px rgba(10, 37, 24, 0.12), 0 4px 12px -2px rgba(10, 37, 24, 0.06)',
        'glow-green': '0 0 24px -2px rgba(0, 135, 90, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
      }
    },
  },
  plugins: [],
}
