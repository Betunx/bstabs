// Copia este archivo como environment.prod.ts y rellena los valores reales
// Este archivo se usa en el build de producción (ng build --configuration production)
export const environment = {
  production: true,
  apiUrl: 'https://blacksheep-api.bstabs.workers.dev',
  appUrl: 'https://www.bstabs.com',
  enableDebugMode: false,
  enableMockData: false,
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY',
  adminEmail: 'tu@email.com',
};
