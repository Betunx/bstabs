export const environment = {
  production: false,
  apiUrl: 'https://blacksheep-api.bstabs.workers.dev',
  appUrl: 'http://localhost:4200',
  enableDebugMode: true,
  enableMockData: false,
  // Supabase: copia de Settings → API en tu dashboard de Supabase
  // La anon key es segura para el frontend (tiene RLS aplicado)
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY',
  adminEmail: 'humbertolpzc.work@gmail.com',
};
