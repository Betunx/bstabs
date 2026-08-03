import { describe, it, expect } from 'vitest'
import { validateSearchQuery, validateGenre, VALID_GENRES } from './validation'

describe('validateSearchQuery', () => {
  it('rechaza query vacío o solo espacios', () => {
    expect(validateSearchQuery('').valid).toBe(false)
    expect(validateSearchQuery('   ').valid).toBe(false)
  })

  it('rechaza query mayor a 100 caracteres', () => {
    const res = validateSearchQuery('a'.repeat(101))
    expect(res.valid).toBe(false)
    expect(res.error).toContain('too long')
  })

  it('acepta query normal y lo recorta', () => {
    const res = validateSearchQuery('  hola mundo  ')
    expect(res.valid).toBe(true)
    expect(res.sanitized).toBe('hola mundo')
  })

  // SECURITY: el sanitizer debe neutralizar inyección PostgREST y XSS
  it('elimina operadores PostgREST y wildcards (, ( ) * % \\)', () => {
    const res = validateSearchQuery('a,b(c)*d%e\\f')
    expect(res.valid).toBe(true)
    expect(res.sanitized).toBe('abcdef')
  })

  it('elimina caracteres XSS (< > " \')', () => {
    const res = validateSearchQuery('<script>"x\'')
    expect(res.valid).toBe(true)
    expect(res.sanitized).toBe('scriptx')
  })

  it('un payload de inyección no deja metacaracteres', () => {
    const { sanitized } = validateSearchQuery('x),(select')
    expect(sanitized).not.toMatch(/[,()*%\\<>"']/)
  })
})

describe('validateGenre', () => {
  it('acepta todos los géneros válidos', () => {
    for (const g of VALID_GENRES) {
      expect(validateGenre(g).valid).toBe(true)
    }
  })

  it('rechaza un género inexistente', () => {
    const res = validateGenre('Reggaeton')
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Invalid genre')
  })

  it('mantiene el máximo de 20 géneros', () => {
    expect(VALID_GENRES).toHaveLength(20)
  })
})
