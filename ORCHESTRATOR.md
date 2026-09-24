# ORCHESTRATOR — Black Sheep Tabs

> Fuente de verdad para arquitectura, estado de features y roadmap.
> Última auditoría completa: **2026-09-24** (código, tests, CI y versiones verificados).
>
> - **Bitácora de sesiones:** [ESTADO-SESION.md](ESTADO-SESION.md)
> - **Captura de canciones:** [PLAN-FLUJO-CONTENIDO.md](PLAN-FLUJO-CONTENIDO.md)
> - **Cómo revisar un PR:** [REVIEW.md](REVIEW.md)
> - **Históricos cumplidos:** [docs/archive/](docs/archive/README.md)

---

## Rutina diaria

Proyecto formalizado: **nada entra a `main` sin PR**. Un PR por tema, aunque sea pequeño.

```bash
# 1. Arrancar
git checkout main && git pull
# Leer la entrada más reciente de ESTADO-SESION.md

# 2. Rama por tema (prefijos)
git checkout -b content/2026-09-24-corridos   # canciones nuevas o limpieza de datos
git checkout -b feat/toasts                   # feature
git checkout -b fix/editor-genre              # bug
git checkout -b docs/...  |  chore/...        # docs, tooling

# 3. Trabajar
pnpm --filter black-sheep-app start           # editor admin: /admin/editor → "Importar pegando texto"

# 4. Antes de push (lo mismo que corre CI)
pnpm run lint && pnpm test

# 5. Push + PR en GitHub → revisar "Files changed" con REVIEW.md → merge
git push -u origin <rama>

# 6. Cerrar el día: agregar entrada en ESTADO-SESION.md (qué hice, qué sigue)
```

**Contenido (canciones y limpieza de DB):** agregar canciones pasa por el editor admin
y no genera diff de código. Por eso no requiere PR. Sí lleva PR todo script o migración
SQL de limpieza (`scripts/`), y se anota en la bitácora cuántas canciones se
agregaron o corrigieron.

---

## Arquitectura del Monorepo (pnpm Workspace)

```
bstabs/                              ← raíz del workspace
├── ORCHESTRATOR.md                  ← este archivo (roadmap)
├── ESTADO-SESION.md                 ← bitácora por sesión
├── CLAUDE.md                        ← reglas para Claude Code
├── REVIEW.md                        ← checklist de code review
├── PLAN-FLUJO-CONTENIDO.md          ← captura/curación de canciones
├── .github/                         ← CI + plantilla de PR
│
├── frontend/black-sheep-app/        ← Angular 20 SPA (+ PWA)
│   ├── public/                      ← favicon, manifest.webmanifest, icons/, _redirects
│   ├── ngsw-config.json             ← caché del service worker
│   └── src/app/
│       ├── core/services/           ← songs, artists, admin, auth, search, chord, report
│       ├── core/utils/tab-parser.ts ← parser de tabs pegadas (dos líneas / ChordPro)
│       ├── pages/                   ← home, songs, artists, tab-reader, chords, auth…
│       ├── admin/                   ← admin-dashboard + tab-editor (protegidos por adminGuard)
│       └── shared/components/       ← tab-viewer, skeleton-loader, song-list…
│
├── backend-workers/
│   ├── src/index.ts                 ← router + endpoints (654 líneas → refactor pendiente)
│   └── src/lib/                     ← helpers puros con tests: auth, cors, validation
│
└── scripts/
    ├── scraper/                     ← extracción → procesamiento → importación
    ├── migrations/                  ← SQL de Supabase
    └── predeploy-guard.mjs          ← bloquea deploy si faltan environments
```

---

## Stack y versiones (auditado 2026-09-24)

| Capa            | Tecnología                    | Versión actual | Latest publicado |
| --------------- | ----------------------------- | -------------- | ---------------- |
| Frontend        | Angular (Signals, zone.js)    | 20.3           | 22.2             |
| Styling         | Tailwind CSS + SCSS           | 3.4            | 4.3              |
| Lenguaje        | TypeScript                    | 5.9            | 7.0              |
| Lint            | ESLint / angular-eslint       | 9.39 / 21.0    | 10.11 / 22.5     |
| Tests frontend  | Karma + Jasmine               | 6.4 / 5.9      | (deprecado v21+) |
| Tests backend   | Vitest                        | 3.2            | 5.0              |
| Backend         | Cloudflare Workers (wrangler) | 4.54           | 4.139            |
| Auth + DB       | Supabase (supabase-js)        | 2.89           | 2.117            |
| Storage         | Cloudflare R2                 | —              | —                |
| Deploy          | Cloudflare Pages              | —              | —                |
| Package manager | pnpm (corepack)               | 11.9.0         | —                |
| Runtime         | Node (`.nvmrc`)               | 22.20          | 24 LTS           |

### Decisión: ¿actualizar ya?

**No en este momento.** Nada está roto ni inseguro, CI está verde, y los majors cambian
el modo de trabajar (Angular 21+ es zoneless y usa Vitest por defecto; Tailwind 4 cambia
la config a CSS-first). Mezclarlos con el trabajo diario de contenido sería arriesgado.

Se hará como **Fase M**, una sesión dedicada por paso, cada uno en su PR con CI verde:

1. Minors seguros: supabase-js, wrangler, workers-types, typescript-eslint, prettier.
2. Vitest 3 → 5 (backend, bajo riesgo).
3. Angular 20 → 21 (`ng update @angular/core@21 @angular/cli@21`), revisar zoneless.
4. Angular 21 → 22 + angular-eslint 22 + ESLint 10. Migrar specs Karma → Vitest.
5. Tailwind 3 → 4 (sola, sin features en el mismo PR).

Hacerla **antes** de empaquetar la app para Play Store (TWA), para publicar sobre base nueva.

---

## Estado de Features

### ✅ Funcionando

- Angular 20 con Signals + Standalone Components, rutas lazy con preloading
- Búsqueda con autocomplete conectada a la API (`/songs/search`)
- **Filtro de género en Songs y en Artists** (Artists desde `8f57107`, ene 2026)
- 4 temas (light / dark / night-red / oled) con persistencia en localStorage
- Cache 5 min TTL + retry interceptor con backoff exponencial + skeleton loaders
- Imágenes de artistas en Cloudflare R2 con fallback de iniciales
- CORS con lista de orígenes permitidos, validación de inputs en backend
- **Auth Supabase** (email + Google): `authGuard`, `adminGuard`, JWT validado en el Worker
- **Editor admin**: importar pegando texto (dos líneas o ChordPro), secciones ChordPro,
  preview en vivo, borradores, `GET /admin/songs/:id`
- Dashboard admin: pestañas pendientes / borradores / requests + contadores (`/admin/stats`)
- Reportar canción (reusa `POST /requests` con `type: 'edit'`)
- Biblioteca de acordes v1 (`/acordes`, 16 variantes)
- Tests: 20 backend (Vitest) + 48 frontend (Karma); CI con lint, tests, build y dry-run
- **PWA instalable** (manifest + service worker) — 2026-09-24, pendiente de deploy

### ⚠️ Parcial / requiere acción fuera del código

- **RLS en Supabase sin verificar** (`songs`, `song_requests`) — 🔴 crítico, ver bitácora
- Google OAuth: cliente en Google Cloud + provider en Supabase sin confirmar
- `scripts/migrations/user-library.sql` (favoritos/playlists con RLS) escrito, **no ejecutado**
- Corazón de favorito en `tab-viewer` es cosmético (signal sin persistir)
- Upload de PDF en admin es **mock** (`admin-dashboard.ts`, `setTimeout` simulado)
- Página `pages/tutorials/` existe pero **no tiene ruta** → decidir: enrutar o borrar

### ❌ Pendiente

| Item                                                  | Área     | Prioridad |
| ----------------------------------------------------- | -------- | --------- |
| Rate-limit / captcha en `POST /requests`              | Backend  | 🔴 Alta   |
| Auditor de catálogo (duplicados, HTML roto) — Fase D  | Datos    | 🔴 Alta   |
| Import por URL (`import-url.js`) — Fase B             | Datos    | 🟡 Media  |
| Dashboard de usuario `/dashboard` (favoritos, listas) | Frontend | 🟡 Media  |
| Toast notifications                                   | Frontend | 🟡 Media  |
| Paginación en `/songs` (API + UI)                     | Ambos    | 🟡 Media  |
| "¿Olvidaste tu contraseña?" + verificación de email   | Auth     | 🟡 Media  |
| Formulario de contacto con backend                    | Ambos    | 🟢 Baja   |
| Error boundaries / página de error                    | Frontend | 🟢 Baja   |
| Modo "solo letras" (acordes aún ocupan espacio)       | Frontend | 🟢 Baja   |
| Transposición de acordes                              | Frontend | 🟢 Baja   |
| PDF upload real (R2 + parsing)                        | Ambos    | 🟢 Baja   |
| Lighthouse > 90 en Performance y Accessibility        | Frontend | 🟢 Baja   |

---

## Roadmap Android

Camino elegido: **PWA → TWA (Trusted Web Activity) en Play Store**. Una sola base de
código Angular; la app de Android es un contenedor de Chrome que abre bstabs.com a
pantalla completa, sin barra de URL. No requiere Java/Kotlin.

| Paso | Qué                                                                               | Estado       |
| ---- | --------------------------------------------------------------------------------- | ------------ |
| 1    | PWA: manifest, service worker, íconos, instalable desde Chrome                    | ✅ En PR     |
| 1b   | Reemplazar íconos provisionales "BS" por el logo real (192, 512 y maskable)       | ❌ Pendiente |
| 1c   | Deploy a bstabs.com y validar con Lighthouse (sección PWA "Installable")          | ❌ Pendiente |
| 2    | Fase M (actualizar stack) antes de publicar                                       | ❌ Pendiente |
| 3    | Cuenta Google Play Console (pago único USD 25)                                    | ❌ Pendiente |
| 4    | `npx @bubblewrap/cli init --manifest=https://www.bstabs.com/manifest.webmanifest` | ❌ Pendiente |
| 5    | Guardar el keystore y su contraseña fuera del repo (si se pierde, no hay updates) | ❌ Pendiente |
| 6    | Publicar `public/.well-known/assetlinks.json` con el SHA-256 del keystore         | ❌ Pendiente |
| 7    | `bubblewrap build` → subir `.aab` a Play Console, prueba interna → producción     | ❌ Pendiente |

**Cuándo pasar a Capacitor en vez de TWA:** solo si hace falta algo nativo que la web no
da (notificaciones push nativas complejas, acceso a archivos del teléfono, audio de baja
latencia para metrónomo/afinador). Hoy nada del roadmap lo exige.

**Notas de la PWA:** el service worker solo corre en build de producción. Cachea la app
shell y, con estrategia _freshness_ (red primero), las respuestas de `/songs` por 1 día,
así que las canciones ya vistas se leen sin conexión. Al publicar una versión nueva, el
SW la descarga en segundo plano y se activa en la siguiente visita.

---

## Roadmap: Aprendizaje & Social (Fase 4)

> Ideas nuevas (2026-05-24) que extienden BSTabs de "biblioteca de tabs" a
> "plataforma de aprendizaje + comunidad". Pensado para CV: demuestra producto
> end-to-end + features sociales reales.

### A) Biblioteca de Acordes (✅ v1 entregada · ❌ extensiones pendientes)

| Sub-feature                                     | Estado       | Notas                                                               |
| ----------------------------------------------- | ------------ | ------------------------------------------------------------------- |
| Ruta `/acordes` + nav C-D-E-F-G-A-B             | ✅ Hecho     | `pages/chords/`                                                     |
| Cálculo teórico de notas por acorde             | ✅ Hecho     | `core/services/chord.service.ts`                                    |
| 16 variantes (basic/seventh/sus/extended)       | ✅ Hecho     | `core/constants/chords.ts`                                          |
| Diagramas SVG para guitarra (digitaciones)      | ❌ Pendiente | Define data shape: `{ frets: number[], fingers: number[], barre? }` |
| Diagramas SVG para piano (teclas marcadas)      | ❌ Pendiente | Reusar `notes[]` que ya devuelve `ChordService`                     |
| Diagramas para bajo (4 cuerdas)                 | ❌ Pendiente | Variante del componente de guitarra                                 |
| Upload de imágenes propias de acordes por admin | ❌ Pendiente | Reutilizar pipeline R2 de artist-images                             |
| Audio sample (mp3 corto del acorde)             | ❌ Idea      | Web Audio API generativa o samples grabados                         |

### B) Solfeo & Teoría Musical Básica

| Sub-feature                                          | Estado       | Notas                                                |
| ---------------------------------------------------- | ------------ | ---------------------------------------------------- |
| Ruta `/teoria`                                       | ❌ Pendiente | Hub: solfeo, intervalos, escalas, círculo de quintas |
| Lecciones de solfeo (lectura de notas en pentagrama) | ❌ Pendiente | Considerar VexFlow para renderizar pentagrama        |
| Tabla interactiva de intervalos                      | ❌ Pendiente | Reutiliza `ChordService.resolve`                     |
| Círculo de quintas interactivo                       | ❌ Pendiente | SVG estático con highlight al hacer click            |
| Quiz "¿qué acorde es?" (notas → nombre)              | ❌ Pendiente | Reverso del `ChordService` — match por intervalos    |

### C) Ejercicios de Práctica (Guitarra / Bajo)

| Sub-feature                                 | Estado       | Notas                                                          |
| ------------------------------------------- | ------------ | -------------------------------------------------------------- |
| Ruta `/ejercicios`                          | ❌ Pendiente | Filtros por instrumento + nivel                                |
| Modelo `Exercise` en backend                | ❌ Pendiente | `{ id, instrument, level, title, tab, bpm, focus, videoUrl? }` |
| Metrónomo integrado                         | ❌ Pendiente | Web Audio API — click sintético                                |
| Tracker de progreso por usuario (post-auth) | ❌ Pendiente | Tabla `user_exercise_progress` en Supabase                     |
| Plan de práctica semanal                    | ❌ Idea      | "Genera mi rutina" según nivel/instrumento                     |

### D) Capa Social (Likes / Comments / Ratings)

> **Bloqueado por:** Sistema de Auth de usuarios (ya implementado pero requiere
> credenciales Supabase configuradas — ver "Pendiente de configurar para activar Auth").

| Sub-feature                                   | Estado       | Prioridad | Notas                                                   |
| --------------------------------------------- | ------------ | --------- | ------------------------------------------------------- |
| Likes en canciones (tabs)                     | ❌ Pendiente | 🔴 Alta   | Tabla `song_likes (user_id, song_id, created_at)` + RLS |
| Rating 1-5 estrellas en canciones             | ❌ Pendiente | 🟡 Media  | Mejor que likes solos para feedback de calidad          |
| Comentarios en canciones                      | ❌ Pendiente | 🔴 Alta   | Tabla `song_comments` con moderación admin              |
| Likes/comments en ejercicios                  | ❌ Pendiente | 🟡 Media  | Mismo modelo, distinto recurso                          |
| Reportar contenido (HTML corrupto, errores)   | ⚠️ Parcial   | 🟡 Media  | `report.service.ts` ya existe — extender                |
| Perfil público del usuario (avatar + likes)   | ❌ Pendiente | 🟢 Baja   | Bonito para CV pero opcional                            |
| Feed "actividad reciente de la comunidad"     | ❌ Idea      | 🟢 Baja   | Last X likes/comments en home                           |
| Anti-spam (rate limit por user_id en backend) | ❌ Pendiente | 🔴 Alta   | Indispensable antes de abrir comentarios                |

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

| Actor    | Método                                                                                 | Estado                                            |
| -------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Admin    | Login Supabase (email/Google) → JWT; `adminGuard` + verificación server-side del email | ✅ Implementado                                   |
| Usuarios | Login Supabase opcional (prefill, reportar canción)                                    | ✅ Implementado; el sitio es navegable sin cuenta |
| Scripts  | `x-api-key` (`ADMIN_API_KEY` secret del Worker)                                        | ✅ Para scraper y uploads                         |

Pendientes de auth: verificar RLS, rate-limit en `/requests`, "olvidé contraseña",
página de verificación de email. Si alguna vez se expuso una `ADMIN_API_KEY` en el
historial de git (ver `docs/archive/`), rotarla con `wrangler secret put ADMIN_API_KEY`.

---

## Deuda Técnica

| Prioridad | Item                                                          | Ubicación                            |
| --------- | ------------------------------------------------------------- | ------------------------------------ |
| 🔴 Alta   | `index.ts` backend de 654 líneas con router `if` encadenado   | `backend-workers/src/index.ts`       |
| 🟡 Media  | Endpoints del Worker sin tests (solo `lib/` tiene)            | `backend-workers/src/index.ts`       |
| 🟡 Media  | Services sin spec: songs, admin, auth, report                 | `frontend/.../core/services/`        |
| 🟡 Media  | Pages y `admin-dashboard` sin spec (cobertura líneas ~57%)    | `frontend/.../pages/`, `admin/`      |
| 🟡 Media  | 66 warnings de ESLint (a11y en templates, `any`)              | `pnpm run lint`                      |
| 🟡 Media  | Sin paginación en `/songs` (API regresa todo)                 | backend + `pages/songs/`             |
| 🟢 Baja   | Fallback de CORS muerto en `jsonResponse()` sin `request`     | `backend-workers/src/index.ts:51-63` |
| 🟢 Baja   | `mock-songs.ts` en el bundle lazy (solo con `enableMockData`) | `core/services/`                     |

---

## Datos de la DB

- **Total canciones publicadas:** ~518 (Pop 279 · Rock 197 · Metal 42 · otros)
- **Por limpiar:** 4 canciones con HTML corrupto, 28 grupos de duplicados (~60 canciones),
  entidades HTML sin decodificar. Plan: Fase D en PLAN-FLUJO-CONTENIDO.

---

## Branching y Deploy

| Rama       | URL                      | Uso                                   |
| ---------- | ------------------------ | ------------------------------------- |
| `main`     | https://www.bstabs.com   | Producción. Solo se actualiza por PR. |
| `admin`    | https://bstabs.pages.dev | Preview.                              |
| `feat/*` … | —                        | Ramas de trabajo → PR a `main`        |

Las rutas `/admin` existen en ambos deploys; las protege la auth (`adminGuard` + JWT en
el Worker), no la rama. **Branch protection** en GitHub (Settings → Branches → `main`):
exigir PR y los checks `Lint`, `Test backend (Workers)`, `Test frontend (Angular)`,
`Build (validación)`.

```bash
pnpm install                                      # desde la raíz
pnpm --filter black-sheep-app start               # dev → localhost:4200
pnpm --filter blacksheep-api-workers dev          # Worker local → localhost:8787
pnpm run lint && pnpm test                        # lo mismo que CI
pnpm --filter black-sheep-app run deploy          # → bstabs.com
pnpm --filter black-sheep-app run deploy:admin    # → bstabs.pages.dev
pnpm --filter blacksheep-api-workers run deploy   # → Workers API
```

---

## Próximas sesiones (en orden)

1. **Revisar y mergear el PR de formalización** (primer ejercicio con REVIEW.md) y
   activar branch protection.
2. **Verificar RLS** en Supabase y ejecutar `user-library.sql` (dashboards, no código).
3. **Auditor de catálogo (Fase D) como script local** → reporte de duplicados y HTML
   roto → limpieza diaria de la DB en PRs `content/…`.
4. **Rate-limit en `POST /requests`** (Cloudflare Rate Limiting binding o KV).
5. **Deploy de la PWA** + íconos reales + Lighthouse.
6. **Fase M** (actualizar stack), luego **TWA** en Play Store.

---

_Relacionado: [CLAUDE.md](CLAUDE.md) · [ESTADO-SESION.md](ESTADO-SESION.md) · [REVIEW.md](REVIEW.md) · [PLAN-FLUJO-CONTENIDO.md](PLAN-FLUJO-CONTENIDO.md)_
