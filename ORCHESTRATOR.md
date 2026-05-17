# ORCHESTRATOR — Black Sheep Tabs

> Documento central de coordinación. Fuente de verdad para arquitectura, estado de features y roadmap.
> Última actualización: Mayo 2026

---

## Arquitectura del Monorepo (pnpm Workspace)

```
bstabs/                              ← raíz del workspace
├── pnpm-workspace.yaml              ← define los packages del monorepo
├── .npmrc                           ← config pnpm (hoisting para Angular)
├── ORCHESTRATOR.md                  ← este archivo
├── CLAUDE.md                        ← guía para Claude Code
├── PLAN-MEJORAS-UI.md               ← plan detallado de UI/UX
│
├── frontend/black-sheep-app/        ← Angular 20 SPA
│   ├── src/app/
│   │   ├── core/services/           ← songs, artists, admin, search, theme
│   │   ├── pages/                   ← home, songs, artists, tab-reader, contact...
│   │   ├── admin/                   ← dashboard + tab-editor (branch admin only)
│   │   └── shared/components/       ← tab-viewer, skeleton-loader, song-list...
│   └── src/environments/            ← config API URL
│
├── backend-workers/src/index.ts     ← Cloudflare Workers API (603 líneas → refactor pendiente)
│
└── scripts/
    ├── scraper/                     ← Node.js scraper de acordes
    └── migrations/                  ← SQL migrations de Supabase
```

---

## Stack Tecnológico

| Capa | Tecnología | Versión | Estado |
|------|------------|---------|--------|
| Frontend | Angular | 20.3 | ✅ Producción |
| Styling | Tailwind CSS | 3.x + SCSS | ✅ |
| Package Manager | **pnpm** | 9+ | 🔄 Migrando desde npm |
| Backend | Cloudflare Workers | - | ✅ Producción |
| Database | Supabase PostgreSQL | - | ✅ |
| Storage | Cloudflare R2 | - | ✅ (imágenes artistas) |
| Deploy | Cloudflare Pages | - | ✅ |
| Runtime | Node.js | 24.x | ✅ |

---

## Estado de Features

### ✅ Completado

- Angular 20 con Signals + Standalone Components
- Sistema de géneros musicales (20 géneros) en Songs page
- Búsqueda con autocomplete conectada a API real
- 4 temas (light / dark / night-red / oled) **con persistencia en localStorage**
- Cache strategy (5 min TTL + stale fallback)
- Retry interceptor con exponential backoff
- Skeleton loaders (song-list, artist-grid)
- Imágenes de artistas en Cloudflare R2
- CORS seguro con lista de origenes permitidos
- API key admin removida del código fuente
- **pnpm workspace monorepo** (migrado desde npm — Mayo 2026)
- **Sistema de Auth** (Supabase Auth — Google + Email/Password):
  - `AuthService` con Signals (`isAuthenticated`, `isAdmin`, `user`, `displayName`)
  - Guard `authGuard` protege `/request-song`
  - Página `/auth/login` — Google OAuth + Email/Password + Registro
  - Página `/auth/callback` — maneja redirect OAuth
  - Header con botón Login / Avatar dropdown / Logout
  - Admin link en header solo visible para `adminEmail`
  - Mobile nav con botón Login / Pedir

### ⚠️ Pendiente de configurar para activar Auth

- [ ] Llenar `supabaseUrl` y `supabaseAnonKey` en `environment.ts` y `environment.prod.ts`
- [ ] Configurar Google OAuth en Supabase dashboard (Authentication → Providers)
- [ ] Agregar redirect URLs en Supabase: `localhost:4200/auth/callback`, `bstabs.com/auth/callback`, `bstabs.pages.dev/auth/callback`

### 🔄 En Progreso / Próximo Sprint

- [ ] Filtro de género en **Artists page** (Songs ya lo tiene)
- [ ] Toast notification system
- [ ] Paginación / Infinite scroll en Songs y Artists

### ❌ Pendiente (Fase 2-3)

- [ ] Login admin con página real (eliminar `prompt()`)
- [ ] Sistema de auth para usuarios (ver sección Auth)
- [ ] Formulario de contacto con backend (Cloudflare Email Workers)
- [ ] PDF upload real (Cloudflare R2 + parsing)
- [ ] Editor de tabs sin `prompt()` (modal personalizado)
- [ ] Chord diagrams (Canvas/SVG)
- [ ] Transposición de acordes
- [ ] Error boundaries / fallback pages
- [ ] PWA / Service Worker

---

## Sistema de Auth

### Estado Actual ⚠️

| Actor | Método | Problema |
|-------|--------|---------|
| Admin | `prompt()` + API key en sesión | UX pésima, sin página de login real |
| Usuarios | Ninguno | El sitio es 100% público, sin cuentas |
| Backend | `x-api-key` header | Sólido, pero sin rate limiting ni brute-force protection |

### Roadmap de Auth

```
Fase A — Admin login real (prioridad alta, ~1 semana):
  ├── Crear página /admin/login con formulario real
  ├── Guardar API key en sessionStorage (no persiste entre pestañas por seguridad)
  ├── Guard de Angular que redirige a /admin/login si no autenticado
  └── Auto-clear al cerrar sesión

Fase B — Auth de usuarios (futuro, si se necesita):
  ├── Opción recomendada: Supabase Auth (ya tenemos Supabase, es gratis)
  ├── Features que habilita: favoritos, historial de vistas, requests con cuenta
  └── Alternativa minimalista: Cloudflare Access (solo para admin)
```

---

## Deuda Técnica Prioritaria

| Prioridad | Item | Ubicación | Impacto |
|-----------|------|-----------|---------|
| 🔴 Alta | `index.ts` backend > 600 líneas | `backend-workers/src/index.ts` | Mantenibilidad |
| 🔴 Alta | Configurar Supabase credentials + Google OAuth | `environment.ts` | Auth no funciona sin esto |
| 🟡 Media | `corsHeaders` duplicado (legacy vs getCorsHeaders) | `backend/index.ts:88-93` | Código muerto |
| 🟡 Media | Sin paginación en `/songs` API | `backend/index.ts:166+` | Performance |
| 🟡 Media | Sin paginación en frontend Songs/Artists | `pages/songs/songs.ts` | Performance |
| 🟡 Media | Dashboard de usuario (`/dashboard`) — ver mis requests | Pendiente crear | UX |
| 🟢 Baja | 4 canciones con HTML corrupto | Supabase DB | Calidad datos |
| 🟢 Baja | ~60 canciones duplicadas | Supabase DB | Calidad datos |

---

## Datos de la DB

- **Total canciones publicadas:** ~518
  - Pop: 279 · Rock: 197 · Metal: 42 · Otros: ~100
- **Sin paginación:** la API retorna todas las canciones en un solo request

---

## Branching Strategy

| Rama | URL pública | Contiene |
|------|-------------|---------|
| `main` | https://www.bstabs.com | Solo rutas públicas. Sin /admin. |
| `admin` | https://bstabs.pages.dev | Todo lo de main + /admin + /admin/editor |

**Regla:** Features públicas → merge a ambas ramas. Features admin-only → solo a `admin`.

---

## Comandos del Workspace (pnpm)

```bash
# Instalar todas las dependencias del monorepo desde la raíz
pnpm install

# Desarrollo
pnpm --filter black-sheep-app start              # ng serve → localhost:4200
pnpm --filter blacksheep-api-workers dev         # wrangler dev

# Build y Deploy
pnpm --filter black-sheep-app run deploy          # Build + deploy → bstabs.com
pnpm --filter black-sheep-app run deploy:admin    # Build + deploy → bstabs.pages.dev
pnpm --filter blacksheep-api-workers run deploy   # Deploy Workers API
```

---

## Próximos Pasos (Próxima sesión)

1. **Configurar Supabase credentials** en `environment.ts` y `environment.prod.ts`
2. **Activar Google OAuth** en Supabase dashboard + agregar redirect URLs
3. **Probar flujo completo** de auth en localhost (`pnpm start`)
4. **Filtro de género en Artists page** (feature incompleta, código simple)
5. **Dashboard de usuario** — página `/dashboard` con historial de requests del usuario

---

_Relacionado: [CLAUDE.md](CLAUDE.md) · [PLAN-MEJORAS-UI.md](PLAN-MEJORAS-UI.md)_
