import { describe, it, expect } from 'vitest'
import { verifyApiKey } from './auth'

const env = { ADMIN_API_KEY: 'secret-key-123' }
const reqWithKey = (key?: string) =>
  new Request('https://api.test/', { headers: key ? { 'x-api-key': key } : {} })

describe('verifyApiKey', () => {
  it('acepta la API key correcta', () => {
    expect(verifyApiKey(reqWithKey('secret-key-123'), env)).toBe(true)
  })

  it('rechaza una API key incorrecta', () => {
    expect(verifyApiKey(reqWithKey('wrong'), env)).toBe(false)
  })

  it('rechaza cuando falta el header', () => {
    expect(verifyApiKey(reqWithKey(), env)).toBe(false)
  })

  it('no acepta string vacío contra una key configurada', () => {
    expect(verifyApiKey(reqWithKey(''), env)).toBe(false)
  })
})
