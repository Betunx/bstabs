# Estado de sesión — Reconciliación rediseño + login (2026-05-18)

> Documento de handoff. Léelo al volver a trabajar (en esta PC o en la laptop).

## Qué pasó (el misterio resuelto)

- **Esta PC** tenía un **rediseño completo sin commitear** (home, songs, artists,
  header, componentes nuevos, limpieza de código muerto, scraper reorganizado).
  Nunca se subió a GitHub → por eso al deployar desde la laptop salía la **UI vieja**
  (la laptop solo tenía lo de `origin/main`, jamás tuvo el rediseño).
- **La laptop** (sesiones remotas) subió a `main`: fixes de seguridad, **feature de
  login (Supabase)**, panel admin, y **migración a monorepo pnpm**.
- Eran dos líneas de trabajo paralelas. **Ya están unidas** en la rama
  `redesign-local` (merge de `origin/main` resuelto, 4 conflictos arreglados
  conservando AMBAS partes).

## Estado actual ✅

- Rama: **`redesign-local`** (respaldada en GitHub: `origin/redesign-local`).
- Merge de `origin/main` hecho, **0 conflictos**, **build pnpm OK** (rediseño +
  login + Supabase compilan juntos).
- Gestor de paquetes: **pnpm 9 (monorepo)**. `pnpm-lock.yaml` SÍ se versiona.
- `git status`: hay un **merge sin commitear** (lo cierras tú, ver abajo).

### Decisiones tomadas en el merge

| Conflicto | Resolución |
|---|---|
| `header.ts` / `header.html` | Base = **tu header rediseñado** + se le injertó el **login/menú de usuario** de la laptop con tus tokens de diseño |
| Link Admin | Ahora protegido por `authService.isAdmin()` (seguridad real de la laptop), no por `isDevMode` |
| `tab-reader` | Se quitó el `ThemeService` viejo (la laptop lo metió por error; el diseño nuevo no lo usa) |
| `environment.ts` / `.prod.ts` | **Locales y gitignored** (llevan claves). En git solo van los `*.example.ts` |
| `CLAUDE.md` | Combinadas ambas listas de docs |

## ⚠️ Pendientes / decisiones abiertas

### 🔴 Bloqueante para funcionalidad

- **Login no autentica aún**: `environment.ts` / `environment.prod.ts` tienen
  placeholders. Rellena `supabaseUrl` + `supabaseAnonKey` reales
  (Supabase → Settings → API). El sitio público funciona; solo el login espera esto.

### 🟡 Decisiones de diseño

- **Selector de tema**: el rediseño lo quitó del header y se borró `theme.ts`
  en `redesign-local`. Si quieres conservar dark/light/night-red/oled hay que
  reintroducir un servicio de tema alineado al diseño nuevo, o decidir quitarlo.
- **Higiene git**: `.claude/settings.local.json` es específico de máquina (rutas
  absolutas). Recomendado: `git rm --cached .claude/settings.local.json` + gitignore.

### 🟢 Reproducibilidad entre máquinas — HECHO

- `"packageManager": "pnpm@9.15.9"` en `package.json` → corepack auto-selecciona.
- `.nvmrc` = `22.20.0` → misma versión de Node (usar `nvm use`).
- `pnpm-lock.yaml` versionado → mismo árbol de dependencias.
- Resultado: en cualquier PC, `corepack pnpm install` da entorno idéntico.

## Pendientes — Optimizar / Analizar (no urgentes)

| Tema | Acción sugerida |
|---|---|
| Backend CORS | Probar `pnpm --filter blacksheep-api-workers run deploy` y verificar que el frontend nuevo llama bien a la API (se cambió el CORS por-origen) |
| Login E2E | Con keys reales, probar flujo `/auth/login` → callback → sesión → admin |
| Guard de pre-deploy | Script que aborte deploy si el working tree está sucio / sin pushear (evita "deployé viejo") |
| SCSS budget | `admin/tab-editor.scss` excede presupuesto (warning). Subir budget o adelgazar SCSS |
| **URLs amigables** | Las tabs usan UUID: `/tab/e80ec5c2-...`. Cambiar a slug legible/SEO tipo `/tab/adele-when-we-were-young` (o `/tab/<slug>-<idCorto>`). Requiere: campo `slug` o `slugify(artista+título)`, ruta `/tab/:slug`, redirect de UUID viejo → slug, y actualizar `routerLink` en listas/cards |
| Roadmap original | Quedaban: paginación, toast notifications, skeletons en más vistas, editor sin `prompt()` |
| Limpieza datos | 4 canciones con HTML corrupto, ~28 grupos de duplicados (ver CLAUDE.md) |
| Doc | `ORCHESTRATOR.md` (vino de la laptop) — revisar/consolidar con esta sesión |

## Cómo CERRAR esto (lo haces tú — commits manuales)

```bash
# 1. Asegura que mis arreglos post-merge entren al commit de merge
git add -A
git restore --staged .claude/settings.local.json   # no commitear config de máquina

# 2. Cierra el merge (commit de merge, mensaje por defecto está bien)
git commit

# 3. Sube la rama ya integrada
git push origin redesign-local

# 4. Lleva todo a main (ya trae login + rediseño)
git checkout main
git pull                       # trae lo último de la laptop
git merge redesign-local       # integra el rediseño
git push origin main

# 5. (opcional) Sincroniza admin
git checkout admin
git merge main
git push origin admin
```

## Deploy (después de subir main)

```bash
git checkout main
corepack pnpm@9 --filter black-sheep-app run deploy   # → bstabs.com
# o:  corepack pnpm@9 run deploy   (desde la raíz)
```

## Setup en OTRA PC (laptop) al bajar el repo

> 🔴 **GOTCHA #1**: `environment.ts` y `environment.prod.ts` NO están en git
> (gitignored, llevan claves). Si faltan, **el deploy/build truena** con:
> `The ...environment.prod.ts path in file replacements does not exist`.
> El build de **producción** reemplaza `environment.ts` → `environment.prod.ts`,
> así que **AMBOS deben existir localmente**.

```bash
git pull
corepack pnpm@9 install                 # instala el workspace completo

# OBLIGATORIO: crear los DOS environment locales desde las plantillas
cp frontend/black-sheep-app/src/environments/environment.example.ts \
   frontend/black-sheep-app/src/environments/environment.ts
cp frontend/black-sheep-app/src/environments/environment.prod.example.ts \
   frontend/black-sheep-app/src/environments/environment.prod.ts
# → editar AMBOS: supabaseUrl / supabaseAnonKey / adminEmail reales
#   (sin claves reales el build pasa y el sitio público funciona,
#    pero el LOGIN no autenticará hasta poner las keys de Supabase)

corepack pnpm@9 --filter black-sheep-app build   # verificar
```

## pnpm: comando permanente (opcional, cuando tengas tiempo)

Ahora se usa `corepack pnpm@9 ...` (funciona sin admin). Para tener `pnpm` directo:

- **Rápido**: abrir terminal **como administrador** una vez → `corepack enable`
- **Sin admin**: `corepack pnpm@9 setup` y reiniciar la terminal (configura `PNPM_HOME`)

## Regla de oro (para que NO vuelva a pasar)

> **Trabajas en una sola PC a la vez.** Al cerrar sesión: `commit` + `push`
> SIEMPRE. Al abrir en otra PC: `git pull` ANTES de tocar nada.
> El rediseño se perdió de vista solo por deployar sin haber commiteado/pusheado.
