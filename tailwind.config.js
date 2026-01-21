/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        critical: '#ff6b6b',
        warning: '#ffd93d',
        good: '#95e1d3',
        background: '#f8f9fa',
      },
    },
  },
  plugins: [],
}
