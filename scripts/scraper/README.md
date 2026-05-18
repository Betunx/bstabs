# 🎸 Black Sheep Tabs - Scraper Tools

> Sistema modular para extraer, procesar e importar tablaturas de guitarra.

## 🚀 Inicio Rápido

```bash
# 1. Extraer tablatura HTML
node tools/1-extraction/html-scraper.js "URL"

# 2. Extraer imágenes de tablaturas
node tools/1-extraction/image-scraper.js "URL"

# 3. Procesar con OCR
npm install tesseract.js
node tools/2-processing/ocr-processor.js "./output/images/cancion"

# 4. Importar a base de datos
node tools/3-import/batch-importer.js
```

📖 **[Ver Guía Completa](docs/00-QUICKSTART.md)**

---

## 📁 Estructura del Proyecto

```
scraper/
├── tools/                      # Herramientas organizadas por flujo
│   ├── 1-extraction/          # Paso 1: Extraer de sitios web
│   ├── 2-processing/          # Paso 2: Procesar datos
│   ├── 3-import/              # Paso 3: Importar a BD
│   └── 4-integrations/        # Integraciones externas
│
├── docs/                       # Documentación detallada
├── config/                     # Configuraciones y URLs
├── output/                     # Resultados generados
└── examples/                   # Scripts de ejemplo
```

---

## 🎯 ¿Qué Herramienta Usar?

### 📥 Quiero extraer tablaturas de un sitio web

#### ➜ Sitio con HTML/PDF (AcordesWeb, CifraClub)
```bash
node tools/1-extraction/html-scraper.js "URL"
```
- **Entrada:** URL del sitio
- **Salida:** `output/extracted/cancion.json`
- **Docs:** [01-EXTRACTION.md](docs/01-EXTRACTION.md)

#### ➜ Sitio con imágenes (Espíritu Guitarrista)
```bash
# Extraer catálogo completo de artistas
node tools/1-extraction/espirituguitarrista-full-catalog.js

# Continuar extracción interrumpida
node tools/1-extraction/espirituguitarrista-full-catalog.js --resume
```
- **Entrada:** Extrae automáticamente del sitio
- **Salida:** `output/espirituguitarrista-catalog/images/`
- **Optimización:** Filtra automáticamente páginas de navegación
- **Docs:** [01-EXTRACTION.md](docs/01-EXTRACTION.md)

---

### ⚙️ Quiero procesar datos extraídos

#### ➜ Extraer texto de imágenes (OCR)
```bash
node tools/2-processing/ocr-processor.js "./output/images/cancion"
```
- **Entrada:** Carpeta con imágenes
- **Salida:** `output/ocr-results/cancion.json`
- **Docs:** [02-PROCESSING.md](docs/02-PROCESSING.md)

#### ➜ Procesar cola de trabajos
```bash
node tools/2-processing/queue-processor.js
```
- **Docs:** [02-PROCESSING.md](docs/02-PROCESSING.md)

---

### 📤 Quiero importar a la base de datos

#### ➜ Importación masiva
```bash
node tools/3-import/batch-importer.js
```
- **Docs:** [03-IMPORTING.md](docs/03-IMPORTING.md)

#### ➜ Importar tabs extraídos
```bash
node tools/3-import/extracted-importer.js
```
- **Docs:** [03-IMPORTING.md](docs/03-IMPORTING.md)

#### ➜ Publicar en batch
```bash
node tools/3-import/mass-publisher.js
```
- **Docs:** [03-IMPORTING.md](docs/03-IMPORTING.md)

---

### 🔗 Quiero integrar con APIs externas

#### ➜ Spotify (metadatos)
```bash
node tools/4-integrations/spotify-integration.js
```
- **Docs:** [04-INTEGRATIONS.md](docs/04-INTEGRATIONS.md)

---

## 📚 Documentación

| Guía | Descripción |
|------|-------------|
| [00-QUICKSTART.md](docs/00-QUICKSTART.md) | Inicio rápido - primeros pasos |
| [01-EXTRACTION.md](docs/01-EXTRACTION.md) | Cómo extraer tablaturas (HTML e imágenes) |
| [02-PROCESSING.md](docs/02-PROCESSING.md) | Cómo procesar datos (OCR, transformaciones) |
| [03-IMPORTING.md](docs/03-IMPORTING.md) | Cómo importar a Supabase |
| [04-INTEGRATIONS.md](docs/04-INTEGRATIONS.md) | APIs externas (Spotify, etc.) |
| [SCRAPING-STRATEGY.md](docs/SCRAPING-STRATEGY.md) | Estrategia general de scraping |

---

## 💡 Ejemplos Prácticos

Todos los scripts de ejemplo están en [examples/](examples/):

```bash
# Extraer HTML de una canción
bash examples/extract-html.sh "https://acordesweb.com/cancion"

# Extraer imágenes y procesarlas con OCR
bash examples/extract-images.sh "https://espirituguitarrista.com/cancion"

# Flujo completo: extraer → procesar → importar
bash examples/full-workflow.sh

# Importación masiva
bash examples/batch-import.sh
```

---

## 🛠️ Herramientas Disponibles

### 1️⃣ Extractores (`tools/1-extraction/`)

| Herramienta | Propósito | Entrada | Salida |
|-------------|-----------|---------|--------|
| `html-scraper.js` | Extrae HTML/PDF | URL | `output/extracted/*.json` |
| `espirituguitarrista-full-catalog.js` | Catálogo completo EG | Auto | `output/espirituguitarrista-catalog/` |
| `image-scraper.js` | Descarga imágenes | URL | `output/images/*/*.png` |
| `acordesweb-scraper.js` | AcordesWeb específico | URL | JSON |
| `catalog-scraper.js` | Genera catálogos | - | `output/catalog/` |
| `lyrics-scraper.js` | Extrae letras | URL | JSON |

### 2️⃣ Procesadores (`tools/2-processing/`)

| Herramienta | Propósito | Entrada | Salida |
|-------------|-----------|---------|--------|
| `ocr-processor.js` | OCR de imágenes | Carpeta de imágenes | `output/ocr-results/*.json` |
| `ocr-batch-processor.js` | OCR en batch | Todas las canciones | `output/ocr-results/` |
| `cleanup-navigation-pages.js` | Limpia páginas incorrectas | Carpeta de imágenes | - |
| `generate-song-list.js` | Lista de canciones | Carpeta de imágenes | `songs-list.txt` |
| `queue-processor.js` | Procesa cola | Cola de trabajos | - |

### 3️⃣ Importadores (`tools/3-import/`)

| Herramienta | Propósito | Entrada | Salida |
|-------------|-----------|---------|--------|
| `batch-importer.js` | Importación masiva | Carpeta | Logs |
| `extracted-importer.js` | Importa extraídos | `output/extracted/` | Logs |
| `mass-publisher.js` | Publica en batch | API | Logs |
| `acordesweb-mass-import.js` | Importación AcordesWeb | - | Logs |

### 4️⃣ Integraciones (`tools/4-integrations/`)

| Herramienta | Propósito |
|-------------|-----------|
| `spotify-integration.js` | Integración con Spotify API |

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz:

```bash
# API Keys
ADMIN_API_KEY=tu_api_key_aqui

# Spotify (opcional)
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret

# R2 (para imágenes de artistas)
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_ACCOUNT_ID=tu_account_id
```

### URLs de Batch

Agrega URLs en `config/urls/`:

```bash
# config/urls/espirituguitarrista-urls.txt
https://www.espirituguitarrista.com/y-lloro/
https://www.espirituguitarrista.com/otra-cancion/
```

---

## 📊 Flujo de Trabajo Completo

```
┌─────────────────────────────────────────────────────────┐
│  Sitio Web (AcordesWeb, Espíritu Guitarrista, etc.)   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  v
         ┌────────────────┐
         │ 1. EXTRACTION  │  tools/1-extraction/
         └────────┬───────┘
                  │
      ┌───────────┴────────────┐
      │                        │
      v                        v
  [HTML/PDF]              [Imágenes]
      │                        │
      │                        v
      │                ┌───────────────┐
      │                │ 2. PROCESSING │  tools/2-processing/
      │                │ (OCR)         │
      │                └───────┬───────┘
      │                        │
      └────────┬───────────────┘
               │
               v
       ┌───────────────┐
       │  3. IMPORT    │  tools/3-import/
       └───────┬───────┘
               │
               v
       ┌───────────────┐
       │  Supabase DB  │
       └───────────────┘
```

---

## 🎓 Aprendizaje

### Para Principiantes
1. Lee [00-QUICKSTART.md](docs/00-QUICKSTART.md)
2. Ejecuta un ejemplo de [examples/](examples/)
3. Experimenta con una URL

### Para Desarrolladores
1. Revisa la [estructura de carpetas](#-estructura-del-proyecto)
2. Lee [SCRAPING-STRATEGY.md](docs/SCRAPING-STRATEGY.md)
3. Explora el código en `tools/`

### Para Contribuidores
1. Fork el proyecto
2. Crea una rama (`feature/nueva-fuente`)
3. Documenta tu scraper en `docs/`
4. Abre un Pull Request

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
npm install
```

### Error: "ADMIN_API_KEY is not defined"
```bash
export ADMIN_API_KEY=tu_api_key  # Linux/Mac
set ADMIN_API_KEY=tu_api_key     # Windows CMD
$env:ADMIN_API_KEY="tu_api_key"  # Windows PowerShell
```

### OCR con baja precisión
- Verifica la calidad de las imágenes
- Usa imágenes en mayor resolución
- Revisa [02-PROCESSING.md](docs/02-PROCESSING.md#mejorar-ocr)

---

## 📝 Licencia

Este proyecto es parte de **Black Sheep Tabs** (bstabs.com).

Solo para uso personal y educativo. Respeta los derechos de autor de las tablaturas originales.

---

## 🤝 Contribuir

¿Quieres agregar soporte para un nuevo sitio?

1. Crea un scraper en `tools/1-extraction/`
2. Documenta en `docs/01-EXTRACTION.md`
3. Agrega un ejemplo en `examples/`
4. Abre un PR

---

## 📞 Soporte

- **Issues:** [GitHub Issues](https://github.com/Betunx/bstabs/issues)
- **Email:** bstabscontact@gmail.com
- **Docs:** Lee [docs/](docs/) primero

---

**🎸 Happy scraping!**
