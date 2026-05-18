# Black Sheep Tabs

> *"Knowing for love, fun and free!"*

Plataforma de tablaturas de guitarra para hispanohablantes. Sin anuncios, sin distracciones — solo música. Aquí encontrarás acordes, letras y estructura de canciones en un formato limpio y enfocado en la experiencia del músico.

**Géneros:** Rock · Pop · Corrido · Norteño · Banda · Regional Mexicano · Ranchera · Metal · Indie · Folk · Blues · Jazz · Cumbia · Salsa · Reggae · Country · Alternativo y más.

## Características

- **Sin anuncios** — financiado por donaciones de la comunidad
- **4 temas visuales** — Light, Dark, Night Red, OLED (persisten entre sesiones)
- **Búsqueda avanzada** — por artista, canción, género y fragmento de letra
- **Formato profesional** — acordes posicionados sobre letra, metadata completa (tonalidad, tempo, afinación)
- **Cuentas de usuario** — login con Google o email para pedir canciones y ver tu historial
- **Responsive / Mobile-first** — funciona en cualquier dispositivo
- **Ultra rápido** — cache en memoria + Cloudflare Edge

## Links

| Recurso | URL |
|---------|-----|
| Producción | https://www.bstabs.com |
| Admin (dev) | https://bstabs.pages.dev |
| API | https://blacksheep-api.bstabs.workers.dev |

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 20 (Signals, Standalone Components) |
| Styling | Tailwind CSS + SCSS |
| Auth | Supabase Auth (Google OAuth + Email) |
| Backend | Cloudflare Workers |
| Database | Supabase PostgreSQL |
| Storage | Cloudflare R2 (imágenes de artistas) |
| Deploy | Cloudflare Pages |
| Package manager | **pnpm** (monorepo workspace) |

## Estructura del Proyecto

```
bstabs/                          ← raíz del monorepo (pnpm workspace)
├── pnpm-workspace.yaml
├── .npmrc
├── frontend/black-sheep-app/    ← Angular 20 SPA
├── backend-workers/             ← Cloudflare Workers API
└── scripts/scraper/             ← Scrapers de tablaturas
```

## Inicio Rápido

### Prerrequisitos

- Node.js 20+
- pnpm 9+ — instalar con: `npm install -g pnpm` o `winget install pnpm.pnpm`

### Instalar todo el monorepo

```bash
# Desde la raíz del proyecto
pnpm install
```

### Desarrollo

```bash
# Frontend → http://localhost:4200
pnpm --filter black-sheep-app start

# Backend Workers → http://localhost:8787
pnpm --filter blacksheep-api-workers dev
```

### Deploy

```bash
# Frontend producción → bstabs.com
pnpm --filter black-sheep-app run deploy

# Frontend admin → bstabs.pages.dev
pnpm --filter black-sheep-app run deploy:admin

# Backend API
pnpm --filter blacksheep-api-workers run deploy
```

## Configuración de Auth (Supabase)

Para que el sistema de login funcione necesitas:

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. En **Settings → API**, copiar:
   - `Project URL` → `supabaseUrl` en `environment.ts`
   - `anon / public key` → `supabaseAnonKey` en `environment.ts`
3. En **Authentication → Providers → Google**, habilitar Google OAuth
4. Agregar redirect URLs:
   ```
   http://localhost:4200/auth/callback
   https://www.bstabs.com/auth/callback
   https://bstabs.pages.dev/auth/callback
   ```

## Formato de Tablaturas

Las tablaturas se almacenan en JSON estructurado:

```json
{
  "title": "Viejo Lobo",
  "artist": "Natanael Cano ft Luis R Conriquez",
  "key": "Am",
  "tempo": 90,
  "genre": "Corrido",
  "sections": [
    {
      "name": "Verso 1",
      "lines": [
        {
          "chords": [
            { "chord": "Am", "position": 0 },
            { "chord": "G", "position": 15 }
          ],
          "lyrics": "En la sierra nací..."
        }
      ]
    }
  ]
}
```

## Apoya el Proyecto

Black Sheep es gratuito y sin anuncios. Si te resulta útil:

- PayPal: [paypal.me/betunx](https://paypal.me/betunx)
- Email: bstabscontact@gmail.com

## Autor

**Humberto López** — Músico & Full Stack Developer

- LinkedIn: [linkedin.com/in/humberto-lopez-fs-dev](https://linkedin.com/in/humberto-lopez-fs-dev)
- Email: bstabscontact@gmail.com

---

*Hecho con amor por músicos, para músicos.*
