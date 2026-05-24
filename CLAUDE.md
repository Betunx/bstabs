# CLAUDE.md - Black Sheep Tabs

> Contexto del proyecto para Claude Code. Colocar en la raíz del repositorio.
> Última actualización: 2026-05-24

## Proyecto

**Black Sheep Tabs** (bstabs.com) - Plataforma de tablaturas de guitarra enfocada en hispanohablantes.
Tagline: *"Knowing for love, fun and free!"*
Diferenciador: Experiencia ad-free, priorizando UX sobre monetización.

## Links

| Recurso | URL | Descripción |
|---------|-----|-------------|
| **Producción** | https://www.bstabs.com/ | Sitio público (sin admin) - rama `main` |
| **Admin Dev** | https://bstabs.pages.dev/ | Versión con panel admin - rama `admin` |
| **API** | https://blacksheep-api.bstabs.workers.dev | Cloudflare Workers API |
| **GitHub** | https://github.com/Betunx/bstabs | Repositorio del proyecto |

## Contacto

- Proyecto: bstabscontact@gmail.com
- Personal: humbertolpzc.work@gmail.com
- LinkedIn: linkedin.com/in/humberto-lopez-fs-dev

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 20 (Signals, Standalone Components) |
| Styling | Tailwind CSS + Custom SCSS |
| Backend | Cloudflare Workers |
| Database | Supabase PostgreSQL |
| Deploy | Cloudflare Pages |

## Estructura del Proyecto

```
blackSheep/
├── frontend/
│   └── black-sheep-app/    # Angular app principal
├── backend-workers/         # Cloudflare Workers API
└── scripts/
    └── scraper/            # Scripts de scraping
```

## Estado Actual (7.5/10)

### 🔴 Crítico - Resolver primero
- API key expuesta en `environment.ts`
- Admin access débil (sin auth real)

### ⚠️ Incompleto
- PDF upload es mock (no funcional)
- Formulario contacto sin backend

### 🟡 UX Pendiente
- Tema no persiste entre sesiones
- Sin loading indicators/skeletons
- Sin toast notifications
- Editor usa `prompt()` básico
- **Filtro de género falta en página Artists**

### 🟢 Funcionando bien
- Arquitectura moderna Angular
- Responsive design
- Sistema de temas (dark/light/night-red/oled)
- Cache strategy (5min TTL)
- Error handling con retry interceptor
- **Búsqueda conectada a API real con autocomplete**
- **Sistema de géneros completo (Songs page)**

## Plan de Desarrollo Actual

### Fase 1 - Completado ✅
- [x] Conectar búsqueda a API real
- [x] **Eliminar campo "difficulty"** (beginner/intermediate/advanced)
- [x] **Agregar campo "genre"** con filtro/ordenamiento
- [x] Migración de base de datos (518 canciones migradas)

### Fase 2 (En Progreso)
- [ ] **Agregar filtro de género a página Artists**
- [x] Persistencia de tema en localStorage
- [x] Skeleton loaders
- [ ] Toast notifications
- [ ] Editor mejorado (reemplazar prompt)
- [ ] Formulario contacto con backend
- [ ] Paginación
- [ ] Error boundaries

### Fase 3 (Futuro)
- [ ] PDF upload real
- [x] **Biblioteca de Acordes v1** (teoría + nav) — `/acordes`
- [ ] Chord diagrams (guitarra/piano/bajo) — extensión de v1
- [ ] Transposición de acordes
- [ ] PWA capabilities

### Fase 4 (Aprendizaje + Social — ver ORCHESTRATOR.md)
- [ ] Diagramas SVG para acordes (guitarra, piano, bajo)
- [ ] Sección `/teoria` — solfeo, intervalos, círculo de quintas
- [ ] Sección `/ejercicios` — práctica para guitarra/bajo con metrónomo
- [ ] **Capa social** (requiere Auth activa): likes, ratings 1-5, comentarios moderados
- [ ] Tracker de progreso por usuario (post-auth)

## Sistema de Géneros ✅ Implementado

**Estado:** Completamente implementado en Songs page (31 Diciembre 2024)

**Géneros permitidos (max 20):**
1. Rock
2. Pop
3. Balada
4. Corrido
5. Norteño
6. Banda
7. Regional Mexicano
8. Ranchera
9. Metal
10. Punk
11. Indie
12. Folk
13. Blues
14. Jazz
15. Gospel/Cristiana
16. Cumbia
17. Salsa
18. Reggae
19. Country
20. Alternativo

**Implementación completada:**
- ✅ Dropdown/Select en filtros de Songs
- ✅ Migración de base de datos (difficulty → genre)
- ✅ Backend API actualizado con query parameter `?genre=`
- ✅ Frontend con tipos TypeScript centralizados
- ✅ Display de género en tab viewer
- ✅ Editor admin actualizado

**Datos actuales:**
- 279 canciones Pop
- 197 canciones Rock
- 42 canciones Metal

**Pendiente:**
- [ ] Filtro de género en Artists page
- [ ] Badge visual del género en cards
- [ ] Analytics para ver géneros más populares

## Feature: Sección Acordes ✅ v1 Implementada (2026-05-24)

**Estado:** Funcional y enrutada. Falta capa de diagramas visuales por instrumento.

**Implementado:**
- Rutas: `/acordes` y `/acordes/:root` (ej: `/acordes/C`, `/acordes/G`)
- Variante seleccionable vía query param: `/acordes/C?v=m7`
- Nav horizontal C-D-E-F-G-A-B + acceso a sostenidos (C#, D#, F#, G#, A#)
- 16 variantes en 4 familias (basic, seventh, suspended, extended)
- Cálculo teórico runtime de notas — instrumento-agnóstico
- Link en header desktop + mobile · card en home

**Archivos:**
- [pages/chords/chords.ts](frontend/black-sheep-app/src/app/pages/chords/chords.ts)
- [core/services/chord.service.ts](frontend/black-sheep-app/src/app/core/services/chord.service.ts)
- [core/constants/chords.ts](frontend/black-sheep-app/src/app/core/constants/chords.ts)

**Pendiente (ver ORCHESTRATOR.md → Roadmap Aprendizaje):**
- Diagramas SVG: guitarra (fretboard), piano (teclas), bajo (4 cuerdas)
- Upload de imágenes propias por admin (reusar pipeline R2)
- Audio sample del acorde (Web Audio API)
- Sección `/teoria` complementaria (solfeo, círculo de quintas)

## Datos Pendientes de Limpiar

- 4 canciones con HTML corrupto
- 28 grupos de duplicados (~60 canciones)
- Entidades HTML sin decodificar

## Estrategia de Deployment

### Branches y URLs Permanentes

| Rama | URL | Propósito | Deploy Command |
|------|-----|-----------|----------------|
| `main` | https://www.bstabs.com/ | **Producción pública** (sin rutas /admin) | `pnpm --filter black-sheep-app run deploy` |
| `admin` | https://bstabs.pages.dev/ | **Versión admin** (con panel /admin y /admin/editor) | `pnpm --filter black-sheep-app run deploy:admin` |

### Configuración Cloudflare Pages

- **Project Name:** `bstabs`
- **Custom Domain (main):** bstabs.com → rama `main`
- **Preview URL (admin):** bstabs.pages.dev → rama `admin`
- **Auto-deployment:** Deshabilitado para evitar branches temporales

### Workflow de Deployment

```bash
# Gestor: pnpm via corepack. La versión la fija "packageManager" en package.json
# (corepack la auto-selecciona). Comandos desde la RAÍZ del monorepo.

# 1. Deploy versión pública (sin admin)
git checkout main
pnpm --filter black-sheep-app run deploy        # → bstabs.com

# 2. Deploy versión admin (con panel)
git checkout admin
pnpm --filter black-sheep-app run deploy:admin  # → bstabs.pages.dev

# 3. Backend API (siempre mismo endpoint)
pnpm --filter blacksheep-api-workers run deploy # → blacksheep-api.bstabs.workers.dev
```

> ⚠️ Antes de cualquier build/deploy, `environment.ts` y `environment.prod.ts`
> deben existir localmente (gitignored). Si faltan: copiarlos de los `*.example.ts`.
> Si no tienes el comando `pnpm`, usa `corepack pnpm@9 ...` (no requiere admin).

## Package Manager: pnpm

El proyecto usa **pnpm** como gestor de paquetes (monorepo workspace).
La versión está fijada en `package.json` → `"packageManager": "pnpm@9.15.9"`,
y la versión de Node en `.nvmrc` (22.20.0). corepack auto-selecciona pnpm.

### Tener el comando `pnpm` (primera vez, sin admin)
```powershell
# Opción A (recomendada, permanente): deja el shim en la carpeta npm (ya en PATH)
corepack enable --install-directory "$env:APPDATA\npm" pnpm
# Opción B (siempre funciona, sin instalar nada): usar corepack en modo run
corepack pnpm@9 <comando>
# Con admin: `corepack enable` basta. Verifica: `pnpm -v` → 9.15.9
```

### Instalar dependencias del workspace
```bash
pnpm install            # desde la raíz; instala los 3 paquetes del workspace
```

## Comandos Rápidos

```bash
# Desde la RAÍZ del monorepo (recomendado)
pnpm --filter black-sheep-app start              # Dev → localhost:4200
pnpm --filter blacksheep-api-workers dev         # Workers local

pnpm --filter black-sheep-app run deploy          # → bstabs.com
pnpm --filter black-sheep-app run deploy:admin    # → bstabs.pages.dev
pnpm --filter blacksheep-api-workers run deploy   # → Workers API

# O desde cada carpeta (también funciona)
cd frontend/black-sheep-app
pnpm start              # ng serve
pnpm build              # Build producción
pnpm run deploy         # Deploy main → bstabs.com
pnpm run deploy:admin   # Deploy admin → bstabs.pages.dev

cd backend-workers
pnpm dev                # wrangler dev
pnpm run deploy         # wrangler deploy

# Scraper (Nueva Estructura Organizada)
cd scripts/scraper

# Extracción HTML/PDF
node tools/1-extraction/html-scraper.js "URL"

# Extracción de Imágenes
node tools/1-extraction/image-scraper.js "URL"
node tools/1-extraction/image-scraper.js --batch config/urls/espirituguitarrista-urls.txt

# Procesamiento OCR
npm install tesseract.js
node tools/2-processing/ocr-processor.js "./output/images/nombre-cancion"

# Importación a DB
node tools/3-import/batch-importer.js
```

## Notas para Claude Code

- Preferir Signals sobre Observables cuando sea posible
- Usar Standalone Components (no NgModules)
- Tailwind para estilos, SCSS solo para casos complejos
- Cloudflare Workers para cualquier lógica de backend
- No hardcodear API Keys en código fuente
- Mantener max 20 géneros musicales (no abrumar)
- Referencias de archivos: usar formato `[file.ts:123](path/file.ts#L123)`

## Archivos Críticos

- `src/environments/environment.ts` - ⚠️ API key expuesta
- `src/app/core/services/songs.service.ts` - Servicio principal
- `src/app/shared/components/tab-viewer/` - Visualizador
- `backend-workers/src/index.ts` - API endpoints
- `PLAN-MEJORAS-UI.md` - Plan completo de mejoras

## Sistema de Imágenes de Artistas

**Arquitectura:** Cloudflare R2 + CDN Worker

### Configuración
- **Bucket R2:** bstabs-artist-images
- **CDN URL:** https://blacksheep-api.bstabs.workers.dev/artists/images/{slug}.jpg
- **Cache:** 1 año (max-age=31536000)
- **Fallback:** Placeholder con iniciales del artista

### Cómo agregar/actualizar imágenes

**PowerShell (Windows):**
```powershell
.\scripts\upload-artist-image.ps1 .\photos\peso-pluma.jpg peso-pluma
```

**Bash (Linux/Mac):**
```bash
./scripts/upload-artist-image.sh ./photos/peso-pluma.jpg peso-pluma
```

**curl directo:**
```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@peso-pluma.jpg" \
  https://blacksheep-api.bstabs.workers.dev/admin/artists/images/peso-pluma.jpg
```

### Requisitos de imágenes
- **Formato:** JPG, PNG, o WebP
- **Tamaño recomendado:** 500x500px (cuadrada)
- **Peso máximo:** 200KB
- **Nombre:** {artist-slug}.{ext} (ej: peso-pluma.jpg)

**NOTA:** El slug debe coincidir con el generado por `ArtistsService.slugify()`

## Sistema de Scraping de Tablaturas

**Estructura modular organizada:**

```
scripts/scraper/
├── tools/
│   ├── 1-extraction/     # Scrapers (HTML, imágenes)
│   ├── 2-processing/     # OCR, transformaciones
│   ├── 3-import/         # Importación a DB
│   └── 4-integrations/   # APIs externas
├── docs/                 # Documentación completa
├── config/               # URLs y configuraciones
├── output/               # Resultados organizados
└── examples/             # Scripts de ejemplo
```

### Flujo Completo

```
1. Extracción → tools/1-extraction/
2. Procesamiento → tools/2-processing/
3. Importación → tools/3-import/
```

### 1️⃣ Extracción HTML/PDF

**Sitios:** AcordesWeb, CifraClub, etc.

```bash
node tools/1-extraction/html-scraper.js "URL"
```

**Salida:** `output/extracted/*.json`

### 2️⃣ Extracción de Imágenes

**Sitios:** Espíritu Guitarrista

```bash
# Una canción
node tools/1-extraction/image-scraper.js "URL"

# Múltiples (batch)
node tools/1-extraction/image-scraper.js --batch config/urls/espirituguitarrista-urls.txt
```

**Salida:** `output/images/cancion/*.png`

### 3️⃣ Procesamiento OCR

```bash
npm install tesseract.js
node tools/2-processing/ocr-processor.js "./output/images/cancion"
```

**Salida:** `output/ocr-results/*.json` + `*.txt`

### 4️⃣ Importación a Base de Datos

```bash
node tools/3-import/batch-importer.js
node tools/3-import/extracted-importer.js
```

### 📖 Documentación Detallada

- [README.md](scripts/scraper/README.md) - Índice principal
- [docs/00-QUICKSTART.md](scripts/scraper/docs/00-QUICKSTART.md) - Inicio rápido
- [docs/01-EXTRACTION.md](scripts/scraper/docs/01-EXTRACTION.md) - Guía de extracción
- [docs/02-PROCESSING.md](scripts/scraper/docs/02-PROCESSING.md) - Guía de procesamiento
- [docs/03-IMPORTING.md](scripts/scraper/docs/03-IMPORTING.md) - Guía de importación

## Documentación Completa

Para información detallada del proyecto, consultar:
- **`ORCHESTRATOR.md`** - Estado completo, deuda técnica, roadmap y comandos del workspace
- **Claude Projects Memory** - Base de datos completa del proyecto
- `PLAN-MEJORAS-UI.md` - Plan de 3 fases con cronograma detallado
- `scripts/scraper/README.md` - Sistema completo de scraping
- `scripts/scraper/MIGRATION-GUIDE.md` - Guía de migración a nueva estructura
