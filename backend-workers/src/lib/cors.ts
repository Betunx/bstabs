// CORS: allowlist de orígenes. Centralizado y testeable.
// SECURITY: solo se permiten orígenes conocidos + previews de Cloudflare Pages.

export const ALLOWED_ORIGINS = [
  'https://www.bstabs.com',
  'https://bstabs.com',
  'https://bstabs.pages.dev',
  'http://localhost:4200', // Development only
] as const

export function isAllowedOrigin(origin: string): boolean {
  if ((ALLOWED_ORIGINS as readonly string[]).includes(origin)) return true
  // Allow all Cloudflare Pages preview deployments (*.bstabs.pages.dev)
  if (/^https:\/\/[a-z0-9]+\.bstabs\.pages\.dev$/.test(origin)) return true
  return false
}

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || ''
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, Authorization',
  }
}
