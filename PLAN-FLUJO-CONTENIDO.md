# Plan: Flujo de Contenido (captura y curación de canciones)

> Objetivo: que agregar una canción tome ~2 minutos (pegar → ajustar → draft →
> publicar), y que el catálogo crezca con calidad sin depender solo del scraper.
> Creado: 2026-08-03 · Basado en auditoría del mismo día (ver abajo).

## Resumen de fases

| Fase  | Qué                                                                 | Depende de | Esfuerzo          |
| ----- | ------------------------------------------------------------------- | ---------- | ----------------- |
| 0     | ✅ Housekeeping: commit, bugs del editor · ⏳ falta verificar RLS   | —          | horas             |
| **A** | ✅ **Modo "pegar" en el editor admin (parser + ChordPro + drafts)** | 0          | 1-2 sesiones      |
| B     | Import por URL (cerrar circuito scraper → API draft)                | A          | 1 sesión          |
| C     | Import asistido por LLM (texto sucio/OCR → JSON draft)              | A          | 1-2 sesiones      |
| D     | Agente auditor: barrido batch de anomalías en canciones existentes  | C          | 1 sesión          |
| M     | Mantenimiento de versiones (Angular 22, Tailwind 4, etc.)           | —          | aparte, ver abajo |

---

## Fase 0 — Housekeeping ✅ (2026-08-03, salvo RLS)

1. ✅ **Commit del changeset de testing/CI** — hecho por el usuario (`cb724a0`).
2. ✅ **Bugs del tab-editor corregidos**: el payload mandaba `difficulty`
   (campo eliminado de la DB) y **omitía `genre`** → las canciones se guardaban
   sin género. Cubierto por spec para que no vuelva a pasar.
3. ⏳ **Verificar RLS en Supabase** (`songs`, `song_requests`) — sigue pendiente,
   requiere entrar al panel de Supabase. Antes de aumentar el flujo de escritura,
   confirmar que la anon key no puede escribir ni leer borradores directo.

## Fase A — Modo "pegar" en el editor admin ✅ (2026-08-03)

**Meta cumplida:** se captura una canción pegando texto plano; las posiciones de
acordes se derivan del texto, nunca se teclean.

### A.1 Parser ✅ — [core/utils/tab-parser.ts](frontend/black-sheep-app/src/app/core/utils/tab-parser.ts)

Lógica pura, sin UI, 18 specs verdes:

- `parsePastedTab(text)` acepta en la misma pasada:
  - **dos líneas** (acordes encima de la letra) → posición = columna del carácter;
  - **ChordPro inline** `[Am]Quisiera ser` → posición = índice del corchete;
  - **solo letra** → `chords: []`, borrador válido;
  - encabezados `[Verso 1]`, `Coro:`, `INTRO` (con y sin acentos). `[Am]` a solas
    NO es encabezado: es un pasaje instrumental.
- `sectionsToChordPro` / `lineToChordPro` / `parseChordProLine` cierran el
  round-trip modelo ↔ texto (hay un spec que lo verifica).
- Decodifica entidades HTML del texto pegado y normaliza tabs a espacios.
- **Regla de posición:** se respeta la columna exacta del original, sin "empujar"
  el acorde a la palabra siguiente aunque caiga en un espacio. Así el render
  coincide con la fuente y el round-trip es estable.

### A.2 UI del editor ✅

- Panel **"Importar pegando texto"** con textarea + "Parsear y cargar", y un
  resumen del resultado (secciones / líneas / acordes detectados).
- **Cada sección es ahora un textarea ChordPro** en vez de un formulario por
  línea con lista de acordes. Se eliminó el `prompt()` y toda la maquinaria de
  posiciones a mano (`addChordManual`, `onLyricsClick`, `getChordsArray`…).
- **Preview en vivo** (debounce 350 ms) con el `TabViewer` existente.
- Botón **"Guardar borrador"**; crear una canción SIEMPRE entra como `draft`
  (publicar es un paso aparte y explícito).
- Reordenar secciones con ↑/↓.

### A.3 Borradores ✅

El dashboard ya tenía la pestaña "Borradores" y el link `/admin/editor/:id`,
pero faltaban dos piezas que lo hacían no funcionar:

- El editor no leía el parámetro `:id` → abría vacío. Ahora carga la canción.
- `GET /songs/:id` filtra por `status='published'`, así que un borrador no se
  podía leer. Nuevo **`GET /admin/songs/:id`** (cualquier estado, requiere admin)
  - `AdminService.getSong(id)`.

### Criterio de éxito

Pegar una canción en formato dos-líneas y tenerla como borrador con acordes
posicionados en < 2 minutos, sin un solo `prompt()`. **Falta validarlo a mano
con una canción real en el navegador.**

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
