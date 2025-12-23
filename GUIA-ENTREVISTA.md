BLACK SHEEP TABS - GUIA DE ENTREVISTA

SCRIPT DE PRESENTACION (2 MINUTOS)

Black Sheep Tabs es una plataforma web para músicos que quieren aprender canciones sin anuncios.

Tiene 3 componentes:

1. Frontend Angular con búsqueda inteligente y autocompletado en tiempo real.

2. Backend NestJS con un scraper que extrae automáticamente tablaturas de 6+ sitios. El scraper detecta acordes, limpia HTML y guarda solo contenido musical.

3. Panel admin para revisar tabs antes de publicar.

Técnicamente:
- JWT auth con roles
- Rate limiting
- Tests sobre 80% coverage
- Deploy con Docker en Railway y Vercel
- CI/CD con GitHub Actions

Es open source y combina scraping ético con búsqueda optimizada y UX moderna.


STACK TECNOLOGICO

Frontend
Angular 18, TypeScript, Bootstrap 5, RxJS

Backend
NestJS, TypeORM, PostgreSQL, JWT

DevOps
Docker, Railway, Vercel, GitHub Actions, Cloudflare


ARQUITECTURA

Usuario - Frontend (Angular) - HTTP/REST - Backend (NestJS) - SQL - PostgreSQL


MODELO DE DATOS

Song {
  id: number
  title: string
  artist: string
  content: string (HTML con acordes)
  chords: string[] (ejemplo: ["C", "G", "Am", "F"])
  difficulty: "easy" | "medium" | "hard"
  status: "draft" | "pending" | "published"
  sourceUrl: string
  createdAt: Date
  updatedAt: Date
}


SEGURIDAD

1. Autenticación JWT - Tokens seguros con expiración, refresh tokens
2. Autorización basada en roles - Admin: acceso total, User: solo lectura
3. Rate Limiting - Protección contra spam, límite de requests por IP
4. Validación de datos - DTOs con class-validator, sanitización de HTML
5. Headers de seguridad - CORS, Helmet.js, Content Security Policy


PROCESO DE SCRAPING

Paso 1: Recolección de URLs
Archivo: scripts/scraper/urls.txt con lista de URLs

Paso 2: Extracción Automática
Comando: node tab-scraper.js --batch urls.txt

El scraper:
1. Descarga el HTML de cada URL
2. Detecta automáticamente el sitio (CifraClub, AcordesWeb, etc)
3. Extrae solo el contenido musical (letra + acordes)
4. Limpia scripts, ads, estilos
5. Detecta acordes con regex
6. Guarda en formato JSON

Paso 3: Importación a Base de Datos
Comando: node import-to-db.js https://api-url

Paso 4: Review Manual
Admin revisa tabs en panel, verifica acordes con instrumento, publica o edita


SITIOS SOPORTADOS (6)

1. CifraClub (.com y .com.br)
2. Ultimate Guitar
3. AcordesWeb
4. Cifras.com.br
5. EspirituGuitarrista
6. Chordify


VENTAJAS COMPETITIVAS

vs Ultimate Guitar
Sin anuncios intrusivos, gratis y open source, interfaz más limpia, búsqueda más rápida

vs CifraClub
Multi-idioma, mejor UX móvil, sistema de donaciones transparente, API pública disponible


ROADMAP

Fase 1 (MVP - ACTUAL)
CRUD de canciones, búsqueda básica, scraper funcional, deploy en Railway

Fase 2 (Próximos 3 meses)
Transposición de tonalidad, favoritos y playlists, compartir en redes sociales, exportar a PDF

Fase 3 (6 meses)
Editor de tabs colaborativo, sistema de comentarios, versiones de usuarios, integración con YouTube

Fase 4 (1 año)
App móvil nativa, sincronización con metrónomo, modo práctica con loops, detección de acordes por audio


METRICAS Y KPIS

Técnicas
Tiempo de carga: menor a 2 segundos
Disponibilidad: 99.9%
Cobertura de tests: mayor a 80%

Negocio (Proyección)
Usuarios activos mensuales: objetivo 1,000 en 3 meses
Tabs en base de datos: 500+
Tasa de conversión a donadores: 2-5%


DESAFIOS TECNICOS RESUELTOS

1. Extracción de Tabs
Problema: Cada sitio tiene estructura HTML diferente
Solución: Sistema de patrones por sitio + fallback genérico

2. Búsqueda Rápida
Problema: Búsqueda en texto completo lenta en PostgreSQL
Solución: Índices full-text + ILIKE optimizado

3. Deploy Económico
Problema: Costos de hosting
Solución: Railway (backend) + Vercel (frontend) = gratis en tier free

4. Seguridad de Scraping
Problema: Ser bloqueado por rate limiting
Solución: Delays entre requests (2s), User-Agent headers, respeto a robots.txt


PREGUNTAS FRECUENTES

Es legal scrapear tabs?
Uso personal y educativo es generalmente aceptado. No revendemos ni monetizamos directamente el contenido. Damos crédito a fuentes originales.

Como se financia?
Sistema de donaciones voluntarias. Sin anuncios, sin paywalls.

Escalabilidad?
PostgreSQL puede manejar millones de registros, CDN para assets estáticos, cacheo de búsquedas frecuentes, load balancing con Railway


PUNTOS CLAVE PARA RECORDAR

1. Valor para el usuario: Aprender música de forma gratuita y sin distracciones
2. Stack moderno: Angular + NestJS + PostgreSQL
3. Innovación: Sistema de scraping inteligente + búsqueda con AI
4. Seguridad: JWT + validación + rate limiting
5. Escalable: Arquitectura cloud-native
6. Visión: Plataforma colaborativa para músicos


RESPUESTAS RAPIDAS

Que aprendiste?
Scraping ético, optimización de búsquedas full-text en PostgreSQL, deploy cloud, seguridad JWT, CI/CD con GitHub Actions

Que fue difícil?
El scraper porque cada sitio tiene estructura HTML diferente. Resolví con sistema de patrones específicos por sitio con auto-detección por URL, más un método fallback genérico

Que mejorarías?
Transposición automática de acordes para diferentes tonalidades, editor colaborativo donde usuarios puedan sugerir correcciones, app móvil nativa con React Native

Por qué este stack?
TypeScript end-to-end para type safety completo. Angular porque es framework completo. NestJS porque tiene arquitectura modular excelente con dependency injection. PostgreSQL por búsqueda full-text y ACID compliance


PALABRAS CLAVE TECNICAS

Full-stack (Angular + NestJS)
TypeScript end-to-end
RESTful API
ORM (TypeORM)
Autenticación JWT
Rate limiting
Web scraping ético
CI/CD
Docker containerization
Cloud deployment
Test-driven development
Responsive design
Single Page Application (SPA)
Dependency Injection
Repository Pattern


NUMEROS A RECORDAR

6+ sitios soportados
Menor a 2s tiempo de carga
99.9% uptime objetivo
Mayor a 80% test coverage
3 componentes principales (frontend, backend, scraper)
1,000 usuarios objetivo en 3 meses


COMANDOS CLAVE

Scraper
cd scripts/scraper
node tab-scraper.js --batch urls.txt
node import-to-db.js https://api-url

Backend
cd backend/black-sheep-api
npm run start:dev

Frontend
cd frontend/black-sheep-app
ng serve


ESTRUCTURA DE ARCHIVOS

blackSheep/
  backend/
    black-sheep-api/ (NestJS API)
  frontend/
    black-sheep-app/ (Angular app)
  scripts/
    scraper/
      tab-scraper.js (Scraper principal)
      urls.txt (URLs para scrapear)
      extracted-tabs/ (JSONs generados)
  docker/ (Docker configs)
  docs/ (Documentación)


DEMO EN VIVO

URLs de prueba
Frontend: https://blacksheep-tabs.vercel.app
Backend API: https://blacksheep-api.railway.app
Swagger Docs: https://blacksheep-api.railway.app/api

Casos de uso para demostrar
1. Búsqueda: Buscar "Let It Be", mostrar autocompletado, ver resultados instantáneos
2. Visualización: Abrir una tab, mostrar acordes resaltados, responsive en móvil
3. Admin: Login al panel, ver tabs pending, publicar una tab


TIPS PARA LA ENTREVISTA

DO's
Habla con confianza sobre tus decisiones técnicas
Menciona los trade-offs que consideraste
Muestra el código en vivo si preguntan
Explica por qué elegiste este stack
Habla sobre escalabilidad y mejoras futuras

DON'Ts
No digas "es simple" o "es básico"
No te disculpes por lo que falta
No finjas saber algo que no sabes
No critiques otras soluciones sin fundamento

Si te preguntan algo que no sabes
No he implementado eso aún, pero mi approach sería [explica tu idea]

Si te piden mejoras
Una mejora que tengo en mente es [feature], porque [razón de negocio/técnica]


CIERRE FUERTE

Este proyecto demuestra mis habilidades full-stack, desde diseño de APIs hasta UX responsive, pasando por scraping inteligente y deploy en cloud. Es funcional, escalable y resuelve un problema real.
