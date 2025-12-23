# Cheat Sheet - Black Sheep Tabs (Para Memorizar)

## 1. ELEVATOR PITCH (30 seg)
**Black Sheep Tabs** = plataforma web de tablaturas musicales
- Búsqueda inteligente con autocompletado
- Scraping automático de múltiples sitios
- Gratis, sin ads, open source
- **Stack:** Angular + NestJS + PostgreSQL

---

## 2. STACK TÉCNICO (Memoriza esto)

### Frontend
- Angular 18 + TypeScript
- Bootstrap 5 (responsive)
- RxJS (estado reactivo)

### Backend
- NestJS + TypeORM
- PostgreSQL
- JWT (auth)

### Deploy
- Railway (backend)
- Vercel (frontend)
- Docker
- GitHub Actions (CI/CD)

---

## 3. CARACTERÍSTICAS PRINCIPALES (5)

1. **Búsqueda inteligente** - autocompletado + "did you mean"
2. **Scraper automático** - 6+ sitios soportados
3. **Panel admin** - review tabs antes de publicar
4. **Seguridad** - JWT + rate limiting + validación
5. **Donaciones** - PayPal integration, opcional

---

## 4. CÓMO FUNCIONA EL SCRAPER (Explícalo así)

```
1. Leo URLs de un archivo (urls.txt)
2. Descargo HTML de cada URL
3. Detecto el sitio automáticamente
4. Extraigo SOLO acordes + letra con regex
5. Limpio scripts, ads, estilos
6. Detecto acordes (C, G, Am, F...)
7. Guardo JSON
8. Importo a PostgreSQL
9. Admin revisa y publica
```

**Comando:**
```bash
node tab-scraper.js --batch urls.txt
```

---

## 5. MODELO DE DATOS (Song)

```typescript
{
  id: number
  title: string           // "Let It Be"
  artist: string          // "The Beatles"
  content: string         // HTML con acordes
  chords: string[]        // ["C", "G", "Am", "F"]
  difficulty: string      // "easy" | "medium" | "hard"
  status: string          // "pending" | "published"
  sourceUrl: string       // URL original
}
```

---

## 6. SEGURIDAD (4 puntos clave)

1. **JWT** - tokens con expiración
2. **Rate limiting** - max requests por IP
3. **Validación** - DTOs + sanitización
4. **Headers** - CORS + Helmet.js + CSP

---

## 7. SITIOS SOPORTADOS (6)

1. CifraClub (.com y .com.br)
2. Ultimate Guitar
3. AcordesWeb
4. Cifras.com.br
5. EspirituGuitarrista
6. Chordify

---

## 8. ARQUITECTURA (Simple)

```
Usuario → Frontend (Angular)
          ↓ HTTP/REST
          Backend (NestJS)
          ↓ SQL
          PostgreSQL
```

---

## 9. DESAFÍOS RESUELTOS (3)

### Desafío 1: Cada sitio tiene HTML diferente
**Solución:** Sistema de patrones por sitio + fallback

### Desafío 2: Búsqueda lenta
**Solución:** Índices full-text + ILIKE optimizado

### Desafío 3: Costos de hosting
**Solución:** Railway + Vercel tier gratuito

---

## 10. ROADMAP (Próximas features)

**Fase 2:**
- Transposición de tonalidad
- Favoritos y playlists
- Compartir en redes
- Exportar PDF

**Fase 3:**
- Editor colaborativo
- Comentarios
- YouTube integration

---

## 11. VENTAJAS vs COMPETENCIA

### vs Ultimate Guitar:
✅ Sin anuncios
✅ Gratis
✅ Open source
✅ Búsqueda más rápida

### vs CifraClub:
✅ Multi-idioma
✅ Mejor UX móvil
✅ API pública

---

## 12. MÉTRICAS

- Tiempo de carga: <2s
- Disponibilidad: 99.9%
- Test coverage: >80%
- Objetivo usuarios: 1,000 en 3 meses

---

## 13. SCRIPT DE 2 MINUTOS (Memorízalo)

> "**Black Sheep Tabs** es una plataforma web para músicos que quieren aprender canciones sin anuncios.
>
> Tiene **3 componentes**:
>
> **1. Frontend Angular** con búsqueda inteligente y autocompletado en tiempo real.
>
> **2. Backend NestJS** con un scraper que extrae automáticamente tablaturas de 6+ sitios. El scraper detecta acordes, limpia HTML y guarda solo contenido musical.
>
> **3. Panel admin** para revisar tabs antes de publicar.
>
> **Técnicamente:**
> - JWT auth con roles
> - Rate limiting
> - Tests >80% coverage
> - Deploy con Docker en Railway y Vercel
> - CI/CD con GitHub Actions
>
> Es **open source** y combina scraping ético + búsqueda optimizada + UX moderna."

---

## 14. PREGUNTAS FRECUENTES (Respuestas cortas)

**¿Es legal?**
→ Uso personal/educativo OK. No monetizamos. Damos crédito.

**¿Cómo se financia?**
→ Donaciones voluntarias. Sin ads ni paywalls.

**¿Escala?**
→ PostgreSQL soporta millones de registros. CDN + cache + load balancing.

**¿Open source?**
→ Sí, GitHub público.

---

## 15. COMANDOS CLAVE (Para demo)

### Scraper
```bash
cd scripts/scraper
node tab-scraper.js --batch urls.txt
node import-to-db.js https://api-url
```

### Backend
```bash
cd backend/black-sheep-api
npm run start:dev
```

### Frontend
```bash
cd frontend/black-sheep-app
ng serve
```

---

## 16. ESTRUCTURA DE ARCHIVOS (Lo importante)

```
blackSheep/
├── backend/
│   └── black-sheep-api/        # NestJS API
├── frontend/
│   └── black-sheep-app/        # Angular app
├── scripts/
│   └── scraper/
│       ├── tab-scraper.js      # Scraper principal
│       ├── urls.txt            # URLs para scrapear
│       └── extracted-tabs/     # JSONs generados
├── docker/                     # Docker configs
└── docs/                       # Documentación
```

---

## 17. PALABRAS CLAVE (Menciona estas)

- Full-stack (Angular + NestJS)
- TypeScript end-to-end
- RESTful API
- ORM (TypeORM)
- Autenticación JWT
- Rate limiting
- Web scraping ético
- CI/CD
- Docker containerization
- Cloud deployment
- Test-driven development
- Responsive design
- Single Page Application (SPA)

---

## 18. SI TE PREGUNTAN...

**"¿Qué aprendiste?"**
→ Scraping ético, optimización de búsquedas, deploy cloud, seguridad JWT

**"¿Qué fue difícil?"**
→ Cada sitio tiene HTML diferente. Resolví con sistema de patrones + fallback.

**"¿Qué mejorarías?"**
→ Transposición de acordes, editor colaborativo, app móvil

**"¿Por qué este stack?"**
→ TypeScript end-to-end, frameworks robustos, gran comunidad, buena documentación

**"¿Cuánto tiempo tomó?"**
→ [Tu tiempo real] - MVP funcional, iterativo, siguiendo Agile

---

## 19. NÚMEROS A RECORDAR

- **6+** sitios soportados
- **<2s** tiempo de carga
- **99.9%** uptime objetivo
- **>80%** test coverage
- **3** componentes principales (frontend, backend, scraper)
- **1,000** usuarios objetivo en 3 meses

---

## 20. CIERRE FUERTE

> "Este proyecto demuestra mis habilidades full-stack, desde diseño de APIs hasta UX responsive, pasando por scraping inteligente y deploy en cloud. Es funcional, escalable y resuelve un problema real. Estoy orgulloso del resultado y emocionado por las mejoras futuras."

---

# TIPS FINALES

## Antes de la entrevista:
1. Lee este cheat sheet 3 veces
2. Practica el pitch de 2 minutos en voz alta
3. Abre el demo en tu navegador
4. Ten el código abierto en VS Code
5. Respira profundo

## Durante la entrevista:
- Habla despacio y claro
- Si no sabes algo, di "no lo implementé aún, pero mi approach sería..."
- Muestra código si preguntan
- No digas "es simple" - di "es eficiente"
- Demuestra que sabes escalarlo

## Después de cada respuesta:
- Pausa 2 segundos
- Pregunta: "¿Quieren que profundice en algo?"

---

**¡SUERTE! 🚀🎸**
