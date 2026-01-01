/**
 * Development environment configuration
 *
 * SECURITY NOTE:
 * - adminApiKey was REMOVED for security (API keys visible in compiled JS)
 * - Admin must enter API key manually in login screen
 * - TODO: Implement proper auth (OAuth, JWT, or Cloudflare Access)
 */
export const environment = {
  production: false,
  apiUrl: 'https://blacksheep-api.bstabs.workers.dev',
  appUrl: 'http://localhost:4200',
  enableDebugMode: true,
  enableMockData: false,
};
