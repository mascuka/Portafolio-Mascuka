/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fondo': '#0B0E14', // El negro profundo de la imagen de Jacob
        'celeste': '#00F2FF', // El celeste brillante para resaltar
      }
    },
  },
  plugins: [],
}