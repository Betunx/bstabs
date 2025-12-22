# 🎸 Black Sheep (BS)

> **"Knowing for love, fun and free!"**

Black Sheep es una plataforma moderna de tablaturas musicales, creada con amor por músicos, para músicos. Sin anuncios, sin distracciones, solo música pura.

## 🌟 Filosofía

La música es un arte noble. El aprendizaje debe ser accesible, gratuito y sin barreras. Black Sheep está diseñado para ofrecer la mejor experiencia de lectura de tablaturas, respetando tu tiempo y concentración.

## ✨ Características

- 📱 **Mobile-First PWA** - Instálalo como app nativa
- 🎨 **4 Modos de Visualización** - Light, Dark, Night Red, OLED
- 🎵 **Formato Profesional** - Tablaturas con toda la información que necesitas
- 💛 **Libre de Anuncios** - Financiado por donaciones voluntarias
- ⚡ **Ultra Rápido** - Optimizado para performance
- 🔍 **Búsqueda Avanzada** - Por artista, tono, dificultad, tags

## 🏗️ Stack Tecnológico

### Frontend
- **Angular 18** - Framework moderno y robusto
- **Tailwind CSS** - Diseño utility-first personalizado
- **PWA** - Progressive Web App capabilities
- **TypeScript** - Type-safe development

### Backend
- **NestJS** - Framework Node.js escalable
- **PostgreSQL** - Base de datos relacional
- **TypeORM** - ORM type-safe
- **Redis** - Cache de alto rendimiento
- **Elasticsearch** - Búsqueda full-text

### DevOps & Cloud
- **Docker** - Containerización
- **AWS** - Cloud hosting
  - EC2 - Backend hosting
  - RDS - PostgreSQL managed
  - Amplify - Frontend hosting
  - S3 - Assets storage
- **GitHub Actions** - CI/CD pipeline
- **Cloudflare** - CDN & DNS

## 📁 Estructura del Proyecto

```
blackSheep/
├── frontend/              # Angular 18 PWA
│   └── black-sheep-app/
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/       # Servicios singleton
│       │   │   ├── shared/     # Componentes compartidos
│       │   │   ├── features/   # Módulos de features
│       │   │   │   ├── tabs/   # Visor de tablaturas
│       │   │   │   ├── donate/ # Página de donaciones
│       │   │   │   └── search/ # Búsqueda de canciones
│       │   │   └── layout/     # Header, Footer
│       │   └── styles.scss     # Estilos globales + Tailwind
│       └── tailwind.config.js  # Configuración BS custom
│
├── backend/               # NestJS API
│   └── black-sheep-api/
│       └── src/
│           ├── modules/
│           │   ├── tabs/       # CRUD tablaturas
│           │   ├── songs/      # Metadata canciones
│           │   ├── users/      # Autenticación
│           │   └── search/     # Elasticsearch integration
│           ├── common/         # Guards, interceptors
│           └── config/         # Configuración
│
├── docker/                # Configuraciones Docker
├── .github/workflows/     # CI/CD pipelines
└── docs/                  # Documentación

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

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm 10+
- Docker (opcional para desarrollo local)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/betunx/black-sheep.git
cd black-sheep

# Frontend
cd frontend/black-sheep-app
npm install
npm start
# Abre http://localhost:4200

# Backend
cd ../../backend/black-sheep-api
npm install
npm run start:dev
# API corriendo en http://localhost:3000
```

### Con Docker

```bash
# Levantar toda la infraestructura
docker-compose up -d

# Frontend: http://localhost:4200
# Backend: http://localhost:3000
# PostgreSQL: localhost:5432
```

## 🗄️ Estructura de Tablaturas

Las tablaturas en BS utilizan un formato JSON estructurado:

```json
{
  "title": "Emma",
  "artist": "Betunx",
  "key": "Bm",
  "tempo": 78,
  "timeSignature": "4/4",
  "tuning": "Standard (EADGBE)",
  "difficulty": "intermediate",
  "sections": [
    {
      "name": "Intro",
      "bars": [
        {
          "chords": ["Bm", "F#m"],
          "tab": {
            "e": "---2---2---2---2---|",
            "B": "---3---3---3---3---|",
            "G": "---4---4---4---4---|",
            "D": "---4---4---4---4---|",
            "A": "---2---2---2---2---|",
            "E": "-------------------|"
          }
        }
      ]
    }
  ]
}
```

## 💛 Apoya el Proyecto

Black Sheep es completamente gratuito y sin anuncios. Si te resulta útil, considera hacer una donación voluntaria:

- **PayPal**: [paypal.me/betunx](https://paypal.me/betunx)
- **Contacto**: bstabscontact@gmail.com

## 🌐 Dominio

- **Producción**: [bstabs.com](https://bstabs.com)
- **CDN & DNS**: Cloudflare

## 📝 Roadmap

### Fase 1 - MVP (Actual)
- [x] Setup proyecto Angular + NestJS
- [x] Configuración Tailwind con paleta BS
- [ ] Visor de tablaturas básico
- [ ] Sistema de 4 temas
- [ ] Página de donaciones
- [ ] Deploy inicial a AWS

### Fase 2 - Core Features
- [ ] Editor de tablaturas
- [ ] Sistema de importación
- [ ] Búsqueda con Elasticsearch
- [ ] Sistema de moderación
- [ ] Autenticación de usuarios

### Fase 3 - Features Avanzadas
- [ ] Transposición de tonos
- [ ] Scroll automático
- [ ] Audio sincronizado
- [ ] Modo colaborativo
- [ ] Export a PDF

## 🤝 Contribuir

Black Sheep es un proyecto de código abierto. Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📜 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## 👨‍🎤 Autor

**Betunx** - Músico & Developer
- Email: bstabscontact@gmail.com
- Primera canción: "Emma" en Bm

---

<p align="center">
  <b>Hecho con ❤️ por músicos, para músicos</b>
</p>
<p align="center">
  <i>"Knowing for love, fun and free!"</i>
</p>
