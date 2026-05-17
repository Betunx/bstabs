/**
 * Production environment configuration
 *
 * SECURITY CRITICAL:
 * - API key 'bs_admin_prod_2025_Kj8Nx2Qm9Tz7Wv5Yr4Lp' was REMOVED
 * - Exposing API keys in frontend = MAJOR SECURITY VULNERABILITY
 * - Anyone can inspect compiled JS and get admin access
 * - Admin MUST enter API key manually or use proper OAuth/JWT auth
 */
export const environment = {
  production: true,
  apiUrl: 'https://blacksheep-api.bstabs.workers.dev',
  appUrl: 'https://www.bstabs.com',
  enableDebugMode: false,
  enableMockData: false,
  // Supabase: copia de Settings → API en tu dashboard de Supabase
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY',
  adminEmail: 'humbertolpzc.work@gmail.com',
};
