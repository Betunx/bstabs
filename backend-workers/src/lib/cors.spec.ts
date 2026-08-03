import { describe, it, expect } from 'vitest'
import { isAllowedOrigin, getCorsHeaders, ALLOWED_ORIGINS } from './cors'

describe('isAllowedOrigin', () => {
  it('acepta los orígenes de la allowlist', () => {
    expect(isAllowedOrigin('https://www.bstabs.com')).toBe(true)
    expect(isAllowedOrigin('https://bstabs.com')).toBe(true)
    expect(isAllowedOrigin('http://localhost:4200')).toBe(true)
  })

  it('acepta previews de Cloudflare Pages (*.bstabs.pages.dev)', () => {
    expect(isAllowedOrigin('https://abc123.bstabs.pages.dev')).toBe(true)
    expect(isAllowedOrigin('https://deadbeef.bstabs.pages.dev')).toBe(true)
  })

  it('rechaza orígenes no permitidos', () => {
    expect(isAllowedOrigin('https://evil.com')).toBe(false)
    expect(isAllowedOrigin('https://bstabs.com.evil.com')).toBe(false)
    expect(isAllowedOrigin('')).toBe(false)
  })

  it('no se deja engañar por subdominios falsos de pages.dev', () => {
    expect(isAllowedOrigin('https://bstabs.pages.dev.evil.com')).toBe(false)
    expect(isAllowedOrigin('http://abc.bstabs.pages.dev')).toBe(false) // http, no https
  })
})

describe('getCorsHeaders', () => {
  const req = (origin?: string) =>
    new Request('https://api.test/', { headers: origin ? { Origin: origin } : {} })

  it('refleja el origen cuando está permitido', () => {
    const headers = getCorsHeaders(req('https://www.bstabs.com'))
    expect(headers['Access-Control-Allow-Origin']).toBe('https://www.bstabs.com')
  })

  it('hace fallback al primer origen permitido cuando no está en la lista', () => {
    const headers = getCorsHeaders(req('https://evil.com'))
    expect(headers['Access-Control-Allow-Origin']).toBe(ALLOWED_ORIGINS[0])
  })

  it('incluye métodos y headers esperados', () => {
    const headers = getCorsHeaders(req())
    expect(headers['Access-Control-Allow-Methods']).toContain('POST')
    expect(headers['Access-Control-Allow-Headers']).toContain('Authorization')
  })
})
