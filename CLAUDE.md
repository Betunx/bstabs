# CLAUDE.md - Black Sheep Tabs

> Contexto del proyecto para Claude Code. Colocar en la raíz del repositorio.
> Última actualización: 31 Diciembre 2024

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
- [ ] Persistencia de tema en localStorage
- [ ] Skeleton loaders
- [ ] Toast notifications
- [ ] Editor mejorado (reemplazar prompt)
- [ ] Formulario contacto con backend
- [ ] Paginación
- [ ] Error boundaries

### Fase 3 (Futuro)
- [ ] PDF upload real
- [ ] Chord diagrams
- [ ] Transposición de acordes
- [ ] PWA capabilities

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

## Feature Planeada: Sección Acordes

Navegación horizontal: C D E F G A B
- Rutas individuales: /acordes/C, /acordes/G, etc.
- Dropdown con variantes: C#, C7, Cm, etc.
- Chord builder interactivo (estilo oolimo.com)
- Versiones: Guitarra (fretboard) + Piano (keyboard)

## Datos Pendientes de Limpiar

- 4 canciones con HTML corrupto
- 28 grupos de duplicados (~60 canciones)
- Entidades HTML sin decodificar

## Estrategia de Deployment

### Branches y URLs Permanentes

| Rama | URL | Propósito | Deploy Command |
|------|-----|-----------|----------------|
| `main` | https://www.bstabs.com/ | **Producción pública** (sin rutas /admin) | `npm run deploy` |
| `admin` | https://bstabs.pages.dev/ | **Versión admin** (con panel /admin y /admin/editor) | `npm run deploy:admin` |

### Configuración Cloudflare Pages

- **Project Name:** `bstabs`
- **Custom Domain (main):** bstabs.com → rama `main`
- **Preview URL (admin):** bstabs.pages.dev → rama `admin`
- **Auto-deployment:** Deshabilitado para evitar branches temporales

### Workflow de Deployment

```bash
# 1. Deploy versión pública (sin admin)
git checkout main
cd frontend/black-sheep-app
npm run deploy              # → bstabs.com

# 2. Deploy versión admin (con panel)
git checkout admin
cd frontend/black-sheep-app
npm run deploy:admin        # → bstabs.pages.dev

# 3. Backend API (siempre mismo endpoint)
cd backend-workers
npx wrangler deploy         # → blacksheep-api.bstabs.workers.dev
```

## Package Manager: pnpm

El proyecto usa **pnpm** como gestor de paquetes (monorepo workspace).

### Instalar pnpm (primera vez)
```powershell
npm install -g pnpm   # o: winget install pnpm.pnpm
```

### Migrar de npm a pnpm (si hay node_modules con npm)
```bash
# Borrar node_modules existentes en cada package
Remove-Item -Recurse -Force frontend/black-sheep-app/node_modules
Remove-Item -Recurse -Force backend-workers/node_modules
Remove-Item -Recurse -Force scripts/scraper/node_modules

# Instalar todo desde la raíz del workspace
pnpm install
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

# Scraper
cd scripts/scraper
node tab-scraper-v2.js "URL"
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

## Documentación Completa

Para información detallada del proyecto, consultar:
- **`ORCHESTRATOR.md`** - Estado completo, deuda técnica, roadmap y comandos del workspace
- `PLAN-MEJORAS-UI.md` - Plan de 3 fases con cronograma detallado
- `scripts/scraper/README.md` - Guía del scraper
