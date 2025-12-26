# 🚀 Quick Start - Scraping en 5 Minutos

## Opción 1: Test Rápido (1 canción)

```bash
# Prueba el scraper con una canción individual
cd scripts/scraper
node tab-scraper-v2.js "https://www.cifraclub.com.br/oasis/wonderwall/"
```

**Output:** `extracted-tabs/wonderwall-[timestamp].json`

---

## Opción 2: Scraping desde tus Playlists de Spotify (RECOMENDADO para empezar)

### Paso 1: Setup de Spotify (5 minutos)

1. Ve a https://developer.spotify.com/dashboard
2. Click "Create app"
3. Copia tu **Client ID** y **Client Secret**

### Paso 2: Configura credenciales

```bash
# Windows CMD
set SPOTIFY_CLIENT_ID=tu_client_id_aqui
set SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui

# Windows PowerShell
$env:SPOTIFY_CLIENT_ID="tu_client_id_aqui"
$env:SPOTIFY_CLIENT_SECRET="tu_client_secret_aqui"
```

### Paso 3: Obtén ID de tu Playlist

1. Abre Spotify Web
2. Ve a tu playlist
3. Copia el ID desde la URL:
   ```
   https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
                                     ^^^^^^^^^^^^^^^^^^^^^^
   ```

### Paso 4: Extrae y procesa

```bash
# Extrae URLs de tabs basadas en tu playlist
node spotify-integration.js 37i9dQZF1DXcBWIGoYBM5M

# Procesa los primeros 10 tabs (prueba)
head -10 spotify-output/spotify-cifraclub-urls.txt > test-urls.txt
node queue-processor.js process test-urls.txt
```

**Output:**
- `queue-results/database-import.json` - Listo para Supabase

---

## Opción 3: Scraping Masivo de Artistas Populares

```bash
# Extrae canciones de artistas icónicos
node catalog-scraper.js cifraclub-songs oasis,the-beatles,nirvana

# Procesa las primeras 20 canciones (prueba)
head -20 catalog-output/cifraclub-urls.txt > test-batch.txt
node queue-processor.js process test-batch.txt --concurrency 2
```

---

## 🎯 Flujo Completo Recomendado

### Para empezar (100-200 tabs):

```bash
# 1. Tus playlists de Spotify
node spotify-integration.js PLAYLIST_ID1,PLAYLIST_ID2

# 2. Procesa todo
node queue-processor.js process spotify-output/spotify-cifraclub-urls.txt --concurrency 3

# 3. Importa a Supabase
# Usa: queue-results/database-import.json
```

### Para escalar (1000+ tabs):

```bash
# 1. Extrae catálogo de artistas populares
node catalog-scraper.js cifraclub-songs oasis,the-beatles,queen,nirvana,metallica,acdc

# 2. Procesa con máxima eficiencia
node queue-processor.js process catalog-output/cifraclub-urls.txt --concurrency 5 --rate-limit 2000

# 3. Revisa resultados
cat queue-results/completed-*.json | jq '.[] | .title'

# 4. Si hubo errores, reintenta
node queue-processor.js process queue-results/retry-*.txt
```

---

## 📊 Verifica tus resultados

```bash
# Ver cuántos tabs se procesaron exitosamente
jq 'length' queue-results/database-import.json

# Ver listado de títulos
jq '.[].title' queue-results/database-import.json

# Ver artistas únicos
jq '.[].artist' queue-results/database-import.json | sort | uniq

# Ver tabs con más de 10 acordes (complejos)
jq '.[] | select((.chords | length) > 10) | {title, artist, chords: (.chords | length)}' queue-results/database-import.json
```

---

## 🚨 Si algo falla

### Error al scraping:
```bash
# Reduce concurrencia y aumenta rate limit
node queue-processor.js process urls.txt --concurrency 1 --rate-limit 5000
```

### Proceso interrumpido:
```bash
# Reanuda desde donde quedó
node queue-processor.js resume
```

### Tabs sin acordes:
```bash
# Revisa el archivo original
jq '.[] | select((.chords | length) == 0) | .url' queue-results/completed-*.json
```

---

## 💡 Próximos Pasos

1. ✅ Procesa 10-20 tabs de prueba
2. ✅ Revisa la calidad en `extracted-tabs/`
3. ✅ Si se ve bien, procesa batch más grande (100-200)
4. ✅ Importa a Supabase usando `database-import.json`
5. ✅ Verifica en la UI que se vean correctamente
6. ✅ Escala a miles de tabs

---

## 📚 Más Info

Ver [README-SCRAPING-STRATEGY.md](./README-SCRAPING-STRATEGY.md) para estrategia completa.
