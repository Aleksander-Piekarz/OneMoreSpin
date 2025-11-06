/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        'shoulders': ['"Big Shoulders"', '"Bebas Neue"', '"Poppins"', 'sans-serif'],
      },
      animation: {
        'neon-pulse': 'neonPulse 2.8s ease-in-out infinite',
        'neon-pulse-slow': 'neonPulse 3.2s ease-in-out infinite',
      },
      keyframes: {
        neonPulse: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.15)' },
        },
      },
    },
  },
  plugins: [],
}
