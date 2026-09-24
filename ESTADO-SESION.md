# Bitácora de sesiones — Black Sheep Tabs

> Léela al abrir el proyecto. **Una entrada por sesión, la más nueva arriba.**
> Roadmap y estado de features: [ORCHESTRATOR.md](ORCHESTRATOR.md).

**Plantilla para cada sesión:**

```markdown
## AAAA-MM-DD — <tema>

- **Rama/PR:** …
- **Hecho:** …
- **Canciones:** +N agregadas · N corregidas · N duplicados eliminados
- **Siguiente:** …
```

---

## ✅ Checklist abierta fuera del código (dashboards)

Cosas que solo se hacen desde paneles web. Marcar al completar.

- [ ] 🔴 **Supabase → Table Editor → `songs` y `song_requests`:** confirmar "RLS enabled".
      Sin RLS, la anon key pública podría escribir directo saltándose el Worker.
- [ ] **Supabase → SQL Editor:** ejecutar `scripts/migrations/user-library.sql`.
- [ ] **Google Cloud Console:** cliente OAuth "Web application".
  - JavaScript origins: `http://localhost:4200`, `https://www.bstabs.com`,
    `https://alqpufucjekmonetoaih.supabase.co`
  - Redirect URI: `https://alqpufucjekmonetoaih.supabase.co/auth/v1/callback`
- [ ] **Supabase → Auth → Providers → Google:** pegar Client ID y Client Secret
      (el campo "Client IDs" lleva el ID de Google, nunca URLs).
- [ ] **Supabase → Auth → URL Configuration:** Site URL `https://www.bstabs.com`;
      Redirect URLs `http://localhost:4200/auth/callback`,
      `https://www.bstabs.com/auth/callback`, `https://bstabs.pages.dev/auth/callback`.
- [ ] **GitHub → Settings → Branches → `main`:** exigir PR + checks `Lint`,
      `Test backend (Workers)`, `Test frontend (Angular)`, `Build (validación)`.
- [ ] **Deploy backend** con JWT + `ADMIN_EMAIL`: `pnpm --filter blacksheep-api-workers run deploy`
      (pendiente desde 2026-05-18; confirmar si ya se hizo).
- [ ] **Rotar `ADMIN_API_KEY`** si la key citada en `docs/archive/SECURITY-FIXES-URGENT.md`
      sigue activa: `wrangler secret put ADMIN_API_KEY`.

---

## 2026-09-24 — Auditoría, formalización y PWA

- **Rama/PR:** `claude/loving-dirac-1i5wc3` → PR a `main` (primer PR del flujo nuevo).
- **Auditoría:** la última sesión fue el 2026-08-03 (`cb724a0` tests+CI, `cf55722` parser y
  editor "pegar"). Trabajo anterior verificado limpio: lint sin errores, 20 tests backend,
  48 tests frontend, build prod y dry-run del Worker en verde. No hubo que corregir nada.
- **Docs consolidados:** ORCHESTRATOR (roadmap) + esta bitácora + CLAUDE.md corto.
  Archivados en `docs/archive/`: PLAN-MEJORAS-UI, ANALISIS-SEGURIDAD-UX, SECURITY-FIXES-URGENT.
  Corregidos datos viejos (el filtro de género en Artists ya existía; pnpm ya migrado).
- **Code review:** plantilla de PR (`.github/pull_request_template.md`) + guía `REVIEW.md`.
- **PWA:** `@angular/service-worker`, `manifest.webmanifest`, íconos provisionales "BS"
  generados en `public/icons/`, meta tags en `index.html`.
- **Stack:** auditado, **sin actualizar** por decisión. Plan en ORCHESTRATOR → Fase M.
- **Siguiente:** revisar y mergear el PR con REVIEW.md → checklist de arriba (RLS primero)
  → auditor de catálogo (Fase D) para empezar la limpieza diaria de la DB.
- **Para ti:** reemplazar los íconos en `public/icons/` por tu logo real (mismos nombres y
  tamaños; el `maskable` necesita el logo dentro del 80% central).

## 2026-08-03 — Parser de tabs + tests + CI

- Editor admin "Importar pegando texto" (dos líneas o ChordPro), borradores funcionales,
  `GET /admin/songs/:id`. Bugs del editor corregidos (`difficulty` fantasma, `genre` omitido).
- Vitest backend + Karma frontend + GitHub Actions + Husky/Prettier.
- Detalle en PLAN-FLUJO-CONTENIDO.md (Fases 0 y A).

## 2026-05-18 — Auth backend JWT + Reportar canción

- `verifyAdmin()` acepta JWT de Supabase (email == `ADMIN_EMAIL`) o `x-api-key` legacy.
- Admin sin `prompt()`: manda `Authorization: Bearer <token>`.
- Botón "Reportar" en `tab-viewer` (reusa `POST /requests` con `type: 'edit'`).
- Migración `user-library.sql` escrita (favoritos/playlists con RLS), sin ejecutar.

---

## Setup en OTRA PC al bajar el repo

> 🔴 `environment.ts` y `environment.prod.ts` NO están en git (gitignored). Si faltan,
> el build de producción truena y el `predeploy-guard` bloquea el deploy.

```bash
git pull
corepack pnpm install        # corepack usa la versión pinneada en package.json

cp frontend/black-sheep-app/src/environments/environment.example.ts \
   frontend/black-sheep-app/src/environments/environment.ts
cp frontend/black-sheep-app/src/environments/environment.prod.example.ts \
   frontend/black-sheep-app/src/environments/environment.prod.ts
# Editar AMBOS:
#   supabaseUrl     = https://alqpufucjekmonetoaih.supabase.co
#   supabaseAnonKey = (anon public key de Supabase → Settings → API)
#   adminEmail      = humbertolpzc.work@gmail.com

pnpm run lint && pnpm test && pnpm --filter black-sheep-app build   # verificar
```

## Regla de oro

> **Una sola PC a la vez.** Al cerrar: commit + push de tu rama. Al abrir: `git pull`.
> Los `*.example.ts` van a git → **nunca** claves reales en ellos.
