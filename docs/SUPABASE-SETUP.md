# 🗄️ Supabase Setup - Black Sheep Tabs

## ¿Qué es Supabase?

**Supabase** = PostgreSQL + Herramientas extra (gratis)

### Incluye:
- ✅ **PostgreSQL** hospedado (500MB gratis)
- ✅ **Backups automáticos**
- ✅ **Dashboard web** (como phpMyAdmin pero mejor)
- ✅ **API REST auto-generada**
- ✅ **Realtime** (WebSockets)
- ✅ **Auth** (si quieres usuarios después)
- ✅ **Storage** (para archivos)

### Plan Free:
- 500MB de base de datos (≈ 50,000 canciones)
- 1GB de transferencia mensual
- Sin tarjeta de crédito requerida
- Sin límite de tiempo

---

## 🚀 Configuración Paso a Paso

### 1. Crear Proyecto en Supabase

**A) Ir a Supabase**
```
https://supabase.com/dashboard
```

**B) Sign up / Login**
- Con GitHub (recomendado)
- O con email

**C) Create new project**
```
Organization: Elige o crea una
Project name: black-sheep-tabs
Database Password: [Genera una fuerte y GUÁRDALA]
Region: West US (us-west-1)
Pricing plan: Free
```

**D) Espera 2-3 minutos** ⏳

### 2. Obtener Credenciales de Conexión

Una vez creado:

**A) Ve a Settings (⚙️ sidebar izquierdo)**

**B) Click en "Database"**

**C) Scroll down a "Connection string"**

**D) Selecciona tab "URI"**

Verás algo como:
```
postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

**E) Copia los valores**:
- **Host**: `aws-0-us-west-1.pooler.supabase.com`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres.abcdefghijk`
- **Password**: La que generaste en paso 1C

---

### 3. Configurar Backend

**A) Crea archivo .env**
```bash
cd backend/black-sheep-api
cp .env.example .env
```

**B) Edita .env con tus credenciales**
```env
# Database (Supabase)
DB_HOST=aws-0-us-west-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USERNAME=postgres.abcdefghijk
DB_PASSWORD=tu-password-aqui
DB_SSL=true

# Security
ADMIN_API_KEY=genera-clave-segura-12345

# CORS
ALLOWED_ORIGINS=http://localhost:4200,https://tu-dominio.com
```

**C) Genera API Key segura**
```bash
# En Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# O simplemente usa una contraseña fuerte
# Ejemplo: BsT@bs_4dm1n_k3y_2025_s3cr3t!
```

---

### 4. Instalar Dependencias (si hace falta)

```bash
cd backend/black-sheep-api
npm install
```

Ya deberías tener:
- `typeorm`
- `@nestjs/typeorm`
- `pg`

---

### 5. Inicializar Esquema (Crear Tablas)

**A) Ejecuta el backend**
```bash
npm run start:dev
```

**B) Verifica en la consola**
Deberías ver:
```
[TypeORM] connection "default" to database "postgres" established
[TypeORM] query: CREATE TABLE "songs" (...)
[Nest] NestApplication successfully started
```

**C) Verifica en Supabase Dashboard**
1. Ve a "Table Editor" en Supabase
2. Deberías ver la tabla `songs`
3. Click en ella para ver la estructura

**D) Detén el backend (Ctrl+C)**

---

### 6. Verificar Conexión

**A) En Supabase Dashboard**

Ve a SQL Editor y ejecuta:
```sql
SELECT * FROM songs;
```

Debería devolver 0 rows (tabla vacía pero existente).

**B) Con psql (opcional)**
```bash
psql "postgresql://postgres.xxx:PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

\dt
# Debería mostrar tabla "songs"

\d songs
# Muestra estructura de la tabla

\q
```

---

### 7. Configurar Scraper para Supabase

**A) Edita import-direct-db.js (línea 296)**

```javascript
const config = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.abcdefghijk',
  password: 'tu-password-aqui',
  ssl: { rejectUnauthorized: false } // ← IMPORTANTE para Supabase
};
```

**B) O usa variables de entorno**
```bash
export DB_HOST=aws-0-us-west-1.pooler.supabase.com
export DB_PORT=5432
export DB_NAME=postgres
export DB_USER=postgres.abcdefghijk
export DB_PASSWORD=tu-password
```

---

### 8. Probar Importación

```bash
cd scripts/scraper

# Scraper una canción
node tab-scraper-v2.js "https://acordesweb.com/descarga-pdf/natanael-cano/viejo-lobo-ft-luis-r-conriquez/0/0/0.pdf"

# Importar a Supabase
node import-direct-db.js
```

Deberías ver:
```
✅ Conectado a PostgreSQL
📤 Importando: Viejo Lobo
✅ Importado: Viejo Lobo (ID: ...)
```

**Verifica en Supabase**:
1. Ve a Table Editor
2. Click en tabla `songs`
3. Deberías ver 1 row con "Viejo Lobo"

---

## 🔧 Configuración Avanzada

### Habilitar Row Level Security (RLS)

Por defecto, Supabase habilita RLS. Para desarrollo, puedes deshabilitarlo:

**SQL Editor**:
```sql
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
```

O crear políticas:
```sql
-- Permitir lectura a todos
CREATE POLICY "Allow public read access"
ON songs FOR SELECT
USING (status = 'published');

-- Permitir escritura solo con API key (implementar después)
CREATE POLICY "Allow authenticated write access"
ON songs FOR ALL
USING (auth.role() = 'authenticated');
```

### Configurar Backups

Supabase hace backups automáticos diarios (Free plan).

Para manual backup:
```bash
pg_dump "postgresql://postgres.xxx:PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres" > backup.sql
```

Restaurar:
```bash
psql "postgresql://..." < backup.sql
```

### Monitorear Uso

1. Ve a "Settings" → "Usage"
2. Verás:
   - Database size (de 500MB)
   - Bandwidth (de 1GB/mes)
   - Active connections

---

## 📊 Dashboard de Supabase

### Table Editor
- Ver/editar datos como Excel
- Agregar/eliminar rows
- Modificar estructura de tabla

### SQL Editor
- Ejecutar queries directamente
- Guardar queries favoritos
- Ver historial

### Database
- Ver esquema completo
- Backups
- Extensions (PostGIS, etc.)

### API
- Auto-genera API REST
- Documentación interactiva
- API keys

---

## 🔐 Seguridad

### Variables de Entorno

**NUNCA** hagas commit de `.env`:

```bash
# Verifica que está en .gitignore
cat backend/black-sheep-api/.gitignore | grep .env
```

Debería mostrar:
```
.env
.env.local
.env.*.local
```

### Rotar Password

Si expones tu password accidentalmente:

1. Ve a Supabase → Settings → Database
2. Click "Reset database password"
3. Actualiza tu `.env`

### API Keys de Supabase

Supabase genera 2 keys:
- **anon** (pública): Para frontend
- **service_role** (privada): Para backend

**Para este proyecto NO las necesitas** porque usamos conexión directa PostgreSQL.

---

## 🆚 Supabase vs PostgreSQL Local

| Feature | Supabase Free | PostgreSQL Local |
|---------|---------------|------------------|
| Costo | $0/mes | $0 (tu computadora) |
| Setup | 2 minutos | 20 minutos |
| Backups | Automáticos | Manuales |
| Acceso remoto | ✅ Sí | ❌ Difícil |
| Dashboard | ✅ Sí | pgAdmin local |
| Para desarrollo | ✅ Perfecto | ✅ Perfecto |
| Para producción | ✅ Perfecto | ❌ No recomendado |
| Límite | 500MB | Ilimitado |

**Recomendación**:
- **Desarrollo**: Supabase (más fácil)
- **Producción**: Supabase Free (hasta crecer)
- **Futuro**: Supabase Pro ($25/mes) cuando tengas tráfico

---

## 🚀 Próximos Pasos

1. ✅ Supabase configurado
2. ✅ Tablas creadas
3. ⏭️ Importar canciones con scraper
4. ⏭️ Probar admin dashboard
5. ⏭️ Deploy del backend a Railway/Render
6. ⏭️ Deploy del frontend a Vercel
7. ⏭️ Configurar dominio bstabs.com

---

## 🐛 Troubleshooting

### Error: "Connection terminated unexpectedly"

**Causa**: Probablemente `DB_SSL=false` cuando debería ser `true`

**Solución**:
```env
DB_SSL=true
```

O en el código:
```javascript
ssl: { rejectUnauthorized: false }
```

### Error: "password authentication failed"

**Causa**: Password incorrecta

**Solución**:
1. Ve a Supabase → Settings → Database
2. Verifica el connection string
3. Actualiza `.env`

### Error: "too many connections"

**Causa**: Free plan tiene límite de conexiones

**Solución**:
1. Cierra backends/scripts que no uses
2. Usa connection pooling (ya configurado en TypeORM)

### Base de datos se llenó (500MB)

**Causa**: Demasiadas canciones o datos grandes

**Solución**:
1. Limpia datos de prueba:
   ```sql
   DELETE FROM songs WHERE status = 'draft';
   ```
2. O upgrade a Supabase Pro ($25/mes = 8GB)

---

## 📚 Recursos

- **Dashboard**: https://app.supabase.com
- **Docs**: https://supabase.com/docs
- **Status**: https://status.supabase.com
- **Community**: https://github.com/supabase/supabase/discussions

---

**¡Listo para rockear con Supabase! 🎸**
