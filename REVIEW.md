# Cómo revisar un PR — Black Sheep Tabs

> Guía corta para aprender revisión manual de código, y criterio que Claude aplica al
> revisar este repo. Meta: una revisión útil en **15-20 minutos**.

## Por qué revisar si trabajo solo

- Obliga a leer tu código **como lo leería otra persona** (o tú en seis meses).
- Separa "escribir" de "aprobar": la mitad de los bugs se ven al releer el diff completo.
- Es lo que piden hoy los equipos: un PR pequeño, con contexto, probado y revisado.
- CI revisa lo mecánico (lint, tests, build). **Tú revisas lo que CI no puede:** intención,
  casos borde, seguridad, claridad.

## El flujo en GitHub

1. Abre el PR → pestaña **Files changed**.
2. Lee primero la descripción (qué, por qué, cómo probar). Si no se entiende, eso ya es un
   comentario.
3. Revisa archivo por archivo. Marca **Viewed** en cada uno para no perderte.
4. Para comentar una línea: pasa el mouse sobre el número de línea → **+**. Arrastra para
   varias líneas. Usa **Add single comment** o **Start a review** (agrupa varios).
5. Al terminar, botón **Review changes**:
   - **Comment** — observaciones sin bloquear.
   - **Request changes** — hay algo que debe corregirse antes de mergear.
   - **Approve** — listo. (En repos personales GitHub no deja aprobar tu propio PR; en ese
     caso deja un comentario "LGTM" y mergea.)
6. Checks en verde + revisión hecha → **Squash and merge** (un commit limpio por tema).

Prefijos útiles para tus comentarios, para que se note el peso de cada uno:
`bloqueante:` · `pregunta:` · `nit:` (detalle menor, opcional) · `idea:` (para después).

## Qué buscar, en orden de importancia

### 1. ¿Hace lo que dice? (correctness)

- Lee la descripción y verifica que el diff la cumple, ni más ni menos.
- Casos borde: listas vacías, `null`/`undefined`, texto con acentos o `ñ`, strings muy
  largos, canción sin secciones, usuario sin sesión.
- Errores: ¿qué pasa si la API falla? ¿El usuario ve algo o la pantalla queda en blanco?
- Para `tab-parser`: ¿el acorde queda en la columna correcta? ¿`[Am]` solo sigue siendo
  pasaje instrumental y no encabezado?

### 2. Seguridad

- Endpoint nuevo en `backend-workers/src/index.ts` que escribe o lee borradores →
  **debe** llamar `verifyAdmin()` antes de tocar Supabase.
- Input del usuario validado (`src/lib/validation.ts`) antes de usarlo en queries.
- Ninguna clave en el diff. Busca `key`, `secret`, `token`, `eyJ` en Files changed.
- Nada de `innerHTML` con contenido de la DB sin sanitizar (hay canciones con HTML roto).

### 3. Tests

- ¿La lógica nueva tiene spec? ¿El spec fallaría si el código estuviera mal?
- Un test que solo verifica "se creó el componente" no prueba nada del cambio.
- Bug corregido → idealmente un spec que reproduzca el bug.

### 4. Convenciones del proyecto (Angular)

- Signals (`signal`, `computed`) para estado; standalone components.
- Sin `any` nuevo (el lint lo marca como warning; no sumar más).
- Tailwind para estilos; SCSS solo si es complejo.
- Géneros: máximo 20, desde `core/constants/genres.ts`.

### 5. Accesibilidad básica en templates

- `<label for>` asociado a su input. Botones con texto o `aria-label`.
- `(click)` en algo que no es `<button>`/`<a>` → necesita `tabindex` y teclado.

### 6. Claridad y tamaño

- ¿Los nombres dicen qué hacen? ¿Hay código muerto o `console.log` suelto?
- PR de más de ~400 líneas de código (sin contar lockfile) → pedir dividirlo.
- ¿Docs actualizados si cambió una feature? (ORCHESTRATOR, bitácora)

## Checklist rápida (cópiala en tu revisión)

```
- [ ] Entiendo qué hace y por qué (descripción clara)
- [ ] Casos borde y errores cubiertos
- [ ] Endpoints admin con verifyAdmin(), inputs validados, sin secretos
- [ ] Specs nuevos o actualizados que prueban el cambio
- [ ] Signals / standalone / sin any nuevo
- [ ] Labels y teclado OK en templates tocados
- [ ] CI en verde
```

## Revisar con ayuda de Claude

- En una sesión de Claude Code con el repo: `/code-review` sobre la rama o el número de
  PR. Úsalo **después** de tu propia revisión y compara: lo que Claude encontró y tú no,
  es lo que conviene entrenar.
- `/security-review` para cambios que tocan auth, endpoints o datos de usuario.
- Claude aplica esta misma guía (la referencia CLAUDE.md).

## Ejercicio para empezar

Revisa el PR de formalización (docs + PWA) con esta guía. Puntos concretos a mirar:

1. `frontend/black-sheep-app/src/app/app.config.ts` — ¿el service worker se desactiva en
   desarrollo? ¿Por qué importa?
2. `frontend/black-sheep-app/ngsw-config.json` — ¿qué URLs de la API se cachean y por
   cuánto? ¿Algún endpoint admin podría quedar cacheado?
3. `public/manifest.webmanifest` — ¿los íconos declarados existen en `public/icons/`?
4. Docs — ¿algo en ORCHESTRATOR contradice lo que ves en el código?
