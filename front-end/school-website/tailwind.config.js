// school-website/tailwind.config.js
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
        neutral: {
          lightbg: '#FAFAFB',
          card: '#FFFFFF',
          border: '#EFEFEF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 30px rgba(0, 0, 0, 0.03)',
        soft: '0 2px 12px rgba(108, 62, 244, 0.04)'
      }
    },
  },
  plugins: [],
}