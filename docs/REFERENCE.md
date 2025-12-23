# 📚 Black Sheep - Referencia Técnica

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
blackSheep/
├── backend/
│   └── black-sheep-api/       # NestJS API
│       ├── src/
│       │   ├── common/        # Constantes, interfaces, módulo común
│       │   ├── guards/        # ApiKeyGuard, CsrfGuard
│       │   ├── utils/         # Sanitizer
│       │   └── songs/         # CRUD de canciones
│       └── scripts/
│           └── scraper/       # Web scraper (AcordesWeb, Cifras, etc.)
├── frontend/
│   └── black-sheep-app/       # Angular 20.3
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/      # Services, models, config
│       │   │   ├── shared/    # Componentes reutilizables
│       │   │   ├── layout/    # Header, footer
│       │   │   ├── pages/     # Páginas públicas
│       │   │   └── admin/     # Panel de administración
│       │   └── environments/  # Dev/Prod config
├── docs/                      # Documentación técnica
└── scripts/                   # Scripts de utilidad
```

## 🎨 Formato de Tablaturas

Las tablaturas usan un formato JSON estructurado:

```json
{
  "id": "uuid",
  "title": "Viejo Lobo",
  "artist": "Natanael Cano ft Luis R Conriquez",
  "key": "Am",
  "tempo": 90,
  "timeSignature": "4/4",
  "tuning": "Standard (EADGBE)",
  "difficulty": "intermediate",
  "story": "Canción de corridos tumbados...",
  "sections": [
    {
      "name": "Intro",
      "lines": [
        {
          "chords": [
            { "chord": "Am", "position": 0 },
            { "chord": "G", "position": 15 }
          ],
          "lyrics": "En la sierra nací, viejo lobo me dicen"
        }
      ]
    }
  ],
  "spotifyUrl": "https://open.spotify.com/track/...",
  "youtubeUrl": "https://youtube.com/watch?v=...",
  "sourceUrl": "https://acordesweb.com/...",
  "createdAt": "2025-12-22T...",
  "updatedAt": "2025-12-22T...",
  "status": "published"
}
```

### Campos Principales

- **id**: UUID único
- **title**: Título de la canción
- **artist**: Artista(s)
- **key**: Tono/tonalidad (Am, C, D, etc.)
- **tempo**: Velocidad en BPM
- **timeSignature**: Compás (4/4, 3/4, etc.)
- **tuning**: Afinación de la guitarra
- **difficulty**: beginner | intermediate | advanced
- **story**: Historia o contexto de la canción (opcional)
- **sections**: Array de secciones (Intro, Verso, Coro, etc.)
- **spotifyUrl**: Link a Spotify (opcional)
- **youtubeUrl**: Link a YouTube (opcional)
- **sourceUrl**: URL de la fuente original (crédito)
- **status**: draft | pending | published | archived

### Estructura de Secciones

Cada sección tiene:
- **name**: Nombre de la sección (Intro, Verso 1, Coro, etc.)
- **lines**: Array de líneas con acordes y letra

Cada línea tiene:
- **chords**: Array de objetos `{ chord: string, position: number }`
- **lyrics**: Texto de la letra

## 🔐 Seguridad Implementada

### Backend (NestJS)

1. **Rate Limiting**: 10 requests/60 segundos por IP
2. **Helmet**: Headers de seguridad HTTP
3. **API Key Guard**: Protege endpoints de admin
4. **CSRF Protection**: Valida origin en operaciones state-changing
5. **Input Sanitization**: Previene XSS e inyección SQL

### Variables de Entorno

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=blacksheep

# Security
ADMIN_API_KEY=your-secure-api-key
ALLOWED_ORIGINS=http://localhost:4200,https://bstabs.com

# Optional
PORT=3000
NODE_ENV=development
```

## 🎨 Paleta de Colores

```scss
// Light Mode
--bg-primary: #FAF9F6     // Warm White
--bg-header: #0A0A0A      // Carbon Black
--text-primary: #1A1A1A   // Typewriter Black
--accent: #D4AF37         // Golden Amber

// Dark Mode
--bg-primary: #1A1A1A     // Carbon
--text-primary: #E5E5E5   // Light Gray

// Night Red Mode
--bg-primary: #2D1B1B     // Deep Red-Black
--text-primary: #E8D4C4   // Warm Beige

// OLED Mode
--bg-primary: #000000     // True Black
--text-primary: #CCCCCC   // Gray
--accent: #FFD700         // Bright Gold
```

## 📡 API Endpoints

### Públicos

- `GET /songs` - Listar canciones publicadas
- `GET /songs/:id` - Obtener canción por ID
- `GET /songs/search?q=query` - Buscar canciones
- `GET /songs/:id/pdf` - Descargar PDF de la tablatura

### Protegidos (requieren `x-api-key` header)

- `POST /songs` - Crear canción
- `PATCH /songs/:id` - Actualizar canción
- `DELETE /songs/:id` - Eliminar canción
- `POST /songs/:id/publish` - Publicar canción
- `POST /songs/:id/archive` - Archivar canción
- `POST /songs/import/batch` - Importar múltiples canciones

## 🛠 Comandos Útiles

### Frontend (Angular)

```bash
cd frontend/black-sheep-app

# Desarrollo
npm start                    # http://localhost:4200
npm run build               # Build de producción
npm run build:dev           # Build de desarrollo

# Testing
npm test                    # Ejecutar tests
npm run lint                # Linter
```

### Backend (NestJS)

```bash
cd backend/black-sheep-api

# Desarrollo
npm run start:dev           # http://localhost:3000
npm run build               # Compilar TypeScript
npm run start:prod          # Modo producción

# Testing
npm test                    # Tests unitarios
npm run test:e2e            # Tests E2E
```

### Docker

```bash
# Levantar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 📦 Stack Tecnológico

### Frontend
- Angular 20.3
- Tailwind CSS
- TypeScript
- RxJS

### Backend
- NestJS 11
- TypeORM
- PostgreSQL
- pdfkit (generación de PDFs)

### Seguridad
- Helmet
- @nestjs/throttler
- class-validator
- class-sanitizer

### DevOps
- Docker
- Vercel (frontend)
- Railway/Render (backend)
- Cloudflare (DNS/CDN)

## 🔗 Enlaces Útiles

- **Producción**: https://bstabs.com
- **Repositorio**: https://github.com/Betunx/bstabs
- **Email**: bstabscontact@gmail.com
- **Donaciones**: https://paypal.me/betunx

## 📝 Guías de Deployment

Ver carpeta `docs/` para guías detalladas:

- `DEPLOY.md` - Guía general de deployment
- `RAILWAY-GUIDE.md` - Deploy en Railway
- `FREE-HOSTING-OPTIONS.md` - Opciones de hosting gratuito
- `CLOUDFLARE-SETUP.md` - Configuración de dominio
- `SCRAPING-GUIDE.md` - Uso del web scraper
