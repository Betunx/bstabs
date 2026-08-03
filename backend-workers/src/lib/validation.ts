// Validación y sanitización de inputs públicos. Centralizado y testeable.

export type MusicGenre =
  | 'Rock'
  | 'Pop'
  | 'Balada'
  | 'Corrido'
  | 'Norteño'
  | 'Banda'
  | 'Regional Mexicano'
  | 'Ranchera'
  | 'Metal'
  | 'Punk'
  | 'Indie'
  | 'Folk'
  | 'Blues'
  | 'Jazz'
  | 'Gospel/Cristiana'
  | 'Cumbia'
  | 'Salsa'
  | 'Reggae'
  | 'Country'
  | 'Alternativo'

export const VALID_GENRES: MusicGenre[] = [
  'Rock',
  'Pop',
  'Balada',
  'Corrido',
  'Norteño',
  'Banda',
  'Regional Mexicano',
  'Ranchera',
  'Metal',
  'Punk',
  'Indie',
  'Folk',
  'Blues',
  'Jazz',
  'Gospel/Cristiana',
  'Cumbia',
  'Salsa',
  'Reggae',
  'Country',
  'Alternativo',
]

// SECURITY: Validación y sanitización de inputs.
// El sanitizer ataca dos vectores:
// 1. XSS si el query se refleja en HTML: strip < > " '
// 2. Inyección en `.or()` de Supabase: strip , ( ) y * (operadores de PostgREST)
//    PostgREST parsea .or('col.op.val,col.op.val'), si val contiene comas o
//    paréntesis puede inyectar filtros adicionales o subconsultas.
export function validateSearchQuery(query: string): {
  valid: boolean
  sanitized: string
  error?: string
} {
  if (!query || query.trim().length === 0) {
    return { valid: false, sanitized: '', error: 'Search query cannot be empty' }
  }

  if (query.length > 100) {
    return { valid: false, sanitized: '', error: 'Search query too long (max 100 chars)' }
  }

  // XSS + PostgREST operators + LIKE wildcards
  const sanitized = query.trim().replace(/[<>"',()*\\%]/g, '')

  return { valid: true, sanitized }
}

export function validateGenre(genre: string): { valid: boolean; error?: string } {
  if (!VALID_GENRES.includes(genre as MusicGenre)) {
    return { valid: false, error: `Invalid genre. Must be one of: ${VALID_GENRES.join(', ')}` }
  }

  return { valid: true }
}
