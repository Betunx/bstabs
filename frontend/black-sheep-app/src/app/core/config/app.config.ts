/**
 * Application-wide configuration constants
 */

export const APP_CONFIG = {
  // Application metadata
  appName: 'Black Sheep Tabs',
  appShortName: 'BS',
  appTitle: 'BS | Tabs',
  appDescription: 'Tablaturas confiables verificadas por músicos reales',
  productionDomain: 'bstabs.com',

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,

  // Search
  minSearchLength: 2,
  maxSearchResults: 10,
  searchDebounceMs: 300,

  // Theme
  defaultTheme: 'dark' as const,
  themes: ['light', 'dark', 'night', 'oled'] as const,

  // Routes
  routes: {
    home: '/',
    artists: '/artists',
    songs: '/songs',
    tutorials: '/tutorials',
    requestSong: '/request-song',
    contact: '/contact',
    donate: '/donate',
    admin: '/admin',
  },

  // External links
  externalLinks: {
    paypal: 'https://paypal.me/Betunx?locale.x=es_XC&country.x=MX',
    github: 'https://github.com/blacksheeptabs',
    instagram: 'https://instagram.com/blacksheeptabs',
  },

  // Validation
  validation: {
    maxTitleLength: 200,
    maxArtistLength: 200,
    maxMessageLength: 1000,
    emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
} as const;

export type ThemeType = typeof APP_CONFIG.themes[number];
