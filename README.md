# Black Sheep Tabs

> "Knowing for love, fun and free!"

Plataforma moderna de tablaturas musicales. Sin anuncios, sin distracciones, solo musica pura.

## Caracteristicas

- Mobile-First PWA - Instalalo como app nativa
- 4 Modos de Visualizacion - Light, Dark, Night Red, OLED
- Formato Profesional - Acordes, letra, metadata completa
- Export a PDF - Descarga tablaturas limpias
- Enlaces Musicales - Botones a Spotify y YouTube
- Libre de Anuncios - Financiado por donaciones
- Ultra Rapido - Optimizado para performance
- Busqueda Avanzada - Por artista, tono, genero musical

## Stack Tecnologico

- **Frontend:** Angular 20 (Signals, Standalone Components) + Tailwind CSS + PWA
- **Backend:** Cloudflare Workers + Supabase (PostgreSQL)
- **Deploy:** Cloudflare Pages (frontend) + Cloudflare Workers (API)

## Estructura del Proyecto

```
blackSheep/
├── frontend/black-sheep-app/   # Angular PWA
├── backend-workers/            # Cloudflare Workers API
└── scripts/scraper/            # Scrapers de tablaturas
```

## Inicio Rapido

### Prerrequisitos
- Node.js 18+
- npm 10+

### Frontend

```bash
cd frontend/black-sheep-app
npm install
npm start
# http://localhost:4200
```

### Backend (Workers)

```bash
cd backend-workers
npm install
npx wrangler dev
# http://localhost:8787
```

## Formato de Tablaturas

Las tablaturas usan JSON estructurado:

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
          "lyrics": "En la sierra naci..."
        }
      ]
    }
  ]
}
```

## Apoya el Proyecto

Black Sheep es gratuito y sin anuncios. Si te resulta util, considera donar:

- PayPal: [paypal.me/betunx](https://paypal.me/betunx)
- Email: bstabscontact@gmail.com

## Enlaces

- Produccion: [bstabs.com](https://bstabs.com)
- API: blacksheep-api.bstabs.workers.dev

## Licencia

MIT License

## Autor

**Humberto López** - Músico & Full Stack Developer
- LinkedIn: [linkedin.com/in/humberto-lópez-435b77216](https://www.linkedin.com/in/humberto-lópez-435b77216)
- Email: bstabscontact@gmail.com

---

Hecho con amor por musicos, para musicos
