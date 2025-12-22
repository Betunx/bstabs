/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Activar soporte para múltiples temas
  theme: {
    extend: {
      colors: {
        // Black Sheep Custom Palette
        'bs-carbon': '#0A0A0A',        // Header carbon black
        'bs-warm-white': '#FAF9F6',    // Background warm white
        'bs-text': '#1A1A1A',          // Typewriter black
        'bs-gold': '#D4AF37',          // Golden amber (donate button)
        'bs-dark-bg': '#1A1A1A',       // Dark mode background
        'bs-night-bg': '#2D1B1B',      // Night red background
        'bs-night-text': '#E8D4C4',    // Night mode text
        'bs-night-gold': '#C9A86A',    // Night mode accent
        'bs-oled': '#000000',          // OLED pure black
      },
      fontFamily: {
        'mono': ['Courier Prime', 'Courier New', 'monospace'], // Para tabs
        'sans': ['Inter', 'system-ui', 'sans-serif'],          // Para UI
      },
    },
  },
  plugins: [],
}
