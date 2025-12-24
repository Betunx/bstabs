# BLACK SHEEP TABS - GUIA COMPLETA DEL PROYECTO

Ultima actualizacion: 2025-12-24
Version: 0.0.1 (Pre-produccion)
Estado: En desarrollo activo
Rama de trabajo: suspicious-mcnulty

---

## VISION DEL PROYECTO

Black Sheep Tabs es una plataforma moderna de tablaturas musicales enfocada en ofrecer una experiencia limpia, sin anuncios y totalmente gratuita. Filosofia: "Knowing for love, fun and free!" - Hecho por musicos, para musicos.

### Ventajas competitivas
- Sin anuncios (financiado por donaciones)
- Open Source Ready (codigo limpio y documentado)
- PWA Moderna (experiencia nativa sin App Store)
- 4 Temas unicos (incluye tema OLED para moviles)
- Busqueda inteligente (mejor que la competencia)
- 100% gratis (hosting gratuito sostenible)

---

## STACK TECNOLOGICO

### Frontend
- Angular 20.3 con Tailwind CSS
- PWA instalable como app nativa
- TypeScript con RxJS
- 4 modos visuales: Light, Dark, Night Red, OLED

### Backend
- NestJS 11 con TypeORM
- PostgreSQL (Supabase o Railway)
- pdfkit para generacion de PDFs
- Sistema completo de seguridad

### Seguridad implementada
- Helmet.js (proteccion HTTP headers)
- Rate Limiting con Throttler
- CSRF Protection con guards personalizados
- Input Sanitization (previene XSS y SQL injection)
- API Key Authentication para admin
- CORS configurado con whitelist
- .env.example sin credenciales hardcodeadas

### Deploy
- Frontend: Vercel
- Backend: Railway o Render
- Base de Datos: Supabase (500MB gratis) o Railway PostgreSQL
- Domain: Cloudflare DNS/CDN
- SSL/HTTPS automatico

---

## ESTRUCTURA DEL PROYECTO

blackSheep/
├── frontend/black-sheep-app/    Angular PWA
│   ├── src/app/
│   │   ├── core/               Services, models, config
│   │   ├── shared/             Componentes reutilizables
│   │   ├── layout/             Header, footer
│   │   ├── pages/              Paginas publicas
│   │   └── admin/              Panel de administracion
│   └── environments/           Dev/Prod config
├── backend/black-sheep-api/     NestJS API
│   ├── src/
│   │   ├── common/            Constantes, interfaces
│   │   ├── guards/            ApiKeyGuard, CsrfGuard
│   │   ├── utils/             Sanitizer
│   │   └── songs/             CRUD de canciones
│   └── scripts/scraper/       Web scraper
├── docs/                        Documentacion tecnica
└── scripts/                     Scripts de utilidad

---

## FORMATO DE TABLATURAS

Las tablaturas usan formato JSON estructurado:

### Campos principales
- id: UUID unico
- title: Titulo de la cancion
- artist: Artista(s)
- key: Tono/tonalidad (Am, C, D, etc.)
- tempo: Velocidad en BPM
- timeSignature: Compas (4/4, 3/4, etc.)
- tuning: Afinacion de la guitarra
- difficulty: beginner | intermediate | advanced
- story: Historia o contexto de la cancion (opcional)
- sections: Array de secciones (Intro, Verso, Coro, etc.)
- spotifyUrl: Link a Spotify (opcional)
- youtubeUrl: Link a YouTube (opcional)
- sourceUrl: URL de la fuente original (credito)
- status: draft | pending | published | archived

### Estructura de secciones
Cada seccion tiene:
- name: Nombre de la seccion (Intro, Verso 1, Coro, etc.)
- lines: Array de lineas con acordes y letra

Cada linea tiene:
- chords: Array de objetos { chord: string, position: number }
- lyrics: Texto de la letra

### Ejemplo de ChordPosition - Alineacion perfecta
{
  "chords": [
    { "chord": "E", "position": 0 },
    { "chord": "D", "position": 14 },
    { "chord": "Dm7", "position": 18 }
  ],
  "lyrics": "Pero esa luna es mi condena"
}

Se renderiza como:
E             D   Dm7
Pero esa luna es mi condena

---

## PALETA DE COLORES

Light Mode:
--bg-primary: #FAF9F6     Warm White
--bg-header: #0A0A0A      Carbon Black
--text-primary: #1A1A1A   Typewriter Black
--accent: #D4AF37         Golden Amber

Dark Mode:
--bg-primary: #1A1A1A     Carbon
--text-primary: #E5E5E5   Light Gray

Night Red Mode:
--bg-primary: #2D1B1B     Deep Red-Black
--text-primary: #E8D4C4   Warm Beige

OLED Mode:
--bg-primary: #000000     True Black
--text-primary: #CCCCCC   Gray
--accent: #FFD700         Bright Gold

---

## API ENDPOINTS

### Publicos
GET /songs                  Listar canciones publicadas
GET /songs/:id              Obtener cancion por ID
GET /songs/search?q=query   Buscar canciones
GET /songs/:id/pdf          Descargar PDF de la tablatura

### Protegidos (requieren x-api-key header)
POST /songs                 Crear cancion
PATCH /songs/:id            Actualizar cancion
DELETE /songs/:id           Eliminar cancion
POST /songs/:id/publish     Publicar cancion
POST /songs/:id/archive     Archivar cancion
POST /songs/import/batch    Importar multiples canciones

---

## CONFIGURACION DE AMBIENTES

### Variables de entorno Backend (.env)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=blacksheep
ADMIN_API_KEY=your-secure-api-key
ALLOWED_ORIGINS=http://localhost:4200,https://bstabs.com
PORT=3000
NODE_ENV=development

### Variables de entorno Frontend

Desarrollo (environment.ts):
production: false
apiUrl: http://localhost:3000
features: { showAdmin: true, enableAuth: false, enablePdf: true }

Pre-produccion (environment.preview.ts):
production: false
apiUrl: https://api-preview.railway.app
features: { showAdmin: true, enableAuth: false, enablePdf: true }

Produccion (environment.prod.ts):
production: true
apiUrl: https://api.bstabs.com
features: { showAdmin: false, enableAuth: false, enablePdf: true }

---

## SISTEMA DE SCRAPING

### Capacidades
- Extraccion desde HTML (CifraClub, AcordesWeb, Ultimate Guitar)
- Extraccion desde PDF (URLs o archivos locales)
- Procesamiento batch (multiples URLs)
- Normalizacion automatica de acordes (español a ingles)
- Deteccion inteligente de secciones
- Limpieza de texto avanzada

### Uso basico
cd scripts/scraper
npm install

Una URL de PDF:
node tab-scraper-v2.js "https://acordesweb.com/descarga-pdf/artista/cancion/0/0/0.pdf"

Una URL de HTML:
node tab-scraper-v2.js "https://cifraclub.com.br/artista/cancion/"

Un archivo PDF local:
node tab-scraper-v2.js "./mi-tablatura.pdf"

Batch (multiples URLs):
node tab-scraper-v2.js --batch urls-ejemplo.txt

### Formato de salida
Los archivos extraidos se guardan en scripts/scraper/extracted-tabs/ como JSON con:
- title, artist, sourceUrl, sourceType, extractedAt
- status: pending
- chords: array de acordes unicos detectados
- sections: secciones estructuradas
- rawText: texto completo sin procesar

### Deteccion de secciones
Keywords reconocidas automaticamente:
intro, introduction > Intro
verse, verso > Verso
chorus, coro, estribillo > Coro
bridge, puente > Puente
outro, final > Final
solo > Solo
pre-chorus, pre-coro > Pre-Coro

---

## COMANDOS UTILES

### Frontend (Angular)
cd frontend/black-sheep-app
npm start                    http://localhost:4200
npm run build               Build de produccion
npm run build:dev           Build de desarrollo
npm test                    Ejecutar tests
npm run lint                Linter

### Backend (NestJS)
cd backend/black-sheep-api
npm run start:dev           http://localhost:3000
npm run build               Compilar TypeScript
npm run start:prod          Modo produccion
npm test                    Tests unitarios
npm run test:e2e            Tests E2E

### Docker
docker-compose up -d        Levantar todo
docker-compose logs -f      Ver logs
docker-compose down         Detener

---

## DEPLOYMENT

### 1. Deploy Frontend en Vercel

Desde GitHub (Recomendado):
1. Ve a vercel.com
2. Sign in con GitHub
3. Click "Add New Project"
4. Importa el repositorio: Betunx/bstabs
5. Vercel detectara automaticamente el vercel.json
6. Click "Deploy"

Tu sitio estara en: https://bstabs.vercel.app

### 2. Conectar dominio bstabs.com

En Vercel:
1. Settings > Domains
2. Add Domain: bstabs.com
3. Add Domain: www.bstabs.com

En Cloudflare DNS:
1. Ve a DNS > Records
2. Agrega:
   Type: A, Name: @, Content: 76.76.21.21, Proxy: DNS only (nube gris)
   Type: CNAME, Name: www, Content: cname.vercel-dns.com, Proxy: DNS only

MUY IMPORTANTE: Desactiva el proxy de Cloudflare para evitar romper SSL de Vercel

Espera 5-60 minutos para propagacion DNS

Verifica:
nslookup bstabs.com
Debe mostrar: 76.76.21.21

### 3. Deploy Backend en Railway

Por que Railway:
- PostgreSQL gratis incluido
- Deploy automatico desde GitHub
- $5/mes despues de trial ($5 en creditos gratis sin tarjeta)
- 500 horas/mes de ejecucion
- 8GB RAM, 100GB transferencia
- Backups automaticos
- SSL/HTTPS gratis

Pasos:
1. Ve a railway.app
2. Sign in con GitHub
3. Click "New Project"
4. Selecciona "Deploy from GitHub repo": Betunx/bstabs
5. Railway detectara NestJS automaticamente

Variables de entorno en Railway:
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://bstabs.com
DB_SSL=true
ADMIN_API_KEY=genera-clave-segura

Agregar PostgreSQL:
1. En tu proyecto Railway
2. Click "New" > "Database" > "PostgreSQL"
3. Railway conectara automaticamente

### 4. Configurar Supabase (Alternativa gratuita a Railway DB)

Que incluye Supabase:
- PostgreSQL hospedado (500MB gratis = ~50,000 canciones)
- Backups automaticos
- Dashboard web
- API REST auto-generada
- Sin tarjeta de credito requerida
- Sin limite de tiempo

Pasos:
1. Ve a supabase.com/dashboard
2. Sign up con GitHub
3. Create new project:
   - Project name: black-sheep-tabs
   - Database Password: [Genera una fuerte y GUARDALA]
   - Region: West US (us-west-1)
   - Pricing plan: Free
4. Espera 2-3 minutos

Obtener credenciales:
1. Settings > Database
2. Scroll down a "Connection string"
3. Selecciona tab "URI"
4. Copia:
   - Host: aws-0-us-west-1.pooler.supabase.com
   - Port: 5432
   - Database: postgres
   - User: postgres.abcdefghijk
   - Password: La que generaste

En .env backend:
DB_HOST=aws-0-us-west-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USERNAME=postgres.abcdefghijk
DB_PASSWORD=tu-password-aqui
DB_SSL=true

Inicializar esquema:
1. npm run start:dev
2. TypeORM creara las tablas automaticamente
3. Verifica en Supabase > Table Editor > tabla "songs"

---

## ESTADO ACTUAL DEL PROYECTO

### Lo que ya funciona
Backend:
- Estructura basica de NestJS
- Entidad Song con TypeORM
- CRUD completo de canciones
- Busqueda por titulo
- Sistema de estados (draft/pending/published/archived)
- Seguridad basica implementada
- API Key guard para admin
- Endpoint de importacion batch

Frontend:
- Estructura de Angular 20.3
- Sistema de 4 temas
- Componente tab-viewer (visualizacion)
- Admin dashboard (UI lista)
- Editor de tabs (UI lista)
- Pagina de donaciones
- Busqueda con autocomplete
- Header/Footer responsive

Herramientas:
- Web Scraper V2 funcional
- Import directo a DB
- Supabase integration
- Docker Compose

### Estado de implementacion por modulo
Frontend Core: 90% (falta integracion backend)
Backend API: 85% (falta PDF service, tests)
Base de Datos: 100% (estructura OK, falta contenido)
Autenticacion: 100% (API key)
Seguridad: 95% (falta auditoria externa)
PWA: 100%
Scraper: 95% (funcional, falta mas fuentes)
Admin Panel: 60% (falta backend integration)
Deploy: 0% (pendiente)
Testing: 0% (critico)
Documentacion: 95% (excelente)

---

## TAREAS PRIORITARIAS

### PRIORIDAD ALTA - HACER AHORA

1. Sistema de PDFs (50% completado - 2 horas)
- Instalar pdfkit en backend: HECHO
- Crear servicio PdfService en backend
- Endpoint GET /songs/:id/pdf
- Boton "Descargar PDF" en tab-viewer component
- Diseño limpio (similar a AcordesWeb)
- Incluir creditos a fuente original

Archivos a modificar:
- backend/black-sheep-api/src/songs/pdf.service.ts (nuevo)
- backend/black-sheep-api/src/songs/songs.controller.ts
- backend/black-sheep-api/src/songs/songs.module.ts
- frontend/black-sheep-app/src/app/shared/components/tab-viewer/tab-viewer.html
- frontend/black-sheep-app/src/app/shared/components/tab-viewer/tab-viewer.ts

2. Enlaces a Spotify/YouTube (0% completado - 2 horas)

Backend:
- Agregar campos a entidad Song: spotifyUrl, youtubeUrl, sourceUrl
- Crear migracion de TypeORM
- Actualizar DTOs (create-song.dto.ts, update-song.dto.ts)

Frontend:
- Botones de Spotify/YouTube en tab-viewer
- Logica hibrida: Si existe URL > abrir directamente, Si no > generar busqueda automatica
- Iconos de Spotify y YouTube (SVG)
- Estilos en los 4 temas

Archivos a modificar:
- backend/black-sheep-api/src/songs/entities/song.entity.ts
- backend/black-sheep-api/src/songs/dto/create-song.dto.ts
- backend/black-sheep-api/src/songs/dto/update-song.dto.ts
- frontend/black-sheep-app/src/app/core/models/song.model.ts
- frontend/black-sheep-app/src/app/shared/components/tab-viewer/tab-viewer.html
- frontend/black-sheep-app/src/app/shared/components/tab-viewer/tab-viewer.scss

3. Primera Cancion - "Viejo Lobo" (0% completado - 1 hora)
- Obtener acordes y letra completa
- Crear JSON con formato correcto
- Agregar URLs de Spotify y YouTube
- Importar a la base de datos
- Publicar desde admin dashboard
- Verificar visualizacion en todos los temas

Datos necesarios:
- Titulo: "Viejo Lobo"
- Artista: "Natanael Cano ft Luis R Conriquez"
- Tono: A determinar
- Fuente: https://acordesweb.com/descarga-pdf/natanael-cano/viejo-lobo-ft-luis-r-conriquez/0/0/0.pdf

### PRIORIDAD MEDIA - ESTA SEMANA

4. Deploy a Produccion (0% completado - 2-3 horas)

Backend:
- Crear cuenta en Railway o Render
- Configurar PostgreSQL
- Variables de entorno
- Deploy y test

Frontend:
- Verificar Vercel deployment
- Actualizar environment.prod.ts
- Conectar con backend en produccion
- Test completo

Base de Datos:
- PostgreSQL en produccion (Railway/Supabase)
- Ejecutar migraciones
- Importar datos iniciales

5. Contenido Inicial (0% completado - 3-4 horas)
- Scraping de 20-50 canciones populares
- Revision desde admin dashboard
- Publicacion gradual
- Verificacion de calidad

6. SEO Basico (0% completado - 1 hora)
- Meta tags en componentes
- sitemap.xml
- robots.txt
- Google Search Console
- Google Analytics 4

### BACKLOG - PROXIMAS SEMANAS

7. Preview de Audio
- Spotify Embed Player
- YouTube embed minimalista
- Tabs para elegir fuente
- Controles de reproduccion

8. Mejoras de UX
- Loading spinners
- Error handling (toast notifications)
- Skeleton loaders
- Empty states
- 404 personalizado

9. Sistema de Usuarios (Futuro)
- Registro/Login
- Favoritos
- Historial
- Playlists personales

---

## BUGS CONOCIDOS A RESOLVER

1. Mobile Navigation: Falta link de admin en menu movil
2. Search Service: Usa mock data, conectar a API
3. Admin Dashboard: No conectado a backend real
4. Theme Persistence: No se guarda al recargar pagina
5. 404 Page: Falta pagina personalizada

---

## CHECKLIST PRE-LAUNCH

Must Have (Minimo para lanzar):
- Backend deployed y funcionando
- Frontend deployed con dominio
- Minimo 20 tabs publicados
- Busqueda funcionando
- Pagina de donaciones activa
- Google Analytics configurado
- Meta tags SEO completos
- Sistema de PDFs funcionando

Nice to Have (Puede esperar):
- Preview de audio
- Sistema de usuarios
- Comentarios
- PWA offline mode

---

## METRICAS DE EXITO (3 MESES)

Trafico:
- Mes 1: 100 visitas/dia
- Mes 2: 500 visitas/dia
- Mes 3: 1,000+ visitas/dia

Contenido:
- Mes 1: 50 tabs
- Mes 2: 200 tabs
- Mes 3: 500+ tabs

Donaciones:
- Mes 1: $5 (cubrir servidor)
- Mes 2: $20
- Mes 3: $50+ (reinvertir)

---

## FLUJO DE TRABAJO RECOMENDADO

Siguiente sesion de trabajo (orden recomendado):

1. Terminar PDFs (2h)
   - Crear PdfService
   - Endpoint API
   - Boton en frontend

2. Agregar "Viejo Lobo" (1h)
   - Obtener acordes
   - Crear JSON
   - Importar y publicar

3. Enlaces Spotify/YouTube (2h)
   - Migracion de BD
   - Botones en UI
   - Logica hibrida

4. Commit y Push (15min)
   - Commit a rama suspicious-mcnulty
   - Push al remoto
   - Verificar en GitHub

Tiempo total estimado: 7-8 horas de trabajo
Meta: Tener algo publicable en 1-2 dias

---

## COMANDOS GIT UTILES

Ver estado:
git status

Commit cambios:
git add .
git commit -m "feat: Implement PDF generation and music platform links"

Push a rama suspicious-mcnulty:
git push

Ver diferencias:
git diff main...suspicious-mcnulty

---

## RECURSOS Y ENLACES

Produccion: https://bstabs.com (pendiente)
Repositorio: https://github.com/Betunx/bstabs
Email: bstabscontact@gmail.com
Donaciones: https://paypal.me/betunx

Fuentes de tablaturas:
- AcordesWeb: https://acordesweb.com (PDFs limpios)
- CifraClub: https://cifraclub.com.br (HTML estructurado)
- Ultimate Guitar: https://tabs.ultimate-guitar.com (requiere login)

Documentacion tecnica:
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- NestJS: https://docs.nestjs.com
- Angular: https://angular.io/docs
- Supabase: https://supabase.com/docs

---

## TROUBLESHOOTING COMUN

### Error: "Cannot find module 'pdf-parse'"
cd scripts/scraper
npm install

### Error: "Connection terminated unexpectedly"
Causa: DB_SSL=false cuando deberia ser true
Solucion: DB_SSL=true en .env o ssl: { rejectUnauthorized: false } en codigo

### Error: "password authentication failed"
Causa: Password incorrecta
Solucion: Verificar connection string en Supabase > Settings > Database

### Error: "too many connections"
Causa: Free plan tiene limite de conexiones
Solucion: Cerrar backends/scripts que no uses, usar connection pooling

### Error: "Domain is not configured" (Vercel)
Causa: DNS aun no propago
Solucion: Esperar 30 minutos, verificar con nslookup bstabs.com

### Error: "SSL Certificate error"
Causa: Cloudflare proxy activado
Solucion: Desactivar proxy en Cloudflare DNS (nube gris)

### Error: "Too many redirects"
Causa: Configuracion SSL incorrecta
Solucion: Cloudflare > SSL/TLS > Cambiar a Full o Full (strict)

---

## NOTAS IMPORTANTES

Estructura limpia lograda:
- Solo archivos necesarios en raiz
- Documentacion tecnica en docs/
- Todo organizado y profesional

Este archivo (GUIA_PROYECTO.md):
- Documento unico de referencia
- Informacion consolidada de todos los markdowns
- Sin repeticiones ni informacion redundante
- Actualizado al 2025-12-24

Enfocate en:
1. PDFs primero - Es la feature mas solicitada
2. "Viejo Lobo" - Primera cancion completa
3. Links musicales - Mejora experiencia de usuario
4. Deploy - Para que el mundo lo vea

---

Fin del documento
