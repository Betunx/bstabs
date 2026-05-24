# ORCHESTRATOR — Black Sheep Tabs

> Documento central de coordinación. Fuente de verdad para arquitectura, estado de features y roadmap.
> Última actualización: 2026-05-24

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
- **Sección "Recientes"** en home (`recentSongs`, top 6 por `updatedAt`)
- **Biblioteca de Acordes** v1 — `/acordes` y `/acordes/:root`:
  - Nav horizontal C-D-E-F-G-A-B + acceso rápido a sostenidos
  - 16 variantes (mayor/menor/dim/aug, 7/maj7/m7/m7b5/dim7, sus2/sus4, 6/m6/add9/9/maj9)
  - Notas calculadas en runtime desde intervalos (instrumento-agnóstico)
  - Variante seleccionada vía query param `?v=<suffix>`
  - Placeholder reservado para diagramas (guitarra/piano/bajo)
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

## Roadmap: Aprendizaje & Social (Fase 4)

> Ideas nuevas (2026-05-24) que extienden BSTabs de "biblioteca de tabs" a
> "plataforma de aprendizaje + comunidad". Pensado para CV: demuestra producto
> end-to-end + features sociales reales.

### A) Biblioteca de Acordes (✅ v1 entregada · ❌ extensiones pendientes)

| Sub-feature | Estado | Notas |
|---|---|---|
| Ruta `/acordes` + nav C-D-E-F-G-A-B | ✅ Hecho | `pages/chords/` |
| Cálculo teórico de notas por acorde | ✅ Hecho | `core/services/chord.service.ts` |
| 16 variantes (basic/seventh/sus/extended) | ✅ Hecho | `core/constants/chords.ts` |
| Diagramas SVG para guitarra (digitaciones) | ❌ Pendiente | Define data shape: `{ frets: number[], fingers: number[], barre? }` |
| Diagramas SVG para piano (teclas marcadas) | ❌ Pendiente | Reusar `notes[]` que ya devuelve `ChordService` |
| Diagramas para bajo (4 cuerdas) | ❌ Pendiente | Variante del componente de guitarra |
| Upload de imágenes propias de acordes por admin | ❌ Pendiente | Reutilizar pipeline R2 de artist-images |
| Audio sample (mp3 corto del acorde) | ❌ Idea | Web Audio API generativa o samples grabados |

### B) Solfeo & Teoría Musical Básica

| Sub-feature | Estado | Notas |
|---|---|---|
| Ruta `/teoria` | ❌ Pendiente | Hub: solfeo, intervalos, escalas, círculo de quintas |
| Lecciones de solfeo (lectura de notas en pentagrama) | ❌ Pendiente | Considerar VexFlow para renderizar pentagrama |
| Tabla interactiva de intervalos | ❌ Pendiente | Reutiliza `ChordService.resolve` |
| Círculo de quintas interactivo | ❌ Pendiente | SVG estático con highlight al hacer click |
| Quiz "¿qué acorde es?" (notas → nombre) | ❌ Pendiente | Reverso del `ChordService` — match por intervalos |

### C) Ejercicios de Práctica (Guitarra / Bajo)

| Sub-feature | Estado | Notas |
|---|---|---|
| Ruta `/ejercicios` | ❌ Pendiente | Filtros por instrumento + nivel |
| Modelo `Exercise` en backend | ❌ Pendiente | `{ id, instrument, level, title, tab, bpm, focus, videoUrl? }` |
| Metrónomo integrado | ❌ Pendiente | Web Audio API — click sintético |
| Tracker de progreso por usuario (post-auth) | ❌ Pendiente | Tabla `user_exercise_progress` en Supabase |
| Plan de práctica semanal | ❌ Idea | "Genera mi rutina" según nivel/instrumento |

### D) Capa Social (Likes / Comments / Ratings)

> **Bloqueado por:** Sistema de Auth de usuarios (ya implementado pero requiere
> credenciales Supabase configuradas — ver "Pendiente de configurar para activar Auth").

| Sub-feature | Estado | Prioridad | Notas |
|---|---|---|---|
| Likes en canciones (tabs) | ❌ Pendiente | 🔴 Alta | Tabla `song_likes (user_id, song_id, created_at)` + RLS |
| Rating 1-5 estrellas en canciones | ❌ Pendiente | 🟡 Media | Mejor que likes solos para feedback de calidad |
| Comentarios en canciones | ❌ Pendiente | 🔴 Alta | Tabla `song_comments` con moderación admin |
| Likes/comments en ejercicios | ❌ Pendiente | 🟡 Media | Mismo modelo, distinto recurso |
| Reportar contenido (HTML corrupto, errores) | ⚠️ Parcial | 🟡 Media | `report.service.ts` ya existe — extender |
| Perfil público del usuario (avatar + likes) | ❌ Pendiente | 🟢 Baja | Bonito para CV pero opcional |
| Feed "actividad reciente de la comunidad" | ❌ Idea | 🟢 Baja | Last X likes/comments en home |
| Anti-spam (rate limit por user_id en backend) | ❌ Pendiente | 🔴 Alta | Indispensable antes de abrir comentarios |

### Esquema de DB propuesto (Supabase)

```sql
-- Likes (uno por usuario por recurso)
create table public.likes (
  user_id     uuid not null references auth.users(id) on delete cascade,
  resource_type text not null check (resource_type in ('song','exercise','chord')),
  resource_id text not null,
  created_at  timestamptz default now(),
  primary key (user_id, resource_type, resource_id)
);

-- Comentarios (con moderación)
create table public.comments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  resource_type text not null,
  resource_id  text not null,
  body         text not null check (length(body) between 1 and 1000),
  status       text not null default 'visible' check (status in ('visible','hidden','flagged')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Ratings 1-5
create table public.ratings (
  user_id     uuid not null references auth.users(id) on delete cascade,
  resource_type text not null,
  resource_id text not null,
  stars       smallint not null check (stars between 1 and 5),
  created_at  timestamptz default now(),
  primary key (user_id, resource_type, resource_id)
);
```

### Orden sugerido de implementación

1. **Acordes v2 — Diagramas de guitarra** (1-2 semanas) — completa la feature ya entregada.
2. **Activar Auth** (1 día) — desbloquea toda la sección social.
3. **Likes en canciones** (3 días) — feature social más simple, prueba el patrón.
4. **Comentarios en canciones** (1 semana) — con moderación admin y rate limit.
5. **Ratings** (2 días) — extensión natural de likes.
6. **Ejercicios v1** (1-2 semanas) — modelo + listado + viewer básico.
7. **Solfeo v1** (1-2 semanas) — pentagrama + intervalos (VexFlow).
8. **Diagramas piano/bajo** (1 semana) — completa Acordes.

### Decisiones abiertas

- ¿Likes públicos (anyone can see counts) o privados al usuario?
- ¿Comentarios anidados (threads) o flat?
- ¿Moderación pre-publicación o post-publicación con reportes?
- ¿VexFlow vs SVG manual para pentagramas? (VexFlow = 200KB, SVG = más trabajo pero ligero)

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
