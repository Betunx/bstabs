# Black Sheep Tabs - Presentación para Entrevista

## Elevator Pitch (30 segundos)

**Black Sheep Tabs** es una plataforma web de tablaturas musicales diseñada para músicos que quieren aprender canciones de forma fácil y rápida. Permite buscar, visualizar y practicar acordes de guitarra/bajo con una interfaz moderna y responsive.

---

## Características Principales

### 1. Búsqueda Inteligente
- Autocompletado en tiempo real mientras escribes
- Sugerencias "Did you mean?" para correcciones
- Búsqueda por título, artista o acordes
- Resultados instantáneos

### 2. Visualización de Tablaturas
- Acordes resaltados visualmente
- Letra sincronizada con acordes
- Responsive: funciona en móvil, tablet y desktop
- Modo oscuro/claro

### 3. Sistema de Scraping
- Extrae automáticamente tablaturas de múltiples sitios
- Soporta: CifraClub, Ultimate Guitar, AcordesWeb, y más
- Detecta acordes automáticamente
- Limpia HTML y extrae solo contenido musical

### 4. Panel de Administración
- Gestión de canciones (CRUD completo)
- Review de tabs scraped antes de publicar
- Sistema de estados: draft, pending, published
- Estadísticas de uso

### 5. Sistema de Donaciones
- Integración con PayPal
- Página dedicada para supporters
- Transparente y opcional

---

## Stack Tecnológico

### Frontend
- **Angular 18** - Framework principal
- **TypeScript** - Type safety
- **Bootstrap 5** - Diseño responsive
- **RxJS** - Manejo de estado reactivo

### Backend
- **NestJS** - Framework Node.js robusto
- **PostgreSQL** - Base de datos relacional
- **TypeORM** - ORM para TypeScript
- **JWT** - Autenticación segura

### DevOps
- **Docker** - Containerización
- **Railway/Vercel** - Deployment
- **GitHub Actions** - CI/CD
- **Cloudflare** - CDN y seguridad

---

## Arquitectura del Sistema

```
┌─────────────┐
│  Frontend   │
│  (Angular)  │
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────┐
│   Backend   │
│  (NestJS)   │
└──────┬──────┘
       │ SQL
┌──────▼──────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
```

---

## Modelo de Datos

### Song (Canción)
```typescript
{
  id: number
  title: string
  artist: string
  content: string (HTML con acordes)
  chords: string[] (ej: ["C", "G", "Am", "F"])
  difficulty: "easy" | "medium" | "hard"
  status: "draft" | "pending" | "published"
  sourceUrl: string
  createdAt: Date
  updatedAt: Date
}
```

---

## Funcionalidades de Seguridad

1. **Autenticación JWT**
   - Tokens seguros con expiración
   - Refresh tokens para sesiones largas

2. **Autorización basada en roles**
   - Admin: acceso total
   - User: solo lectura

3. **Rate Limiting**
   - Protección contra spam
   - Límite de requests por IP

4. **Validación de datos**
   - DTOs con class-validator
   - Sanitización de HTML

5. **Headers de seguridad**
   - CORS configurado
   - Helmet.js para headers HTTP
   - Content Security Policy

---

## Proceso de Scraping (Cómo Funciona)

### Paso 1: Recolección de URLs
```bash
# Archivo: scripts/scraper/urls.txt
https://www.cifraclub.com.br/song1
https://www.cifraclub.com.br/song2
```

### Paso 2: Extracción Automática
```bash
node tab-scraper.js --batch urls.txt
```

El scraper:
1. Descarga el HTML de cada URL
2. Detecta automáticamente el sitio (CifraClub, AcordesWeb, etc.)
3. Extrae solo el contenido musical (letra + acordes)
4. Limpia scripts, ads, estilos
5. Detecta acordes con regex
6. Guarda en formato JSON

### Paso 3: Importación a Base de Datos
```bash
node import-to-db.js https://api-url
```

### Paso 4: Review Manual
- Admin revisa tabs en panel
- Verifica acordes con instrumento
- Publica o edita

---

## Ventajas Competitivas

### vs Ultimate Guitar
✅ Sin anuncios intrusivos
✅ Gratis y open source
✅ Interfaz más limpia
✅ Búsqueda más rápida

### vs CifraClub
✅ Multi-idioma
✅ Mejor UX móvil
✅ Sistema de donaciones transparente
✅ API pública disponible

---

## Roadmap Futuro

### Fase 1 (MVP - ACTUAL)
- ✅ CRUD de canciones
- ✅ Búsqueda básica
- ✅ Scraper funcional
- ✅ Deploy en Railway

### Fase 2 (Próximos 3 meses)
- 🔲 Transposición de tonalidad
- 🔲 Favoritos y playlists
- 🔲 Compartir en redes sociales
- 🔲 Exportar a PDF

### Fase 3 (6 meses)
- 🔲 Editor de tabs colaborativo
- 🔲 Sistema de comentarios
- 🔲 Versiones de usuarios
- 🔲 Integración con YouTube

### Fase 4 (1 año)
- 🔲 App móvil nativa
- 🔲 Sincronización con metronomo
- 🔲 Modo práctica con loops
- 🔲 Detección de acordes por audio

---

## Métricas y KPIs

### Técnicas
- Tiempo de carga: <2s
- Disponibilidad: 99.9%
- Cobertura de tests: >80%

### Negocio (Proyección)
- Usuarios activos mensuales: objetivo 1,000 en 3 meses
- Tabs en base de datos: 500+
- Tasa de conversión a donadores: 2-5%

---

## Desafíos Técnicos Resueltos

### 1. Extracción de Tabs
**Problema:** Cada sitio tiene estructura HTML diferente
**Solución:** Sistema de patrones por sitio + fallback genérico

### 2. Búsqueda Rápida
**Problema:** Búsqueda en texto completo lenta en PostgreSQL
**Solución:** Índices full-text + ILIKE optimizado

### 3. Deploy Económico
**Problema:** Costos de hosting
**Solución:** Railway (backend) + Vercel (frontend) = gratis en tier free

### 4. Seguridad de Scraping
**Problema:** Ser bloqueado por rate limiting
**Solución:**
- Delays entre requests (2s)
- User-Agent headers
- Respeto a robots.txt

---

## Demo en Vivo

### URLs de prueba
- **Frontend:** https://blacksheep-tabs.vercel.app
- **Backend API:** https://blacksheep-api.railway.app
- **Swagger Docs:** https://blacksheep-api.railway.app/api

### Casos de uso para demostrar

1. **Búsqueda:**
   - Buscar "Let It Be"
   - Mostrar autocompletado
   - Ver resultados instantáneos

2. **Visualización:**
   - Abrir una tab
   - Mostrar acordes resaltados
   - Responsive en móvil

3. **Admin:**
   - Login al panel
   - Ver tabs pending
   - Publicar una tab

---

## Preguntas Frecuentes

### ¿Es legal scrapear tabs?
**R:** Uso personal y educativo es generalmente aceptado. No revendemos ni monetizamos directamente el contenido. Damos crédito a fuentes originales.

### ¿Cómo se financia?
**R:** Sistema de donaciones voluntarias. Sin anuncios, sin paywalls.

### ¿Escalabilidad?
**R:**
- PostgreSQL puede manejar millones de registros
- CDN para assets estáticos
- Cacheo de búsquedas frecuentes
- Load balancing con Railway

### ¿Contribuciones open source?
**R:** Sí! GitHub público, issues abiertos, PRs bienvenidos.

---

## Contacto y Recursos

- **GitHub:** github.com/tu-usuario/blackSheep
- **Demo:** blacksheep-tabs.vercel.app
- **Docs:** Ver carpeta /docs en el repo
- **Email:** tu-email@example.com

---

## Puntos Clave para Recordar

1. **Valor para el usuario:** Aprender música de forma gratuita y sin distracciones
2. **Stack moderno:** Angular + NestJS + PostgreSQL
3. **Innovación:** Sistema de scraping inteligente + búsqueda con AI
4. **Seguridad:** JWT + validación + rate limiting
5. **Escalable:** Arquitectura cloud-native
6. **Visión:** Plataforma colaborativa para músicos

---

## Script de Presentación (2 minutos)

> "Hola, les voy a presentar **Black Sheep Tabs**, una plataforma web que creé para resolver un problema que tengo como músico: encontrar tablaturas de calidad sin anuncios ni paywalls.
>
> La aplicación tiene tres componentes principales:
>
> **1. Frontend en Angular** con búsqueda inteligente y autocompletado en tiempo real. Si buscas "Let It Be", te sugiere inmediatamente resultados y hasta te corrige si escribes mal.
>
> **2. Backend en NestJS** con PostgreSQL, donde implementé un sistema de scraping que extrae automáticamente tablaturas de sitios como CifraClub y Ultimate Guitar. El scraper detecta acordes, limpia el HTML y guarda solo el contenido musical.
>
> **3. Panel de administración** donde puedo revisar las tabs scraped antes de publicarlas, asegurando calidad.
>
> Las características técnicas incluyen:
> - Autenticación JWT con roles
> - Rate limiting para proteger la API
> - Tests unitarios con >80% coverage
> - Deploy en Railway y Vercel usando Docker
> - CI/CD con GitHub Actions
>
> Lo interesante del proyecto es que combina web scraping ético, búsqueda full-text optimizada, y una UX moderna. Todo open source y gratuito.
>
> ¿Tienen alguna pregunta?"

---

# TIPS PARA LA ENTREVISTA

## DO's:
✅ Habla con confianza sobre tus decisiones técnicas
✅ Menciona los trade-offs que consideraste
✅ Muestra el código en vivo si preguntan
✅ Explica por qué elegiste este stack
✅ Habla sobre escalabilidad y mejoras futuras

## DON'Ts:
❌ No digas "es simple" o "es básico"
❌ No te disculpes por lo que falta
❌ No finjas saber algo que no sabes
❌ No critiques otras soluciones sin fundamento

## Si te preguntan algo que no sabes:
> "No he implementado eso aún, pero mi approach sería [explica tu idea]"

## Si te piden mejoras:
> "Una mejora que tengo en mente es [feature], porque [razón de negocio/técnica]"
