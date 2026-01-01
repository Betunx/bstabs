# Black Sheep Scraper

Herramientas para extraer tablaturas de sitios web usando acceso directo a APIs.

## 🎵 Scrapers Disponibles

| Archivo | Descripción | Fuente | Estado |
|---------|-------------|--------|--------|
| **acordesweb-scraper.js** | Scraper individual (API directa) | acordesweb.com | ✅ Activo |
| **acordesweb-mass-import.js** | Import masivo por artista | acordesweb.com | ✅ Activo |
| **batch-import-api.js** | Import a base de datos | API propia | ✅ Activo |
| **tab-scraper-v2.js** | Scraper genérico (HTML + PDF) | Múltiples | ✅ Activo |
| **import-extracted.js** | Import JSONs extraídos | Archivos locales | ✅ Activo |
| **mass-publish.js** | Publicación masiva | API propia | ✅ Activo |
| **lyrics-scraper.js** | Extractor de letras | Múltiples | ✅ Activo |
| **catalog-scraper.js** | Catálogo de artistas | AcordesWeb | ✅ Activo |

---

## 🚀 Quick Start - AcordesWeb

### 1. Scrapear una canción

```bash
node acordesweb-scraper.js "https://acordesweb.com/cancion/peso-pluma/rubicon"
```

**Output:**
```
✅ Guardado: rubicon-1767288482527.json
   Acordes: C7, Dm, F, C, Bb, C#7, Bbm (7 únicos)
   Tonalidad: C
   Secciones: 2
```

### 2. Import masivo por artista

```bash
# Importar 10 canciones de Junior H
node acordesweb-mass-import.js "junior-h" --limit 10

# Importar 5 canciones de múltiples artistas
node acordesweb-mass-import.js "peso-pluma" "natanael-cano" "junior-h" --limit 5
```

**Resultado:**
- Detecta automáticamente todas las canciones del artista
- Descarga y parsea cada una
- Genera catálogo completo en `mass-import-output/`
- **118 canciones** encontradas de Junior H ✅

### 3. Import por género

```bash
# Ver artistas sugeridos de corridos
node acordesweb-mass-import.js --suggest corrido

# Importar 10 artistas de corridos (10 canciones c/u)
node acordesweb-mass-import.js --genre corrido --limit 10

# Otros géneros disponibles
node acordesweb-mass-import.js --suggest rock
node acordesweb-mass-import.js --suggest metal
node acordesweb-mass-import.js --suggest pop
```

### 4. Import desde archivo

```bash
# Usar lista pre-creada de artistas
node acordesweb-mass-import.js --file artists-corridos.txt --limit 10
node acordesweb-mass-import.js --file artists-rock.txt --limit 15
```

**Archivos disponibles:**
- `artists-corridos.txt` - 15 artistas de regional mexicano
- `artists-rock.txt` - 17 artistas de rock en español

---

## 📖 Uso Detallado

### AcordesWeb Scraper (Individual)

```bash
# Método 1: URL completa
node acordesweb-scraper.js "https://acordesweb.com/cancion/junior-h/las-noches"

# Método 2: Artista + Canción
node acordesweb-scraper.js --artist "junior-h" --song "las-noches"

# Método 3: Batch desde archivo
node acordesweb-scraper.js --batch urls-acordesweb.txt
```

### Mass Import (Catálogo completo)

```bash
# Import básico
node acordesweb-mass-import.js "artista-slug"

# Con límite de canciones
node acordesweb-mass-import.js "artista-slug" --limit 20

# Múltiples artistas
node acordesweb-mass-import.js "artista-1" "artista-2" "artista-3" --limit 5

# Desde archivo
node acordesweb-mass-import.js --file mi-lista.txt --limit 10

# Por género predefinido
node acordesweb-mass-import.js --genre corrido --limit 10
```

---

## 📊 Output

### Estructura JSON Generada

Los JSONs se guardan en `extracted-tabs/`:

```json
{
  "title": "Rubicon",
  "artist": "Peso Pluma",
  "sourceUrl": "https://acordesweb.com/cancion/peso-pluma/rubicon",
  "chords": ["C7", "Dm", "F", "C", "Bb", "C#7", "Bbm"],
  "key": "C",
  "sections": [
    {
      "name": "Intro",
      "lines": [
        {
          "chords": [
            { "chord": "C7", "position": 0 }
          ],
          "lyrics": "Dm X2"
        },
        {
          "chords": [
            { "chord": "Dm", "position": 0 },
            { "chord": "C7", "position": 39 }
          ],
          "lyrics": ""
        },
        {
          "chords": [],
          "lyrics": "Dicen que soy mamón, también que soy culero"
        }
      ]
    }
  ],
  "rawText": "..."
}
```

### Catálogo de Artista

El mass import genera un archivo consolidado en `mass-import-output/`:

```json
{
  "artist": "junior-h",
  "totalSongs": 118,
  "importedSongs": 10,
  "songs": [
    { /* canción 1 */ },
    { /* canción 2 */ },
    ...
  ]
}
```

---

## 🎯 Casos de Uso

### Caso 1: Poblar base de datos con corridos

```bash
# 1. Ver artistas disponibles
node acordesweb-mass-import.js --suggest corrido

# 2. Import masivo (10 canciones por artista)
node acordesweb-mass-import.js --genre corrido --limit 10

# Resultado: ~100 canciones de corridos
```

### Caso 2: Import selectivo de artistas

```bash
# 1. Crear archivo custom
echo "peso-pluma
junior-h
natanael-cano" > mis-artistas.txt

# 2. Importar
node acordesweb-mass-import.js --file mis-artistas.txt --limit 15

# Resultado: 45 canciones (3 artistas x 15 canciones)
```

### Caso 3: Canción específica

```bash
node acordesweb-scraper.js "https://acordesweb.com/cancion/peso-pluma/rubicon"
```

---

## 🔧 Configuración Técnica

### API Endpoint (AcordesWeb)
```
https://acordesweb.com/tema_json2.php
?artista={artista}&tema={cancion}&transp=0&skin=bw
```

### Rate Limiting
- **Individual scraper**: Sin delay (1 request)
- **Mass import**: 1.5 segundos entre canciones
- **Entre artistas**: 3 segundos

### Detección Automática
- ✅ Acordes (3 formatos: brackets, inline, standalone)
- ✅ Tonalidad (basada en acordes mayores frecuentes)
- ✅ Secciones (Intro, Verse, Chorus, Bridge, Outro)
- ✅ Posiciones de acordes relativas a letras

---

## 📚 Géneros Soportados

### Corrido (10 artistas)
peso-pluma, junior-h, natanael-cano, luis-r-conriquez, grupo-frontera, fuerza-regida, los-tucanes-de-tijuana, calibre-50, banda-ms, el-fantasma

### Rock (17 artistas)
soda-stereo, caifanes, mana, heroes-del-silencio, el-tri, molotov, cafe-tacvba, los-fabulosos-cadillacs, enanitos-verdes, la-ley, y más...

### Pop (8 artistas)
shakira, juanes, alejandro-sanz, luis-miguel, jesse-joy, camila, reik, sin-bandera

### Metal (8 artistas)
metallica, iron-maiden, megadeth, slayer, black-sabbath, pantera, sepultura, tool

---

## 📝 Notas Importantes

- **Formato de salida**: JSON estructurado compatible con el modelo de base de datos
- **Encoding**: UTF-8 (maneja caracteres especiales correctamente)
- **Base64 decoding**: Automático desde API response
- **Cleanup**: Remueve HTML tags, normaliza espacios, decodifica entidades
- **Error handling**: Continúa con siguiente canción si una falla

---

## 🐛 Troubleshooting

### "Error parseando JSON"
- Verifica que la URL sea correcta
- Algunos artistas/canciones pueden no estar disponibles en la API

### "No se encontraron canciones"
- El slug del artista puede ser diferente (ej: "peso-pluma" no "pesopluma")
- Verifica en acordesweb.com la URL correcta del artista

### Rate limit / Timeout
- Aumenta el delay en mass-import si es necesario
- Default: 1.5s entre canciones, 3s entre artistas

---

## 📖 Más Documentación

Ver también:
- `QUICKSTART.md` - Guía rápida de inicio
- `README-SCRAPING-STRATEGY.md` - Estrategias de scraping
- `../../CLAUDE.md` - Contexto completo del proyecto