// Copia este archivo como environment.ts y rellena los valores reales
// Los valores de Supabase los encuentras en: Dashboard → Settings → API
// La anon key es segura para el frontend (Supabase aplica RLS sobre ella)
export const environment = {
  production: false,
  apiUrl: 'https://blacksheep-api.bstabs.workers.dev',
  appUrl: 'http://localhost:4200',
  enableDebugMode: true,
  enableMockData: false,
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY',
  adminEmail: 'tu@email.com',
};
