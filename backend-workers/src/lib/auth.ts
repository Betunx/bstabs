// Verificación de credenciales admin. La parte estática (API key) es pura y
// testeable; la verificación de JWT vive en index.ts porque necesita el cliente
// Supabase en runtime.

export interface ApiKeyEnv {
  ADMIN_API_KEY: string
}

// Verificar API Key estática (scripts, uploads de imágenes, compatibilidad)
export function verifyApiKey(request: Request, env: ApiKeyEnv): boolean {
  const apiKey = request.headers.get('x-api-key')
  return apiKey === env.ADMIN_API_KEY
}
