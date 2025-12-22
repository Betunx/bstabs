/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bs-carbon': '#0A0A0A',
        'bs-warm-white': '#FAF9F6',
        'bs-text': '#1A1A1A',
        'bs-gold': '#D4AF37',
        'bs-dark-bg': '#1A1A1A',
        'bs-night-bg': '#2D1B1B',
        'bs-night-text': '#E8D4C4',
        'bs-night-gold': '#C9A86A',
        'bs-oled': '#000000',
      },
      fontFamily: {
        'mono': ['Courier Prime', 'Courier New', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
