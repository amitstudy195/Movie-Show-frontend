/** @type {import('tailwindcss').Config} */
import tailwindcss from '@tailwindcss/vite'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: '#e50914',
        netflixHover: '#b8070f',
        gold: '#ffd700',
        silver: '#c0c0c0',
        bronze: '#cd7f32',
        purple: '#9333ea',
        blue: '#3b82f6',
        green: '#10b981',
        pink: '#ec4899',
        orange: '#f97316',
        cyan: '#06b6d4'
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [tailwindcss()],
}