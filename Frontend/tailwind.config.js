import { COLORS } from './src/constants/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Usando las constantes centralizadas - ACTUALIZADAS
        'primary': COLORS.primary,
        'primary-hover': COLORS.primaryHover,
        'primary-light': COLORS.primaryLight,
        'dark-bg': COLORS.darkBg,
        'dark-bg-secondary': COLORS.darkBgSecondary,
        'dark-bg-tertiary': COLORS.darkBgTertiary,
        'light-bg': COLORS.lightBg,
        'light-bg-secondary': COLORS.lightBgSecondary,
      }
    },
  },
  plugins: [],
}