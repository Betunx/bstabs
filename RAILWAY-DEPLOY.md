# Railway Deploy - Paso a Paso

## ✅ PRE-REQUISITOS

Antes de empezar, asegúrate de tener:
- [x] Código en GitHub (ya tienes: `Betunx/bstabs`)
- [x] Backend funcionando localmente (ya tienes NestJS)
- [x] Cuenta de email (para Railway)

---

## 🚀 PASO 1: CREAR CUENTA EN RAILWAY (2 min)

1. Ve a: https://railway.app
2. Click **"Start a New Project"**
3. **Login con GitHub** (recomendado)
4. Autoriza Railway para acceder a tus repos

**¿Por qué login con GitHub?**
- Deploy automático cuando hagas `git push`
- No necesitas configurar webhooks manualmente
- Railway ve tus repos directamente

---

## 🏗️ PASO 2: CREAR PROYECTO (3 min)

### 2.1 Nuevo Proyecto

```
Dashboard → New Project → Deploy from GitHub repo
```

### 2.2 Seleccionar Repositorio

```
Buscar: bstabs
Seleccionar: Betunx/bstabs
```

### 2.3 Configurar Root Directory

**MUY IMPORTANTE:** Tu backend NO está en la raíz.

```
Settings → Root Directory → backend/black-sheep-api
```

Sin esto, Railway intentará hacer build de todo el monorepo.

### 2.4 Configurar Build Command

Railway auto-detecta NestJS, pero verifica:

```
Settings → Build Command:
npm install && npm run build

Settings → Start Command:
npm run start:prod
```

---

## 🗄️ PASO 3: AGREGAR POSTGRESQL (2 min)

### 3.1 Agregar Database

```
En tu proyecto → New → Database → PostgreSQL
```

Railway crea la base de datos automáticamente.

### 3.2 Variables Automáticas

Railway crea estas variables **automáticamente**:

```
DATABASE_URL=postgresql://user:pass@host:5432/railway
PGHOST=...
PGPORT=5432
PGUSER=postgres
PGPASSWORD=...
PGDATABASE=railway
```

**No necesitas copiarlas manualmente.** Railway las inyecta.

---

## 🔐 PASO 4: CONFIGURAR VARIABLES DE ENTORNO (5 min)

### 4.1 Ir a Variables

```
Tu proyecto backend → Variables → Add Variables
```

### 4.2 Agregar Variables Requeridas

```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://bstabs.com
DB_SSL=true
```

### 4.3 Variables de Database (Opcionales)

Railway usa `DATABASE_URL` por defecto, pero si tu código usa variables individuales:

```
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_USERNAME=${PGUSER}
DB_PASSWORD=${PGPASSWORD}
DB_NAME=${PGDATABASE}
```

**Nota:** `${PGHOST}` son **references** a otras variables que Railway ya creó.

### 4.4 Actualizar database.config.ts

Tu archivo actual:

```typescript
export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'blacksheep',
  // ...
});
```

**Opción A:** Mantener como está (usa variables individuales)

**Opción B:** Usar `DATABASE_URL` (más simple):

```typescript
export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
```

---

## 🎨 PASO 5: VERIFICAR BUILD (AUTOMÁTICO)

Después de agregar el proyecto, Railway automáticamente:

```
1. Clona tu repo
2. cd backend/black-sheep-api
3. npm install
4. npm run build
5. npm run start:prod
```

### Ver logs en tiempo real:

```
Dashboard → Deployments → Latest → View Logs
```

Deberías ver:

```
[INFO] Installing dependencies...
[INFO] Building application...
[INFO] Starting server...
🚀 Application is running on: http://...
```

---

## 🌐 PASO 6: OBTENER URL PÚBLICA (1 min)

### 6.1 Railway te asigna un dominio automático:

```
Settings → Networking → Generate Domain
```

Ejemplo: `bstabs-api-production.up.railway.app`

### 6.2 Probar tu API:

```bash
curl https://bstabs-api-production.up.railway.app/api/songs
```

Deberías ver: `[]` (array vacío porque no hay tabs aún)

---

## 🔗 PASO 7: CONECTAR FRONTEND CON BACKEND (3 min)

### 7.1 En Vercel

```
Tu proyecto → Settings → Environment Variables
```

### 7.2 Agregar API URL

```
Name:  VITE_API_URL
Value: https://bstabs-api-production.up.railway.app/api
```

### 7.3 Crear archivo environment en Angular

```typescript
// frontend/black-sheep-app/src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://bstabs-api-production.up.railway.app/api'
};
```

### 7.4 Usar en servicios

```typescript
import { environment } from '../../environments/environment';

@Injectable()
export class SongsService {
  private apiUrl = environment.apiUrl;

  getSongs() {
    return this.http.get(`${this.apiUrl}/songs`);
  }
}
```

### 7.5 Redeploy Frontend

```bash
git add .
git commit -m "Connect frontend to Railway backend"
git push origin main
```

Vercel auto-deploys con la nueva variable.

---

## 🧪 PASO 8: TESTING (5 min)

### 8.1 Test Health

```bash
curl https://bstabs-api-production.up.railway.app
```

Debería responder con la página de bienvenida de NestJS.

### 8.2 Test API Endpoints

```bash
# Get all songs
curl https://bstabs-api-production.up.railway.app/api/songs

# Get songs with status filter
curl https://bstabs-api-production.up.railway.app/api/songs?status=pending
```

### 8.3 Test Database Connection

Desde los logs de Railway, deberías ver:

```
[TypeORM] Connection to database established
```

### 8.4 Importar Primera Tab

```bash
cd scripts/scraper

# Importar a Railway
node import-to-db.js https://bstabs-api-production.up.railway.app

# Verificar
curl https://bstabs-api-production.up.railway.app/api/songs
```

Deberías ver tu tab de Natanael Cano.

---

## 🔄 PASO 9: DEPLOY AUTOMÁTICO (Ya configurado)

### Workflow:

```
1. Haces cambios en código
2. git add .
3. git commit -m "mensaje"
4. git push origin main

→ Railway detecta push
→ Hace build automático
→ Deploy nueva versión
→ ¡Listo! Sin hacer nada más
```

### Ver deployments:

```
Dashboard → Deployments
```

Verás historial de todos los deploys.

---

## 📊 PASO 10: MONITOREO (Opcional)

### 10.1 Ver Logs en Tiempo Real

```
Dashboard → Deployments → View Logs
```

Útil para debuggear errores.

### 10.2 Métricas

```
Dashboard → Metrics
```

Verás:
- CPU usage
- Memory usage
- Network traffic

### 10.3 Database Metrics

```
PostgreSQL service → Metrics
```

Verás:
- Queries/second
- Storage used
- Connections

---

## 🐛 TROUBLESHOOTING

### Error: "Build failed"

**Causa:** Falta dependencia o error en código

**Solución:**
```
1. Ver logs: Dashboard → Deployments → Latest → Logs
2. Buscar línea roja con error
3. Arreglar código
4. git push
```

### Error: "Database connection failed"

**Causa:** Variables de entorno mal configuradas

**Solución:**
```
1. Variables → Verificar DATABASE_URL existe
2. Verificar DB_SSL=true
3. Restart service
```

### Error: "Application crashed"

**Causa:** Error en runtime (código)

**Solución:**
```
1. Ver logs para stack trace
2. Arreglar bug
3. git push
```

### Error: "Port already in use"

**Causa:** Hardcodeaste puerto 3000

**Solución:**
```typescript
// main.ts
const port = process.env.PORT || 3000;
await app.listen(port);
```

Railway asigna puerto dinámico.

---

## 💡 TIPS Y BEST PRACTICES

### 1. Usar Railway CLI (Opcional)

```bash
# Instalar
npm install -g @railway/cli

# Login
railway login

# Ver logs localmente
railway logs

# Ver variables
railway variables
```

### 2. Branches para Staging

```
main branch  → Production
dev branch   → Staging environment
```

Railway puede auto-deploy ambos.

### 3. Database Backups

Railway hace backups automáticos, pero puedes hacer manual:

```bash
# Desde Railway dashboard
PostgreSQL → Backups → Create Backup
```

### 4. Rollback si algo falla

```
Deployments → Historial → Click deployment antiguo → Redeploy
```

Vuelves a versión anterior instantáneamente.

### 5. Custom Domain (Opcional)

Puedes usar tu propio dominio:

```
Settings → Networking → Custom Domain
Agregar: api.bstabs.com

Luego en Cloudflare:
Type: CNAME
Name: api
Value: bstabs-api-production.up.railway.app
```

---

## 📋 CHECKLIST FINAL

Antes de terminar, verifica:

- [ ] Backend deployado en Railway
- [ ] PostgreSQL conectado
- [ ] Variables de entorno configuradas
- [ ] URL pública funcionando
- [ ] API responde correctamente
- [ ] Frontend conectado a backend
- [ ] Primera tab importada exitosamente
- [ ] Logs sin errores

---

## 🎉 ¡COMPLETADO!

Tu stack completo está en producción:

```
Frontend:  https://bstabs.com (Vercel)
Backend:   https://bstabs-api-production.up.railway.app (Railway)
Database:  PostgreSQL (Railway)
```

---

## 🔜 PRÓXIMOS PASOS

1. **Importar más tabs**
   ```bash
   cd scripts/scraper
   node tab-scraper.js --batch urls.txt
   node import-to-db.js https://bstabs-api-production.up.railway.app
   ```

2. **Conectar panel admin**
   - El panel admin (`/admin`) ya usa el API
   - Verás tabs pendientes
   - Podrás aprobar/publicar

3. **SEO**
   - Google Search Console
   - Sitemap.xml
   - Meta tags

4. **Analytics**
   - Google Analytics
   - Plausible
   - Mixpanel

---

**¿Listo para hacer el deploy? Vamos paso a paso.** 🚀
