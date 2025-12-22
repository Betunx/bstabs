# Black Sheep Tabs - Guía de Deploy

## Estado Actual

- ✅ Frontend: Configurado para Vercel
- ✅ Backend: API completa con TypeORM + PostgreSQL
- ✅ Scraper: Sistema de extracción de tabs
- ⏳ Deploy: En progreso

---

## 1. DEPLOY FRONTEND EN VERCEL

### Opción A: Desde GitHub (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Sign in con GitHub
3. Click "Add New Project"
4. Importa el repositorio: `Betunx/bstabs`
5. Vercel detectará automáticamente el `vercel.json`
6. Click "Deploy"

### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd C:\Users\Humbe\Documents\Chamba\blackSheep
vercel

# Deploy a producción
vercel --prod
```

**Tu sitio estará en:** `https://bstabs.vercel.app` (o similar)

---

## 2. CONECTAR DOMINIO bstabs.com

### Paso 1: Configurar en Vercel

1. En tu proyecto en Vercel
2. Settings → Domains
3. Add Domain: `bstabs.com`
4. Add Domain: `www.bstabs.com`

Vercel te mostrará qué registros DNS necesitas agregar.

### Paso 2: Configurar DNS en tu proveedor

**Necesitas agregar estos registros DNS:**

#### Si tu dominio está en GoDaddy:
1. Ve a GoDaddy → My Products → DNS
2. Agrega estos registros:

```
Tipo: A
Nombre: @
Valor: 76.76.21.21
TTL: 600

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 600
```

#### Si tu dominio está en Namecheap:
1. Ve a Domain List → Manage → Advanced DNS
2. Agrega los mismos registros de arriba

#### Si tu dominio está en Cloudflare:
1. Ve a DNS → Records
2. Agrega:

```
Tipo: A
Nombre: @
Contenido: 76.76.21.21
Proxy: Desactivado (nube gris)

Tipo: CNAME
Nombre: www
Contenido: cname.vercel-dns.com
Proxy: Desactivado
```

### Paso 3: Esperar propagación DNS

- **Mínimo:** 15 minutos
- **Máximo:** 48 horas (usualmente 2-4 horas)

Verificar propagación:
```bash
nslookup bstabs.com
```

---

## 3. DEPLOY BACKEND EN RAILWAY

### Por qué Railway:
- PostgreSQL gratis incluido
- Deploy automático desde GitHub
- $5/mes después de trial

### Pasos:

1. Ve a [railway.app](https://railway.app)
2. Sign in con GitHub
3. Click "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Selecciona: `Betunx/bstabs`
6. Railway detectará NestJS automáticamente

### Configurar variables de entorno:

En Railway → Variables:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://bstabs.com

# Railway proveerá DATABASE_URL automáticamente
DB_SSL=true
```

### Agregar PostgreSQL:

1. En tu proyecto Railway
2. Click "New" → "Database" → "PostgreSQL"
3. Railway conectará automáticamente

---

## 4. CONECTAR FRONTEND CON BACKEND

### En Vercel, agrega variables de entorno:

Settings → Environment Variables:

```
VITE_API_URL=https://tu-backend.railway.app/api
```

(O la variable que uses en Angular para el API endpoint)

---

## 5. CONFIGURAR BASE DE DATOS

### Opción A: Railway (Recomendado para producción)
- Ya incluido en el deploy de Railway
- Backups automáticos
- $5/mes después de trial

### Opción B: Supabase (Alternativa gratuita)
1. Ve a [supabase.com](https://supabase.com)
2. New Project
3. Copia la connection string
4. Agrégala como `DATABASE_URL` en Railway

### Opción C: Local (Solo desarrollo)
```bash
# Instalar PostgreSQL localmente
# Windows: https://www.postgresql.org/download/windows/

# Crear base de datos
psql -U postgres
CREATE DATABASE blacksheep;
```

---

## 6. INDEXACIÓN EN GOOGLE

### Inmediato (Hoy):

1. **Google Search Console**
   - Ve a: https://search.google.com/search-console
   - Add Property: `https://bstabs.com`
   - Verificar con HTML tag o DNS
   - Submit sitemap: `https://bstabs.com/sitemap.xml`

2. **Submit URL directamente**
   - URL Inspection → `https://bstabs.com`
   - Request Indexing

### Automático (2-4 semanas):
- Google crawleará tu sitio eventualmente
- Acelera con:
  - Crear sitemap.xml
  - robots.txt
  - Meta tags SEO
  - Backlinks (redes sociales)

---

## 7. WORKFLOW COMPLETO

### Para empezar a usar:

1. **Extraer tabs:**
   ```bash
   cd scripts/scraper
   # Edita urls.txt con las URLs
   node tab-scraper.js --batch urls.txt
   ```

2. **Importar a DB:**
   ```bash
   node import-to-db.js https://tu-backend.railway.app
   ```

3. **Aprobar/Publicar:**
   - Entra al panel admin (cuando esté listo)
   - Ver lista de tabs pendientes
   - Editar letra + acordes
   - Verificar con tu bajo
   - Click "Publicar"

---

## 8. PRÓXIMOS PASOS

- [ ] Panel admin para aprobar tabs
- [ ] Editor de tabs con posicionamiento de acordes
- [ ] Visualizador de acordes (guitarra/bajo/piano)
- [ ] Sitemap.xml automático
- [ ] Meta tags SEO
- [ ] Analytics (Google Analytics)

---

## RESUMEN DE URLs

- **Frontend (Vercel):** https://bstabs.vercel.app → https://bstabs.com
- **Backend (Railway):** https://[project].railway.app/api
- **GitHub:** https://github.com/Betunx/bstabs
- **Database:** PostgreSQL en Railway

---

## SOPORTE

- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- NestJS: https://docs.nestjs.com
- Angular: https://angular.io/docs
