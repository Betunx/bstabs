# 🎸 Estrategia de Scraping para Black Sheep Tabs

## 📋 Resumen Ejecutivo

Sistema completo de 3 capas para poblar la base de datos con miles de tablatures de forma eficiente y organizada.

### Capas del Sistema

```
1. CATALOG SCRAPER → Extrae listados masivos de URLs
2. SPOTIFY INTEGRATION → Usa tus playlists como fuente
3. QUEUE PROCESSOR → Procesa tabs en paralelo con reintentos
```

---

## 🎯 Flujo de Trabajo Recomendado

### Opción A: Scraping Masivo por Sitio

**Mejor para:** Poblar DB inicial con miles de tabs

```bash
# 1. Extrae catálogo completo de CifraClub (artistas A-Z)
node catalog-scraper.js cifraclub-artists

# 2. Extrae canciones de artistas populares
node catalog-scraper.js cifraclub-songs oasis,the-beatles,led-zeppelin,pink-floyd

# 3. Procesa las URLs extraídas (paralelo, con reintentos)
node queue-processor.js process catalog-output/cifraclub-urls.txt --concurrency 5

# 4. Importa a Supabase
# Se genera: queue-results/database-import.json
```

**Output esperado:**
- 1000+ tabs en pocas horas
- Organizados por artista
- Listos para importar a DB

---

### Opción B: Scraping Basado en Spotify

**Mejor para:** Tabs curados según tus gustos musicales

```bash
# 1. Configura credenciales de Spotify
set SPOTIFY_CLIENT_ID=tu_client_id
set SPOTIFY_CLIENT_SECRET=tu_client_secret

# 2. Extrae tracks de tus playlists
node spotify-integration.js PLAYLIST_ID1,PLAYLIST_ID2,PLAYLIST_ID3

# 3. Procesa los tabs encontrados
node queue-processor.js process spotify-output/spotify-cifraclub-urls.txt

# 4. Importa a Supabase
```

**Output esperado:**
- Tabs específicos de tus canciones favoritas
- Mayor calidad/relevancia
- Menos volumen pero más curado

---

### Opción C: Híbrido (RECOMENDADO)

**Mejor para:** Balance entre volumen y calidad

```bash
# 1. Base amplia de CifraClub (artistas populares)
node catalog-scraper.js cifraclub-songs oasis,the-beatles,queen,acdc,nirvana

# 2. Complementa con tus playlists de Spotify
node spotify-integration.js TUS_PLAYLIST_IDS

# 3. Combina ambas listas
cat catalog-output/cifraclub-urls.txt spotify-output/spotify-cifraclub-urls.txt > combined-urls.txt

# 4. Procesa todo junto (elimina duplicados automáticamente)
node queue-processor.js process combined-urls.txt --concurrency 3
```

---

## 🔧 Herramientas Detalladas

### 1️⃣ Catalog Scraper

**Propósito:** Extrae listados de canciones desde sitios de tabs

**Fuentes soportadas:**
- ✅ CifraClub (Brasil) - Mayor catálogo
- ✅ AcordesWeb (México/LATAM) - Buena calidad
- 🔜 Ultimate Guitar (próximamente)

**Comandos:**

```bash
# Listar todos los artistas (A-Z)
node catalog-scraper.js cifraclub-artists

# Extraer canciones de artistas específicos
node catalog-scraper.js cifraclub-songs oasis,the-beatles

# Extraer de AcordesWeb (por páginas)
node catalog-scraper.js acordesweb 50
```

**Output:**
```
catalog-output/
├── cifraclub-artists.json    # Lista de artistas
├── cifraclub-songs.json      # Lista de canciones con metadata
└── cifraclub-urls.txt        # URLs listas para scraping
```

---

### 2️⃣ Spotify Integration

**Propósito:** Convierte tus playlists de Spotify en tabs

**Setup inicial:**

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una App → Obtén Client ID y Secret
3. Exporta variables de entorno:

```bash
# Windows CMD
set SPOTIFY_CLIENT_ID=abc123
set SPOTIFY_CLIENT_SECRET=xyz789

# Windows PowerShell
$env:SPOTIFY_CLIENT_ID="abc123"
$env:SPOTIFY_CLIENT_SECRET="xyz789"
```

**Comandos:**

```bash
# Extraer 1 playlist
node spotify-integration.js 37i9dQZF1DXcBWIGoYBM5M

# Extraer múltiples playlists
node spotify-integration.js PLAYLIST_ID1,PLAYLIST_ID2,PLAYLIST_ID3
```

**Cómo obtener Playlist ID:**
```
URL de Spotify:
https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
                                  ^^^^^^^^^^^^^^^^^^^^^^
                                  Este es el ID
```

**Output:**
```
spotify-output/
├── spotify-tracks.json              # Tracks originales de Spotify
├── spotify-cifraclub.json           # URLs + metadata de CifraClub
├── spotify-cifraclub-urls.txt       # URLs para scraping
├── spotify-acordesweb.json          # URLs + metadata de AcordesWeb
└── spotify-acordesweb-urls.txt      # URLs para scraping
```

---

### 3️⃣ Queue Processor

**Propósito:** Procesa miles de tabs de forma eficiente

**Features:**
- ✅ Procesamiento paralelo (configurable 1-10 workers)
- ✅ Reintentos automáticos
- ✅ Rate limiting (evita bloqueos)
- ✅ Guarda progreso (reanudar después)
- ✅ Priorización por fuente
- ✅ Exporta directo para Supabase

**Comandos:**

```bash
# Procesamiento básico
node queue-processor.js process urls.txt

# Con concurrencia personalizada
node queue-processor.js process urls.txt --concurrency 5

# Con rate limiting más lento (sitios estrictos)
node queue-processor.js process urls.txt --rate-limit 5000

# Reanudar procesamiento interrumpido
node queue-processor.js resume
```

**Output:**
```
queue-results/
├── completed-2024-01-15.json      # Tabs exitosos
├── failed-2024-01-15.json         # URLs que fallaron
├── retry-2024-01-15.txt           # URLs para reintentar
└── database-import.json           # 🔥 LISTO PARA SUPABASE
```

---

## 📊 Estimaciones de Rendimiento

### Scraping Individual (tab-scraper-v2.js)
- **Velocidad:** ~1 tab cada 3-5 segundos
- **Capacidad:** 12-20 tabs/minuto
- **Ideal para:** Tests, tabs únicos

### Queue Processor (Concurrencia = 3)
- **Velocidad:** ~3 tabs cada 3 segundos
- **Capacidad:** 40-60 tabs/minuto
- **Ideal para:** Lotes de 100-500 tabs

### Queue Processor (Concurrencia = 5)
- **Velocidad:** ~5 tabs cada 3 segundos
- **Capacidad:** 60-100 tabs/minuto
- **Ideal para:** Lotes de 1000+ tabs
- **⚠️ Riesgo:** Posible bloqueo temporal

---

## 🎯 Estrategia Óptima Paso a Paso

### Semana 1: Base Sólida (500-1000 tabs)

```bash
# Día 1-2: Artistas icónicos (rock clásico)
node catalog-scraper.js cifraclub-songs the-beatles,led-zeppelin,pink-floyd,queen,acdc,nirvana,metallica
node queue-processor.js process catalog-output/cifraclub-urls.txt --concurrency 3

# Día 3-4: Tus playlists de Spotify
node spotify-integration.js TUS_PLAYLIST_IDS
node queue-processor.js process spotify-output/spotify-cifraclub-urls.txt

# Día 5: Importar a Supabase y validar
# Usa: queue-results/database-import.json
```

### Semana 2: Expansión (1000-3000 tabs)

```bash
# Pop/Rock en español
node catalog-scraper.js cifraclub-songs mana,soda-stereo,heroes-del-silencio,caifanes

# Rock alternativo/indie
node catalog-scraper.js cifraclub-songs radiohead,arctic-monkeys,the-strokes,muse

# Procesa todo
node queue-processor.js process catalog-output/cifraclub-urls.txt --concurrency 5
```

### Semana 3+: Catálogo Completo (5000+ tabs)

```bash
# Scraping masivo de AcordesWeb
node catalog-scraper.js acordesweb 100

# Procesa con máxima concurrencia
node queue-processor.js process catalog-output/acordesweb-urls.txt --concurrency 5 --rate-limit 2000
```

---

## 🔄 Importación a Supabase

### Opción 1: SQL Direct Import

```sql
-- Ejemplo de importación desde JSON
INSERT INTO songs (title, artist, key, difficulty, source_url, chords, sections, status)
SELECT
  title,
  artist,
  key,
  difficulty,
  source_url,
  chords,
  sections,
  'pending_review'
FROM json_populate_recordset(null::songs, '[...]');
```

### Opción 2: Script de Importación (RECOMENDADO)

Crear script `import-to-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const data = JSON.parse(fs.readFileSync('queue-results/database-import.json'));

async function importBatch(batch) {
  const { data, error } = await supabase
    .from('songs')
    .insert(batch);

  if (error) console.error(error);
  else console.log(`✅ Importados ${batch.length} tabs`);
}

// Procesa en lotes de 100
for (let i = 0; i < data.length; i += 100) {
  await importBatch(data.slice(i, i + 100));
  await new Promise(r => setTimeout(r, 1000));
}
```

---

## 🚨 Troubleshooting

### Error: "Request blocked" / 429 Too Many Requests

**Solución:**
```bash
# Reduce concurrencia
node queue-processor.js process urls.txt --concurrency 1 --rate-limit 5000

# O pausa y reintenta después
node queue-processor.js resume
```

### Error: "Cannot parse PDF"

**Solución:**
```bash
# Instala pdf-parse
npm install pdf-parse

# Verifica que sea un PDF válido
file url-del-pdf.pdf
```

### Error: "Spotify authentication failed"

**Solución:**
```bash
# Verifica credenciales
echo $SPOTIFY_CLIENT_ID
echo $SPOTIFY_CLIENT_SECRET

# Re-exporta variables
set SPOTIFY_CLIENT_ID=...
set SPOTIFY_CLIENT_SECRET=...
```

---

## 📈 Métricas de Éxito

### KPIs a monitorear:

1. **Tasa de éxito:** >85% de tabs procesados correctamente
2. **Velocidad:** 40-60 tabs/minuto con concurrencia=3
3. **Calidad:** <10% de tabs sin acordes detectados
4. **Cobertura:** Al menos 1 tab por cada track en top playlists

### Dashboard sugerido:

```
Total tabs en DB:        5,234
Artistas únicos:          432
Tabs pending review:      156
Tabs publicados:        5,078

Top fuentes:
  CifraClub:    3,821 (73%)
  AcordesWeb:   1,413 (27%)
```

---

## 🎯 Próximos Pasos

1. **Implementar UI de revisión:** Panel admin para validar tabs antes de publicar
2. **Scraping incremental:** Actualizar catálogo semanalmente
3. **User requests:** Sistema para que usuarios pidan tabs específicos
4. **Quality scoring:** ML para detectar tabs de baja calidad automáticamente

---

## 📚 Referencias

- [Tab Scraper V2](./tab-scraper-v2.js) - Scraper individual
- [Catalog Scraper](./catalog-scraper.js) - Extractor de listados
- [Spotify Integration](./spotify-integration.js) - Integración con Spotify
- [Queue Processor](./queue-processor.js) - Procesamiento masivo
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

---

## 💡 Tips Finales

1. **Empieza pequeño:** Prueba con 10-20 tabs antes de lotes grandes
2. **Valida output:** Revisa `extracted-tabs/` después de cada batch
3. **Monitorea rate limits:** Si te bloquean, espera 1 hora y reduce concurrencia
4. **Backup frecuente:** `queue-processor` guarda estado cada 10 tabs
5. **Diversifica fuentes:** Combina CifraClub + AcordesWeb + Spotify para mejor cobertura

**¡Éxito con el scraping! 🎸🔥**
