# CLAUDE.md - Black Sheep Tabs

> Reglas y contexto para Claude Code. **El estado vive en otros archivos, no aquí:**
>
> - [ORCHESTRATOR.md](ORCHESTRATOR.md) — roadmap, estado de features, deuda técnica, versiones
> - [ESTADO-SESION.md](ESTADO-SESION.md) — bitácora: **leer la última entrada al empezar**
> - [PLAN-FLUJO-CONTENIDO.md](PLAN-FLUJO-CONTENIDO.md) — captura y curación de canciones
> - [REVIEW.md](REVIEW.md) — criterio de revisión de PRs (úsalo también al revisar)
>
> Última actualización: 2026-09-24

## Proyecto

**Black Sheep Tabs** (bstabs.com) — tablaturas de guitarra para hispanohablantes, sin
anuncios. Tagline: _"Knowing for love, fun and free!"_

| Recurso    | URL                                       |
| ---------- | ----------------------------------------- |
| Producción | https://www.bstabs.com/ (rama `main`)     |
| Preview    | https://bstabs.pages.dev/ (rama `admin`)  |
| API        | https://blacksheep-api.bstabs.workers.dev |
| GitHub     | https://github.com/Betunx/bstabs          |

Contacto del proyecto: bstabscontact@gmail.com

## Stack

Angular 20 (Signals, Standalone, PWA) · Tailwind 3 + SCSS · Cloudflare Workers ·
Supabase (Postgres + Auth) · Cloudflare R2 · Cloudflare Pages · pnpm (corepack, versión
en `package.json`) · Node 22 (`.nvmrc`). Versiones exactas y plan de actualización:
ORCHESTRATOR → "Stack y versiones".

```
bstabs/
├── frontend/black-sheep-app/   # Angular SPA
├── backend-workers/            # Worker API (src/index.ts + src/lib/ con tests)
└── scripts/                    # scraper/, migrations/, predeploy-guard.mjs
```

## Flujo de trabajo (obligatorio)

1. **Nunca commitear directo a `main`.** Rama por tema (`feat/`, `fix/`, `content/`,
   `docs/`, `chore/`) → PR a `main` con la plantilla de `.github/pull_request_template.md`.
2. Antes de push: `pnpm run lint && pnpm test` en verde (es lo que corre CI).
3. Lógica nueva → spec nuevo. Backend: helpers puros en `src/lib/` con Vitest.
4. Al cerrar la sesión: agregar entrada en ESTADO-SESION.md y actualizar ORCHESTRATOR
   si cambió el estado de una feature.
5. No actualizar majors de dependencias fuera de una sesión "Fase M" dedicada.

## Reglas de código

- Signals sobre Observables cuando se pueda; Standalone Components (sin NgModules).
- Tailwind para estilos; SCSS solo en casos complejos.
- Lógica de backend en Cloudflare Workers. Endpoints admin siempre con `verifyAdmin()`.
- **Nunca** hardcodear API keys. `environment*.ts` solo lleva anon key pública + adminEmail.
- Máximo 20 géneros musicales (lista en `core/constants`). No agregar más.
- Posiciones de acordes **siempre** se derivan del texto con `tab-parser.ts`, nunca a mano.
- Referencias a archivos en docs: formato `[file.ts:123](path/file.ts#L123)`.

## Comandos (desde la raíz)

```bash
pnpm install
pnpm --filter black-sheep-app start              # dev → localhost:4200
pnpm --filter blacksheep-api-workers dev         # Worker local → localhost:8787

pnpm run lint                                    # eslint (frontend baseline en warn)
pnpm test                                        # backend (vitest) + frontend (karma headless)
pnpm run test:be | pnpm run test:fe

pnpm --filter black-sheep-app build              # build prod (incluye service worker)
pnpm --filter black-sheep-app run deploy         # → bstabs.com
pnpm --filter black-sheep-app run deploy:admin   # → bstabs.pages.dev
pnpm --filter blacksheep-api-workers run deploy  # → Workers API
```

> Antes de build/test, `environment.ts` y `environment.prod.ts` deben existir (gitignored).
> Copiarlos de los `*.example.ts`. En contenedores como root, Karma necesita un Chrome con
> `--no-sandbox` (`CHROME_BIN` apuntando a un wrapper).

## Archivos críticos

- `frontend/.../core/services/auth.service.ts` — Auth Supabase (login, JWT, `isAdmin`)
- `frontend/.../core/services/songs.service.ts` — servicio principal (cache 5 min)
- `frontend/.../core/utils/tab-parser.ts` — parser de tabs pegadas (dos líneas / ChordPro)
- `frontend/.../admin/tab-editor/` — editor: importar pegando + secciones ChordPro + borradores
- `frontend/.../shared/components/tab-viewer/` — visualizador de tabs
- `frontend/black-sheep-app/ngsw-config.json` + `public/manifest.webmanifest` — PWA
- `backend-workers/src/index.ts` — endpoints · `src/lib/` — auth, cors, validation
- `.github/workflows/ci.yml` — CI: Lint, Test backend, Test frontend, Build

## Auth (resumen)

Admin = login Supabase cuyo email coincide con `ADMIN_EMAIL`. El frontend manda
`Authorization: Bearer <jwt>`; el Worker lo valida con `verifyAdmin()`, que también acepta
`x-api-key` para scripts. El Worker usa la service key (bypassa RLS), por eso **RLS debe
estar activo** en Supabase. Rutas `/admin*` existen en ambos deploys; las protege la auth.

## Imágenes de artistas (R2)

Bucket `bstabs-artist-images`, servidas en `/artists/images/{slug}.jpg` (cache 1 año,
fallback de iniciales). Subir con `./scripts/upload-artist-image.sh foto.jpg slug`.
JPG/PNG/WebP, 500×500, ≤ 200 KB. El slug debe coincidir con `ArtistsService.slugify()`.
Detalle: `docs/ARTIST-IMAGES-SETUP.md`.

## Scraper

`scripts/scraper/` en tres etapas: `tools/1-extraction` → `tools/2-processing` (OCR) →
`tools/3-import`. Guía completa en `scripts/scraper/README.md`.
