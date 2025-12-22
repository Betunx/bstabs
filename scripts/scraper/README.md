# 🎸 Black Sheep Scraper - Guía de Uso

## 🚀 Flujo Completo: Scraping → Base de Datos

### Paso 1: Configurar PostgreSQL

#### Instalar PostgreSQL (Windows)

**Opción A: Instalador Oficial**
1. Descarga: https://www.postgresql.org/download/windows/
2. Instala (usuario: `postgres`, password: elige una)
3. Instala pgAdmin (viene incluido)

**Opción B: Docker**
```bash
docker run --name blacksheep-db \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=blacksheep \
  -p 5432:5432 \
  -d postgres:15
```

#### Crear Base de Datos

Opción 1 - pgAdmin:
1. Abre pgAdmin
2. Right click "Databases" → Create → Database
3. Nombre: `blacksheep`

Opción 2 - Línea de comandos:
```bash
psql -U postgres
CREATE DATABASE blacksheep;
\q
```

---

### Paso 2: Inicializar Esquema

Ejecuta el backend una vez para crear las tablas:

```bash
cd ../../backend/black-sheep-api

# Configura .env
echo "DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=admin123
DATABASE_NAME=blacksheep
ADMIN_API_KEY=mi-clave-secreta-123" > .env

# Ejecuta (creará las tablas automáticamente)
npm run start:dev
```

Verás en la consola:
```
[TypeORM] Query: CREATE TABLE "songs" (...)
[Nest] Application successfully started
```

**¡Detén el backend (Ctrl+C) después de ver esto!**

---

### Paso 3: Scraping de Canciones

#### Preparar URLs

Crea un archivo con las URLs:

```bash
# En scripts/scraper/
nano mis-urls.txt
```

Contenido de ejemplo:
```txt
# Corridos tumbados
https://acordesweb.com/descarga-pdf/natanael-cano/viejo-lobo-ft-luis-r-conriquez/0/0/0.pdf
https://acordesweb.com/descarga-pdf/natanael-cano/amor-tumbado/0/0/0.pdf
https://acordesweb.com/descarga-pdf/peso-pluma/ella-baila-sola/0/0/0.pdf

# Clásicos
https://acordesweb.com/descarga-pdf/los-bunkers/llueve-sobre-la-ciudad/0/0/0.pdf
```

#### Ejecutar Scraper

```bash
cd scripts/scraper
node tab-scraper-v2.js --batch mis-urls.txt
```

Output:
```
📋 Procesando 4 URLs...

🎵 Procesando: https://acordesweb.com/.../viejo-lobo.pdf
   Tipo detectado: PDF
📄 PDF parseado correctamente
✅ Guardado: extracted-tabs/viejo-lobo-1234567.json
📊 Acordes: Am, G, F, C, Dm, E7...

...

✅ Éxitosos: 4/4
```

Ahora tienes JSONs en `extracted-tabs/`

---

### Paso 4: Importar a Base de Datos

#### Configurar credenciales

Opción 1 - Variables de entorno:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=admin123
export DB_NAME=blacksheep
```

Opción 2 - Editar el script (línea 296):
```javascript
const config = {
  host: 'localhost',
  port: 5432,
  database: 'blacksheep',
  user: 'postgres',
  password: 'TU_PASSWORD_AQUI',
};
```

#### Ejecutar importación

```bash
node import-direct-db.js
```

Output esperado:
```
✅ Conectado a PostgreSQL

📦 Importando 4 canciones...

📤 Importando: Viejo Lobo
✅ Importado: Viejo Lobo (ID: a3f2...)

📤 Importando: Amor Tumbado
✅ Importado: Amor Tumbado (ID: b7d1...)

...

📊 Resumen:
   Total archivos: 4
   Importados: 4
   Fallidos: 0

📊 Estado de la base de datos:
   Total canciones: 4
   Pending: 4
   Published: 0
   Draft: 0

✅ Desconectado de PostgreSQL
```

---

### Paso 5: Revisar en Admin Dashboard

1. Inicia el backend:
   ```bash
   cd ../../backend/black-sheep-api
   npm run start:dev
   ```

2. Inicia el frontend:
   ```bash
   cd ../../frontend/black-sheep-app
   npm start
   ```

3. Abre el navegador:
   ```
   http://localhost:4200/admin
   ```

4. Verás las 4 canciones en estado "Pending"

5. Haz clic en una para editarla:
   - Corrige errores si hay
   - Verifica acordes y letra
   - Cambia status a "Published"

---

## 🔄 Flujo Completo Resumido

```
1. Recolectar URLs → mis-urls.txt

2. Scrapear:
   node tab-scraper-v2.js --batch mis-urls.txt

3. Importar a BD:
   node import-direct-db.js

4. Revisar en admin:
   http://localhost:4200/admin

5. Publicar cuando estén listas
```

---

## 📊 Comandos Útiles

### Ver canciones en PostgreSQL

```bash
# Conectar
psql -U postgres -d blacksheep

# Ver todas las canciones
SELECT id, title, artist, status FROM songs;

# Ver solo pendientes
SELECT title, artist FROM songs WHERE status = 'pending';

# Contar por estado
SELECT status, COUNT(*) FROM songs GROUP BY status;

# Salir
\q
```

### Ver contenido completo de una canción

```sql
SELECT * FROM songs WHERE title LIKE '%Viejo Lobo%';
```

### Cambiar status manualmente

```sql
UPDATE songs SET status = 'published' WHERE title = 'Viejo Lobo';
```

### Eliminar una canción

```sql
DELETE FROM songs WHERE title = 'Nombre de la canción';
```

### Eliminar TODAS las canciones (¡cuidado!)

```sql
TRUNCATE TABLE songs;
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to PostgreSQL"

**Solución**:
1. Verifica que PostgreSQL está corriendo:
   ```bash
   # Windows
   services.msc
   # Busca "postgresql" y verifica que está "Running"
   ```

2. Verifica credenciales en `import-direct-db.js`

3. Intenta conectar manualmente:
   ```bash
   psql -U postgres
   ```

### Error: "Table 'songs' does not exist"

**Solución**:
Ejecuta el backend primero para crear las tablas:
```bash
cd ../../backend/black-sheep-api
npm run start:dev
# Espera a que arranque
# Ctrl+C para detener
```

### Error: "No hay archivos JSON para importar"

**Solución**:
Primero ejecuta el scraper:
```bash
node tab-scraper-v2.js --batch mis-urls.txt
```

### Las canciones se importan pero no se ven en el admin

**Solución**:
1. Verifica que el backend esté corriendo
2. Verifica la conexión a BD en el backend `.env`
3. Revisa la consola del backend por errores

---

## 💡 Tips

### 1. Importa en batches pequeños
- 10-20 canciones a la vez
- Revisa los resultados
- Ajusta si es necesario

### 2. Backup antes de importar masivo
```bash
pg_dump -U postgres blacksheep > backup.sql
```

Restaurar:
```bash
psql -U postgres blacksheep < backup.sql
```

### 3. Limpia archivos procesados
```bash
# Después de importar exitosamente
rm extracted-tabs/*.json
```

### 4. Mantén un log de URLs procesadas
```bash
# Crea un archivo de registro
echo "$(date): Procesadas 20 URLs" >> scraping-log.txt
```

---

## 🎯 Siguientes Pasos

Una vez que tengas canciones en la BD:

1. **Revisar** desde admin dashboard
2. **Editar** detalles (tempo, dificultad, etc.)
3. **Publicar** las que estén listas
4. **Probar** en el frontend público

Ver [PLAN_ESTRATEGICO.md](../../PLAN_ESTRATEGICO.md) para el roadmap completo.

---

## 📚 Documentación Relacionada

- [SCRAPING-GUIDE.md](../../docs/SCRAPING-GUIDE.md) - Guía detallada de scraping
- [REFERENCE.md](../../docs/REFERENCE.md) - Formato de datos y API
- [TAREAS_PENDIENTES.md](../../TAREAS_PENDIENTES.md) - Próximos pasos

---

**¡Happy Scraping! 🎸**
