# 🗺️ Black Sheep - Roadmap

## 🚀 PRIORIDAD ALTA (Próximos Pasos Inmediatos)

### 1. Sistema de PDFs ⏳
**Estado**: En progreso
- [x] Instalar pdfkit en backend
- [ ] Crear servicio de generación de PDF
- [ ] Endpoint `GET /songs/:id/pdf`
- [ ] Botón "Descargar PDF" en tab-viewer
- [ ] Estilo limpio similar a AcordesWeb

**Tiempo estimado**: 2-3 horas

### 2. Enlaces a Plataformas Musicales 🎵
**Estado**: Pendiente
- [ ] Agregar campos `spotifyUrl` y `youtubeUrl` a la base de datos
- [ ] Migración de TypeORM para nuevos campos
- [ ] Botones de Spotify/YouTube en tab-viewer (híbrido)
- [ ] Búsqueda automática si no hay URL guardada

**Tiempo estimado**: 2 horas

### 3. Primera Canción de Ejemplo 🎸
**Estado**: Pendiente
- [ ] Agregar "Viejo Lobo - Natanael Cano ft Luis R Conriquez"
- [ ] Incluir letra completa y acordes
- [ ] Agregar links de Spotify y YouTube
- [ ] Verificar visualización correcta

**Tiempo estimado**: 1 hora

---

## 🎯 PRIORIDAD MEDIA (Esta Semana)

### 4. Deploy del Backend
**Tiempo estimado**: 1-2 horas
- [ ] Crear cuenta en Railway o Render
- [ ] Configurar variables de entorno
- [ ] Generar `ADMIN_API_KEY` segura
- [ ] Deploy y verificar endpoints

**Ver**: `docs/RAILWAY-GUIDE.md` y `docs/FREE-HOSTING-OPTIONS.md`

### 5. Base de Datos en Producción
**Tiempo estimado**: 1 hora
- [ ] PostgreSQL en Railway/Supabase
- [ ] Ejecutar migraciones de TypeORM
- [ ] Importar primeras canciones
- [ ] Verificar conexión desde backend

### 6. Conectar Frontend con Backend Real
**Tiempo estimado**: 30 minutos
- [ ] Actualizar `environment.prod.ts` con URL de API
- [ ] Reemplazar mock data con llamadas HTTP
- [ ] Probar búsqueda y visualización

---

## 💡 PRIORIDAD BAJA (Próximas Semanas)

### 7. Scraping Masivo
**Tiempo estimado**: 2-3 horas
- [ ] Lista de 50-100 canciones populares
- [ ] Ejecutar scraper en batch
- [ ] Revisar desde admin dashboard
- [ ] Publicar canciones aprobadas

**Ver**: `docs/SCRAPING-GUIDE.md`

### 8. SEO Básico
**Tiempo estimado**: 1 hora
- [ ] Meta tags (title, description, og:image)
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Google Search Console
- [ ] Google Analytics 4

### 9. Mejoras de UX
**Tiempo estimado**: 2 horas
- [ ] Loading spinners
- [ ] Error handling (toasts/alerts)
- [ ] Skeleton loaders
- [ ] Empty states

---

## 🔮 FUTURO (Ideas a Largo Plazo)

### Features Avanzadas
- [ ] **Preview de Audio**: Spotify Embed o YouTube player minimalista
- [ ] **Transposición de Tonos**: Cambiar la tonalidad al vuelo
- [ ] **Scroll Automático**: Para practicar mientras tocas
- [ ] **Modo Colaborativo**: Usuarios pueden sugerir correcciones
- [ ] **PWA Offline**: Guardar tabs favoritos sin internet
- [ ] **Diagramas de Acordes**: Visualización gráfica

### Comunidad
- [ ] Sistema de usuarios (registro/login)
- [ ] Favoritos y playlists
- [ ] Comentarios en tabs
- [ ] Rating de calidad (⭐)
- [ ] Reportar errores

### Monetización (Post-Launch)
- [ ] Tabs premium con videos
- [ ] Suscripción mensual ($2-5/mes)
- [ ] Libros descargables (PDF)
- [ ] Google AdSense (no intrusivo)

### Integraciones
- [ ] Spotify API (preview oficial)
- [ ] YouTube API (búsqueda automática)
- [ ] Telegram Bot
- [ ] Discord Bot
- [ ] API Pública

---

## 🛠️ Deuda Técnica

### Backend
- [ ] Paginación en endpoints
- [ ] Tests unitarios (Jest)
- [ ] Tests E2E (Supertest)
- [ ] Logging (Winston/Pino)
- [ ] Health check endpoint (`/health`)
- [ ] Documentación Swagger/OpenAPI
- [ ] Índices en BD para búsquedas

### Frontend
- [ ] Tests (Jasmine/Jest)
- [ ] Storybook para componentes
- [ ] Lazy loading de rutas
- [ ] Optimización de imágenes (WebP)
- [ ] Service Worker para PWA
- [ ] Error boundary

---

## 🐛 Bugs Conocidos

1. **Mobile Navigation**: Falta link de admin en menú móvil
2. **Search Service**: Usa mock data, conectar a API
3. **Admin Dashboard**: No conectado a backend real
4. **Theme Persistence**: No se guarda al recargar
5. **404 Page**: Falta página personalizada

---

## 📊 Métricas de Éxito (3 Meses)

### Tráfico
- **Mes 1**: 100 visitas/día
- **Mes 2**: 500 visitas/día
- **Mes 3**: 1,000+ visitas/día

### Contenido
- **Mes 1**: 50 tabs
- **Mes 2**: 200 tabs
- **Mes 3**: 500+ tabs

### Donaciones
- **Mes 1**: $5 (cubrir servidor)
- **Mes 2**: $20
- **Mes 3**: $50+ (reinvertir)

---

## ✅ Checklist Pre-Launch

### Must Have
- [ ] Backend deployed y funcionando
- [ ] Frontend deployed con dominio
- [ ] Mínimo 20 tabs publicados
- [ ] Búsqueda funcionando
- [ ] Página de donaciones activa
- [ ] Contacto funcional
- [ ] Google Analytics
- [ ] Meta tags SEO

### Nice to Have
- [ ] Sistema de usuarios
- [ ] Comentarios
- [ ] Tutoriales en video
- [ ] PWA offline mode

---

**Última actualización**: 2025-12-22
**Próximo paso**: Completar sistema de PDFs y agregar "Viejo Lobo"
