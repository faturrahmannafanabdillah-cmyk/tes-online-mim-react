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
          DEFAULT: '#0056b3',
          dark: '#003d80',
          light: '#e8f0fb',
        },
        danger: '#dc3545',
        warning: '#f59e0b',
        success: '#16a34a',
      },
    },
  },
  plugins: [],
}
