import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Los helpers extraídos son puros y usan Web APIs globales (Request/Headers),
    // disponibles en Node 18+. No necesitamos el pool de workers todavía.
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.spec.ts'],
    },
  },
})
