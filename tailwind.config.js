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
        gym: {
          dark: '#0B0D12',
          card: '#14171F',
          cardHover: '#1B202C',
          border: '#232938',
          accent: '#4F7CFF',
          accentGlow: 'rgba(79, 124, 255, 0.25)',
          emerald: '#27D980',
          emeraldGlow: 'rgba(39, 217, 128, 0.25)',
          warning: '#F59E0B',
          danger: '#EF4444',
          subtext: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'Satoshi', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
