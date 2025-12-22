# 🎸 Black Sheep Tabs

> **"Knowing for love, fun and free!"**

Plataforma moderna de tablaturas musicales. Sin anuncios, sin distracciones, solo música pura.

## ✨ Características

- 📱 **Mobile-First PWA** - Instálalo como app nativa
- 🎨 **4 Modos de Visualización** - Light, Dark, Night Red, OLED
- 🎵 **Formato Profesional** - Acordes, letra, metadata completa
- 📄 **Export a PDF** - Descarga tablaturas limpias
- 🎧 **Enlaces Musicales** - Botones a Spotify y YouTube
- 💛 **Libre de Anuncios** - Financiado por donaciones
- ⚡ **Ultra Rápido** - Optimizado para performance
- 🔍 **Búsqueda Avanzada** - Por artista, tono, dificultad

## 🏗️ Stack Tecnológico

- **Frontend**: Angular 20.3 + Tailwind CSS + PWA
- **Backend**: NestJS 11 + TypeORM + PostgreSQL
- **Seguridad**: Helmet, Rate Limiting, CSRF, Input Sanitization
- **PDF**: pdfkit para generación de documentos
- **Deploy**: Vercel (frontend) + Railway/Render (backend)
- **Domain**: Cloudflare DNS/CDN

## 📁 Estructura del Proyecto

```
blackSheep/
├── frontend/black-sheep-app/  # Angular PWA
├── backend/black-sheep-api/   # NestJS API
├── docs/                      # Documentación técnica
├── scripts/                   # Scraper y utilidades
└── ROADMAP.md                 # Plan de desarrollo
```

**Documentación completa**: Ver [docs/REFERENCE.md](docs/REFERENCE.md)

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm 10+
- PostgreSQL (o Docker)

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/Betunx/bstabs.git
cd bstabs

# Frontend
cd frontend/black-sheep-app
npm install
npm start
# → http://localhost:4200

# Backend
cd backend/black-sheep-api
npm install
npm run start:dev
# → http://localhost:3000
```

### Con Docker

```bash
docker-compose up -d
# Frontend: http://localhost:4200
# Backend: http://localhost:3000
```

## 🗄️ Formato de Tablaturas

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
          "lyrics": "En la sierra nací..."
        }
      ]
    }
  ],
  "spotifyUrl": "https://open.spotify.com/track/...",
  "youtubeUrl": "https://youtube.com/watch?v=..."
}
```

Ver [docs/REFERENCE.md](docs/REFERENCE.md) para especificación completa.

## 📝 Próximos Pasos

Ver [ROADMAP.md](ROADMAP.md) para el plan detallado de desarrollo.

**Prioridades actuales**:
1. Sistema de generación de PDFs
2. Enlaces a Spotify/YouTube (híbrido)
3. Agregar primera canción de ejemplo
4. Deploy a producción

## 💛 Apoya el Proyecto

Black Sheep es gratuito y sin anuncios. Si te resulta útil, considera donar:

- **PayPal**: [paypal.me/betunx](https://paypal.me/betunx)
- **Email**: bstabscontact@gmail.com

## 🌐 Enlaces

- **Producción**: [bstabs.com](https://bstabs.com)
- **Repositorio**: [github.com/Betunx/bstabs](https://github.com/Betunx/bstabs)

## 📚 Documentación

- [ROADMAP.md](ROADMAP.md) - Plan de desarrollo y tareas
- [docs/REFERENCE.md](docs/REFERENCE.md) - Referencia técnica completa
- [docs/DEPLOY.md](docs/DEPLOY.md) - Guía de deployment
- [docs/SCRAPING-GUIDE.md](docs/SCRAPING-GUIDE.md) - Uso del web scraper
- [docs/RAILWAY-GUIDE.md](docs/RAILWAY-GUIDE.md) - Deploy en Railway
- [docs/CLOUDFLARE-SETUP.md](docs/CLOUDFLARE-SETUP.md) - Configuración de dominio

## 🤝 Contribuir

Contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📜 Licencia

MIT License

## 👨‍🎤 Autor

**Betunx** - Músico & Developer
- Email: bstabscontact@gmail.com

---

<p align="center">
  <b>Hecho con ❤️ por músicos, para músicos</b><br>
  <i>"Knowing for love, fun and free!"</i>
</p>
