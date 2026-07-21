// school-dashboard/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C3EF4',
          light: '#8B64F6',
          dark: '#5229C7',
          50: '#F3EFFF'
        },
        secondary: {
          DEFAULT: '#FFC107',
          light: '#FFD54F',
          dark: '#FFA000'
        },
        sidebar: '#121214',
        surface: '#FAFAFB',
        card: '#FFFFFF'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        linear: '0 1px 2px rgba(0, 0, 0, 0.05)',
        premium: '0 10px 40px -10px rgba(0, 0, 0, 0.04)',
        glow: '0 0 20px rgba(108, 62, 244, 0.15)'
      }
    },
  },
  plugins: [],
}