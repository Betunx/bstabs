# 🎯 Plan Estratégico - Black Sheep Tabs

## 📊 Estado Actual del Proyecto

### ✅ LO QUE YA FUNCIONA (Listo para usar)

#### Backend
- [x] Estructura básica de NestJS
- [x] Entidad `Song` con TypeORM
- [x] CRUD completo de canciones
- [x] Búsqueda por título
- [x] Sistema de estados (draft/pending/published/archived)
- [x] Seguridad básica (Helmet, Rate Limiting, CSRF, Sanitization)
- [x] API Key guard para admin
- [x] Endpoint de importación batch

#### Frontend
- [x] Estructura de Angular 20.3
- [x] Sistema de 4 temas (Light, Dark, Night Red, OLED)
- [x] Componente `tab-viewer` (visualización de tabs)
- [x] Admin dashboard (UI lista)
- [x] Editor de tabs (UI lista)
- [x] Página de donaciones
- [x] Búsqueda con autocomplete
- [x] Header/Footer responsive

### 🚧 LO QUE ESTÁ A MEDIAS (Necesita conexión)

- [ ] Admin dashboard → No conectado a API real
- [ ] Search service → Usa mock data
- [ ] Tab editor → No guarda a backend
- [ ] Theme persistence → No se guarda en localStorage

### ❌ LO QUE FALTA (Por implementar)

- [ ] Autenticación de usuarios (JWT)
- [ ] Sistema de PDFs
- [ ] Enlaces a Spotify/YouTube
- [ ] Base de datos con contenido real
- [ ] Deploy en producción

---

## 🎭 Estrategia de Ambientes

### 1. **Pre-Producción (Vercel Preview)**
**URL**: `https://black-sheep-app-preview.vercel.app`

**Propósito**: Ambiente de trabajo y staging
- ✅ Admin panel VISIBLE y ACTIVO
- ✅ Botones de crear/editar/eliminar canciones
- ✅ Importación de canciones
- ✅ Testing de features nuevas
- ✅ Sin restricciones

**Variables de entorno**:
```env
NEXT_PUBLIC_ENV=preview
NEXT_PUBLIC_API_URL=https://api-preview.railway.app
NEXT_PUBLIC_SHOW_ADMIN=true
```

### 2. **Producción (bstabs.com)**
**URL**: `https://bstabs.com`

**Propósito**: Experiencia pública limpia
- ❌ Admin panel OCULTO (solo accesible por URL secreta)
- ✅ Solo visualización de tabs publicados
- ✅ Búsqueda funcionando
- ✅ Donaciones activas
- ✅ PDFs descargables
- ❌ Sin botones de edición

**Variables de entorno**:
```env
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_API_URL=https://api.bstabs.com
NEXT_PUBLIC_SHOW_ADMIN=false
```

**Acceso admin en producción**:
- URL secreta: `https://bstabs.com/admin-secret-xyz`
- O con login de admin (futuro)

---

## 🏗️ Plan de Implementación por Fases

### **FASE 0: Preparación (AHORA)**
**Tiempo: 2-3 horas**

**Objetivo**: Configurar ambientes y hacer que lo existente funcione

1. **Configuración de Ambientes**
   - [x] Variables de entorno separadas (dev/preview/prod)
   - [ ] Feature flags para mostrar/ocultar admin
   - [ ] Configuración de API URLs dinámicas

2. **Conectar lo que ya existe**
   - [ ] Search service → Conectar a API real
   - [ ] Admin dashboard → Mostrar canciones reales
   - [ ] Theme persistence → Guardar en localStorage

3. **Base de Datos Inicial**
   - [ ] PostgreSQL en Railway (gratis)
   - [ ] Migrar schema
   - [ ] Importar 5-10 canciones de prueba

**Resultado**: App funcional en preview con admin activo

---

### **FASE 1: Lanzamiento Mínimo (MVP)**
**Tiempo: 1 semana**

**Objetivo**: bstabs.com en vivo con contenido real

#### Features Críticas

1. **Contenido Base**
   - [ ] Scraping de 50 canciones populares
   - [ ] Revisión y corrección manual
   - [ ] Publicación desde admin (preview)

2. **Experiencia de Usuario**
   - [ ] Sistema de PDFs funcionando
   - [ ] Búsqueda rápida y precisa
   - [ ] Mobile responsive perfecto
   - [ ] Tiempos de carga < 2 segundos

3. **SEO Básico**
   - [ ] Meta tags en todas las páginas
   - [ ] sitemap.xml
   - [ ] robots.txt
   - [ ] Google Analytics

4. **Deploy**
   - [ ] Backend en Railway/Render
   - [ ] Frontend en Vercel (producción)
   - [ ] Dominio bstabs.com apuntando correctamente
   - [ ] SSL activo

**Dejar para después**:
- ❌ Autenticación de usuarios
- ❌ Sistema de favoritos
- ❌ Comentarios
- ❌ Preview de audio
- ❌ Edición colaborativa

**Resultado**: Sitio público funcionando con 50+ tabs

---

### **FASE 2: Crecimiento (1-2 meses)**
**Tiempo: Continuo**

**Objetivo**: Aumentar contenido y visibilidad

1. **Contenido Masivo**
   - [ ] Scraping automatizado semanal
   - [ ] 200-500 canciones
   - [ ] Categorías por género
   - [ ] Artistas populares

2. **Features de Experiencia**
   - [ ] Enlaces a Spotify/YouTube
   - [ ] Transposición de tonos
   - [ ] Scroll automático
   - [ ] Compartir en redes sociales

3. **Marketing Básico**
   - [ ] Instagram con tabs diarios
   - [ ] Reddit en r/guitar
   - [ ] SEO optimization
   - [ ] Google Search Console

**Dejar para después**:
- ❌ Usuarios registrados
- ❌ Playlists personales
- ❌ Sistema de rating

**Resultado**: Tráfico creciendo, 500+ tabs, reconocimiento

---

### **FASE 3: Comunidad (3-6 meses)**
**Tiempo: Largo plazo**

**Objetivo**: Convertir en plataforma social

1. **Sistema de Usuarios**
   - [ ] Login/Signup con JWT
   - [ ] Roles: user, admin
   - [ ] Perfil de usuario
   - [ ] Favoritos personales

2. **Interacción**
   - [ ] Comentarios en tabs
   - [ ] Rating de calidad
   - [ ] Reportar errores
   - [ ] Sugerir correcciones

3. **Monetización (Opcional)**
   - [ ] Tabs premium
   - [ ] Suscripción $2-5/mes
   - [ ] Google AdSense no intrusivo

**Resultado**: Comunidad activa, ingresos para mantener

---

## 🎯 ACCIÓN INMEDIATA - Próximas 48 Horas

### Día 1: Bases Funcionando

**Mañana (4 horas)**:
1. Feature flags para ambientes (1h)
2. Conectar search service a API (30min)
3. Conectar admin dashboard a API (1h)
4. Theme persistence en localStorage (30min)
5. PostgreSQL en Railway + migraciones (1h)

**Tarde (3 horas)**:
1. Sistema de PDFs completo (2h)
2. Importar "Viejo Lobo" + 5 canciones más (1h)
3. Testing en preview (30min)

### Día 2: Contenido y Deploy

**Mañana (4 horas)**:
1. Scraping de 30 canciones (2h)
2. Revisión y publicación (1h)
3. SEO básico (meta tags, sitemap) (1h)

**Tarde (3 horas)**:
1. Deploy backend a Railway (1h)
2. Deploy frontend a producción (30min)
3. Configurar dominio bstabs.com (30min)
4. Testing completo en producción (1h)

**Resultado Final**: bstabs.com en vivo con 35+ canciones

---

## 🔧 Configuración de Feature Flags

### Backend (`environment` files)

```typescript
// backend/src/config/app.config.ts
export const appConfig = {
  environment: process.env.NODE_ENV || 'development',
  api: {
    port: process.env.PORT || 3000,
    corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
  },
  features: {
    adminPanel: process.env.ENABLE_ADMIN === 'true',
    userAuth: process.env.ENABLE_AUTH === 'true',
    pdfGeneration: process.env.ENABLE_PDF === 'true',
  }
};
```

### Frontend (`environment` files)

```typescript
// frontend/src/environments/environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  features: {
    showAdmin: true,
    enableAuth: false,
    enablePdf: true,
  }
};

// frontend/src/environments/environment.preview.ts (pre-producción)
export const environment = {
  production: false,
  apiUrl: 'https://api-preview.railway.app',
  features: {
    showAdmin: true,  // ← Admin visible
    enableAuth: false,
    enablePdf: true,
  }
};

// frontend/src/environments/environment.prod.ts (producción)
export const environment = {
  production: true,
  apiUrl: 'https://api.bstabs.com',
  features: {
    showAdmin: false,  // ← Admin oculto
    enableAuth: false,
    enablePdf: true,
  }
};
```

### En el código

```typescript
// frontend/src/app/layout/header/header.ts
import { environment } from '../../../environments/environment';

export class Header {
  showAdminLink = environment.features.showAdmin;

  // Template solo muestra si showAdminLink === true
}
```

---

## 📋 Checklist de "Listo para Lanzar"

### Must Have (Crítico)
- [ ] Backend deployed y respondiendo
- [ ] Frontend en bstabs.com
- [ ] Mínimo 30 canciones publicadas
- [ ] Búsqueda funcionando
- [ ] PDFs descargables
- [ ] Mobile responsive
- [ ] Google Analytics activo
- [ ] Meta tags SEO
- [ ] Página de donaciones

### Nice to Have (Puede esperar)
- [ ] 100+ canciones
- [ ] Enlaces a Spotify/YouTube
- [ ] Preview de audio
- [ ] Autenticación de usuarios
- [ ] Sistema de favoritos

---

## 🎸 Resumen Ejecutivo

### Lo que harás AHORA:
1. **Feature flags** para separar admin (preview) de público (prod)
2. **Conectar lo existente** a APIs reales
3. **Base de datos** con contenido inicial
4. **Sistema de PDFs**
5. **30+ canciones** scraped y publicadas
6. **Deploy a producción**

### Lo que dejarás para DESPUÉS:
- Autenticación completa (solo admin con API key por ahora)
- Preview de audio
- Sistema social (comentarios, likes, etc.)
- Features avanzadas (transposición, scroll auto, etc.)

### Timeline:
- **Ahora → 2 días**: MVP funcionando en producción
- **2 días → 1 mes**: Crecimiento de contenido (500 tabs)
- **1-3 meses**: Features de comunidad
- **3-6 meses**: Monetización si hay tracción

---

**¿Empezamos con los feature flags y conexiones a API?** Eso es lo más crítico para tener algo usable YA.
