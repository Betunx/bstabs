# ✅ Tareas Pendientes - Black Sheep Tabs

**Última actualización**: 2025-12-22
**Rama actual**: `heatcliff` (trabajo desde esta PC)

---

## 🚨 PRIORIDAD ALTA - Hacer AHORA

### 1. Sistema de PDFs (50% completado)
**Tiempo estimado**: 2 horas

- [x] Instalar pdfkit en backend
- [ ] Crear servicio `PdfService` en backend
- [ ] Endpoint `GET /songs/:id/pdf`
- [ ] Botón "Descargar PDF" en `tab-viewer` component
- [ ] Diseño limpio (similar a AcordesWeb)
- [ ] Incluir créditos a fuente original

**Archivos a modificar**:
- `backend/black-sheep-api/src/songs/pdf.service.ts` (nuevo)
- `backend/black-sheep-api/src/songs/songs.controller.ts`
- `backend/black-sheep-api/src/songs/songs.module.ts`
- `frontend/black-sheep-app/src/app/shared/components/tab-viewer/tab-viewer.html`
- `frontend/black-sheep-app/src/app/shared/components/tab-viewer/tab-viewer.ts`

---

### 2. Enlaces a Spotify/YouTube (0% completado)
**Tiempo estimado**: 2 horas

**Backend**:
- [ ] Agregar campos a entidad `Song`:
  - `spotifyUrl?: string`
  - `youtubeUrl?: string`
  - `sourceUrl?: string` (crédito a fuente original)
- [ ] Crear migración de TypeORM
- [ ] Actualizar DTOs

**Frontend**:
- [ ] Botones de Spotify/YouTube en `tab-viewer`
- [ ] Lógica híbrida:
  - Si existe URL → abrir directamente
  - Si no existe → generar búsqueda automática
- [ ] Iconos de Spotify y YouTube (SVG)
- [ ] Estilos en los 4 temas

**Archivos a modificar**:
- `backend/black-sheep-api/src/songs/entities/song.entity.ts`
- `backend/black-sheep-api/src/songs/dto/create-song.dto.ts`
- `backend/black-sheep-api/src/songs/dto/update-song.dto.ts`
- `frontend/black-sheep-app/src/app/core/models/song.model.ts`
- `frontend/black-sheep-app/src/app/shared/components/tab-viewer/tab-viewer.html`
- `frontend/black-sheep-app/src/app/shared/components/tab-viewer/tab-viewer.scss`

---

### 3. Primera Canción - "Viejo Lobo" (0% completado)
**Tiempo estimado**: 1 hora

- [ ] Obtener acordes y letra completa
- [ ] Crear JSON con formato correcto
- [ ] Agregar URLs de Spotify y YouTube
- [ ] Importar a la base de datos
- [ ] Publicar desde admin dashboard
- [ ] Verificar visualización en todos los temas

**Datos necesarios**:
- Título: "Viejo Lobo"
- Artista: "Natanael Cano ft Luis R Conriquez"
- Tono: A determinar
- Fuente: https://acordesweb.com/descarga-pdf/natanael-cano/viejo-lobo-ft-luis-r-conriquez/0/0/0.pdf

---

## 🎯 PRIORIDAD MEDIA - Esta Semana

### 4. Deploy a Producción (0% completado)
**Tiempo estimado**: 2-3 horas

**Backend**:
- [ ] Crear cuenta en Railway o Render
- [ ] Configurar PostgreSQL
- [ ] Variables de entorno
- [ ] Deploy y test

**Frontend**:
- [ ] Verificar Vercel deployment
- [ ] Actualizar `environment.prod.ts`
- [ ] Conectar con backend en producción
- [ ] Test completo

**Base de Datos**:
- [ ] PostgreSQL en producción (Railway/Supabase)
- [ ] Ejecutar migraciones
- [ ] Importar datos iniciales

**Ver**: [docs/RAILWAY-GUIDE.md](docs/RAILWAY-GUIDE.md)

---

### 5. Contenido Inicial (0% completado)
**Tiempo estimado**: 3-4 horas

- [ ] Scraping de 20-50 canciones populares
- [ ] Revisión desde admin dashboard
- [ ] Publicación gradual
- [ ] Verificación de calidad

**Ver**: [docs/SCRAPING-GUIDE.md](docs/SCRAPING-GUIDE.md)

---

### 6. SEO Básico (0% completado)
**Tiempo estimado**: 1 hora

- [ ] Meta tags en componentes
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] Google Search Console
- [ ] Google Analytics 4

---

## 💡 BACKLOG - Próximas Semanas

### 7. Preview de Audio
- [ ] Spotify Embed Player
- [ ] YouTube embed minimalista
- [ ] Tabs para elegir fuente
- [ ] Controles de reproducción

### 8. Mejoras de UX
- [ ] Loading spinners
- [ ] Error handling (toast notifications)
- [ ] Skeleton loaders
- [ ] Empty states
- [ ] 404 personalizado

### 9. Sistema de Usuarios (Futuro)
- [ ] Registro/Login
- [ ] Favoritos
- [ ] Historial
- [ ] Playlists personales

---

## 🐛 Bugs Conocidos a Resolver

1. **Mobile Navigation**: Falta link de admin en menú móvil
2. **Search Service**: Usa mock data, conectar a API
3. **Admin Dashboard**: No conectado a backend real
4. **Theme Persistence**: No se guarda al recargar página
5. **404 Page**: Falta página personalizada

---

## 📊 Checklist Pre-Launch

### Must Have (Mínimo para lanzar)
- [ ] Backend deployed y funcionando
- [ ] Frontend deployed con dominio
- [ ] Mínimo 20 tabs publicados
- [ ] Búsqueda funcionando
- [ ] Página de donaciones activa
- [ ] Google Analytics configurado
- [ ] Meta tags SEO completos
- [ ] Sistema de PDFs funcionando

### Nice to Have (Puede esperar)
- [ ] Preview de audio
- [ ] Sistema de usuarios
- [ ] Comentarios
- [ ] PWA offline mode

---

## 🔥 Siguiente Sesión de Trabajo

**Recomendación**: Empezar en este orden

1. **Terminar PDFs** (2h)
   - Crear PdfService
   - Endpoint API
   - Botón en frontend

2. **Agregar "Viejo Lobo"** (1h)
   - Obtener acordes
   - Crear JSON
   - Importar y publicar

3. **Enlaces Spotify/YouTube** (2h)
   - Migración de BD
   - Botones en UI
   - Lógica híbrida

4. **Commit y Push** (15min)
   - Commit a rama `heatcliff`
   - Push al remoto
   - Verificar en GitHub

---

## 📝 Notas Importantes

### Estructura Limpia Lograda ✅
- Solo 2 archivos .md en raíz: README.md y ROADMAP.md
- Documentación técnica en `docs/`
- Todo organizado y profesional

### Archivos Clave
- **README.md**: Introducción al proyecto
- **ROADMAP.md**: Plan completo de desarrollo
- **docs/REFERENCE.md**: Referencia técnica
- **TAREAS_PENDIENTES.md**: Este archivo (guía de trabajo)

### Comandos Git Útiles
```bash
# Ver estado
git status

# Commit cambios
git add .
git commit -m "feat: Implement PDF generation and music platform links"

# Push a rama heatcliff
git push

# Ver diferencias
git diff main...heatcliff
```

---

## 🎸 Enfócate en esto:

1. **PDFs primero** - Es la feature más solicitada
2. **"Viejo Lobo"** - Primera canción completa
3. **Links musicales** - Mejora experiencia de usuario
4. **Deploy** - Para que el mundo lo vea

**Tiempo total estimado**: 7-8 horas de trabajo
**Meta**: Tener algo publicable en 1-2 días

---

**¡Vamos con todo! 🚀🎸**
