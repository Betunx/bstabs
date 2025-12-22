/**
 * Production environment configuration
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.bstabs.com/api',
  appUrl: 'https://bstabs.com',
  adminApiKey: '', // Set via environment variable in production
  enableDebugMode: false,
  enableMockData: false,
};
