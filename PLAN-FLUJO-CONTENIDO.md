# Plan: Flujo de Contenido (captura y curación de canciones)

> Objetivo: que agregar una canción tome ~2 minutos (pegar → ajustar → draft →
> publicar), y que el catálogo crezca con calidad sin depender solo del scraper.
> Creado: 2026-08-03 · Basado en auditoría del mismo día (ver abajo).

## Resumen de fases

| Fase  | Qué                                                                | Depende de | Esfuerzo          |
| ----- | ------------------------------------------------------------------ | ---------- | ----------------- |
| 0     | Housekeeping: commit pendiente, bugs del editor, verificar RLS     | —          | horas             |
| **A** | **Modo "pegar" en el editor admin (parser + ChordPro + drafts)**   | 0          | 1-2 sesiones      |
| B     | Import por URL (cerrar circuito scraper → API draft)               | A          | 1 sesión          |
| C     | Import asistido por LLM (texto sucio/OCR → JSON draft)             | A          | 1-2 sesiones      |
| D     | Agente auditor: barrido batch de anomalías en canciones existentes | C          | 1 sesión          |
| M     | Mantenimiento de versiones (Angular 22, Tailwind 4, etc.)          | —          | aparte, ver abajo |

---

## Fase 0 — Housekeeping (antes de escribir features)

1. **Commit del changeset actual.** Hay ~23 archivos sin commitear (todo el
   trabajo de testing/CI: workflows, husky, eslint configs, specs, `src/lib/`).
   El CI no existe en GitHub hasta que se pushee. Un solo commit "testing + CI".
2. **Bugs del tab-editor** ([tab-editor.ts:273-292](frontend/black-sheep-app/src/app/admin/tab-editor/tab-editor.ts#L273-L292), `onSubmit`):
   - manda `difficulty: 'intermediate'` (campo eliminado de la DB);
   - **no manda `genre`** aunque el form lo captura → las canciones se guardan sin género.
3. **Verificar RLS en Supabase** (`songs`, `song_requests`) — pendiente crítico
   del CLAUDE.md. Antes de aumentar el flujo de escritura, confirmar que la anon
   key no puede escribir/leer drafts directo.

## Fase A — Modo "pegar" en el editor admin ⭐

**Meta:** capturar una canción pegando texto plano; las posiciones de acordes se
derivan del texto, nunca se teclean.

### A.1 Parser (lógica pura, sin UI)

- Nuevo `core/utils/tab-parser.ts` (+ spec). Funciones puras:
  - `parsePastedTab(text): SongSection[]` — detecta:
    - **Formato dos-líneas**: línea cuyos tokens son todos acordes válidos
      (regex `^[A-G][#b]?(m|maj|min|dim|aug|sus|add)?\d*...`) seguida de línea
      de letra → `{chord, position}` por columna del carácter.
    - **Formato ChordPro inline**: `[Am]Quisiera ser [F]un pez` → posición =
      índice del bracket en el texto limpio.
    - **Encabezados de sección**: `[Verso]`, `Coro:`, `INTRO`, etc.
    - Solo letra (sin acordes) → líneas con `chords: []` (draft válido).
  - `sectionsToChordPro(sections): string` y `chordProToSections(text)` —
    round-trip para editar.
- Testear con 3-4 canciones reales del catálogo (copiar de la DB).

### A.2 UI del editor

- Panel "Importar desde texto": textarea grande + botón Parsear → llena el form
  actual + preview en vivo con el `TabViewer` existente.
- Edición por línea en ChordPro inline (reemplaza el click + `prompt()`).
- Botón explícito **"Guardar borrador"** (status `draft`) — letra sola es válido.

### A.3 Dashboard de borradores

- Pestaña "Borradores" en admin-dashboard usando `GET /admin/tabs?status=draft`
  (ya existe en el Worker) → abrir en editor → completar → publicar.

### Criterio de éxito

Pegar una canción de cualquier sitio en formato dos-líneas y tenerla como draft
con acordes posicionados en < 2 minutos, sin tocar un solo `prompt()`.

## Fase B — Import por URL (script local, gratis)

- `scripts/scraper/tools/3-import/import-url.js "URL"`: reusa
  `html-scraper.js` → parser de Fase A (portarlo o duplicar la lógica en JS) →
  `POST /songs` como draft (auth: API key o JWT).
- Sin infra nueva; se corre local cuando se quiera.

## Fase C — Import asistido por LLM

- `POST /admin/import` en el Worker: recibe `{ text }` o `{ url }` → Claude
  Haiku con prompt fijo → JSON de secciones → responde el draft SIN guardar →
  el admin revisa en preview y decide guardar.
- Secret nuevo en el Worker: `ANTHROPIC_API_KEY` (via `wrangler secret put`).
- Red de seguridad para: OCR del scraper de imágenes, formatos raros, texto sucio.
- Costo estimado: fracciones de centavo por canción (Haiku).

## Fase D — Agente auditor del catálogo (mutación de C)

- Barrido batch sobre las ~520 canciones buscando anomalías:
  - sin secciones o sin letra, HTML corrupto / entidades sin decodificar
    (ya hay 4 conocidas), símbolos basura de OCR, duplicados (28 grupos conocidos),
    acordes inválidos (no parseables por el regex de A.1).
- Dos capas: **regex/heurísticas primero (gratis, detecta el 80%)**, LLM solo
  para los casos dudosos. Salida: reporte con song_ids → cola de corrección en
  el dashboard admin (o archivo JSON al inicio).
- Se puede correr como script local (node) — no necesita vivir en el Worker.

## Fase M — Mantenimiento de versiones (separado del flujo de contenido)

Auditoría 2026-08-03: stack coherente, sin incompatibilidades activas. Majors
pendientes, **ninguno bloquea las fases A-D**:

| Paquete       | Actual | Latest | Nota                                                                                              |
| ------------- | ------ | ------ | ------------------------------------------------------------------------------------------------- |
| Angular       | 20.3   | 22.1   | 2 majors; `ng update` uno por uno (20→21→22). v21+ trae zoneless por defecto y Vitest como runner |
| Tailwind      | 3.4    | 4.3    | Migración de config CSS-first; hacerla sola, no mezclada con features                             |
| ESLint        | 9.39   | 10.8   | Con angular-eslint 22 (va amarrado al major de Angular)                                           |
| Vitest        | 3.2    | 4.1    | Menor riesgo, backend only                                                                        |
| TypeScript    | 5.9    | 7.0    | Seguir lo que Angular soporte; no adelantarse                                                     |
| workers-types | 4.x    | 5.x    | Junto con wrangler minor bump                                                                     |

**Estrategia:** minors/patches libres en cualquier momento (`pnpm up -r` de lo
seguro: supabase-js, wrangler, prettier, typescript-eslint). Majors en una fase
M dedicada **después de Fase A**, orden sugerido: Vitest 4 → Angular 21 →
Angular 22 + angular-eslint/eslint → Tailwind 4. Cada paso con CI verde antes
del siguiente.

Notas menores de la auditoría:

- Node local v24.13 vs `.nvmrc` 22.20 — CI usa 22; funciona, pero conviene
  alinear (`nvm use` o subir `.nvmrc` cuando se haga Fase M).
- CLAUDE.md decía pnpm 9.15.9; el `package.json` real pinnea `pnpm@11.9.0`
  (corregido en CLAUDE.md el 2026-08-03).
- Karma/Jasmine quedará deprecado con Angular 21+ (Vitest default) — migrar
  specs de frontend en Fase M, no antes.
