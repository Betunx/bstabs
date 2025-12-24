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
- Busqueda Avanzada - Por artista, tono, dificultad

## Stack Tecnologico

- Frontend: Angular 20.3 + Tailwind CSS + PWA
- Backend: NestJS 11 + TypeORM + PostgreSQL
- Seguridad: Helmet, Rate Limiting, CSRF, Input Sanitization
- PDF: pdfkit para generacion de documentos
- Deploy: Vercel (frontend) + Railway/Render (backend)

## Inicio Rapido

### Prerrequisitos
- Node.js 18+
- npm 10+
- PostgreSQL (o Docker)

### Instalacion Local

```bash
# Clonar repositorio
git clone https://github.com/Betunx/bstabs.git
cd bstabs

# Frontend
cd frontend/black-sheep-app
npm install
npm start
# http://localhost:4200

# Backend
cd backend/black-sheep-api
npm install
npm run start:dev
# http://localhost:3000
```

### Con Docker

```bash
docker-compose up -d
# Frontend: http://localhost:4200
# Backend: http://localhost:3000
```

## Formato de Tablaturas

Las tablaturas usan JSON estructurado:

```json
{
  "title": "Viejo Lobo",
  "artist": "Natanael Cano ft Luis R Conriquez",
  "key": "Am",
  "tempo": 90,
  "difficulty": "intermediate",
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
  ],
  "spotifyUrl": "https://open.spotify.com/track/...",
  "youtubeUrl": "https://youtube.com/watch?v=..."
}
```

## Documentacion

Para desarrolladores y colaboradores, consulta la guia completa del proyecto:

**[GUIA_PROYECTO.md](GUIA_PROYECTO.md)** - Documentacion tecnica completa, arquitectura, deployment, tareas pendientes, y mas.

## Apoya el Proyecto

Black Sheep es gratuito y sin anuncios. Si te resulta util, considera donar:

- PayPal: [paypal.me/betunx](https://paypal.me/betunx)
- Email: bstabscontact@gmail.com

## Enlaces

- Produccion: [bstabs.com](https://bstabs.com) (proximamente)
- Repositorio: [github.com/Betunx/bstabs](https://github.com/Betunx/bstabs)

## Contribuir

Contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

MIT License

## Autor

Betunx - Musico & Developer
- Email: bstabscontact@gmail.com

---

Hecho con amor por musicos, para musicos
"Knowing for love, fun and free!"
