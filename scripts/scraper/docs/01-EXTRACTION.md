# 📥 Guía de Extracción

> Cómo extraer tablaturas de diferentes sitios web.

## 🎯 Tipos de Extracción

### 1. HTML/PDF (Texto Estructurado)
- **Sitios:** AcordesWeb, CifraClub, UltimateGuitar
- **Tool:** `tools/1-extraction/html-scraper.js`
- **Output:** JSON estructurado

### 2. Imágenes (OCR Required)
- **Sitios:** Espíritu Guitarrista
- **Tool:** `tools/1-extraction/image-scraper.js`
- **Output:** Imágenes PNG/JPG

---

## 📝 Extracción HTML/PDF

### Uso Básico

```bash
node tools/1-extraction/html-scraper.js "URL"
```

### Ejemplo: AcordesWeb

```bash
node tools/1-extraction/html-scraper.js "https://acordesweb.com/cancion"
```

**Output:**
```
output/extracted/
└── cancion.json
```

### Batch (Múltiples URLs)

```bash
# 1. Crear archivo con URLs
cat > config/urls/acordesweb.txt << EOF
https://acordesweb.com/cancion1
https://acordesweb.com/cancion2
https://acordesweb.com/cancion3
EOF

# 2. Ejecutar batch
node tools/1-extraction/html-scraper.js --batch config/urls/acordesweb.txt
```

### Formato del JSON Extraído

```json
{
  "title": "Nombre de la Canción",
  "artist": "Artista",
  "key": "C",
  "tempo": 120,
  "genre": "Rock",
  "sections": [
    {
      "name": "Intro",
      "lines": [
        {
          "chords": [{"chord": "C", "position": 0}],
          "lyrics": "Esta es la letra..."
        }
      ]
    }
  ]
}
```

---

## 🖼️ Extracción de Imágenes

### Uso Básico

```bash
node tools/1-extraction/image-scraper.js "URL"
```

### Ejemplo: Espíritu Guitarrista

```bash
node tools/1-extraction/image-scraper.js "https://www.espirituguitarrista.com/y-lloro/"
```

**Output:**
```
output/images/y-lloro/
├── metadata.json
├── requinto/
│   └── requinto-1.png
├── chords/
│   ├── C-Regional.png
│   └── G-Regional.png
└── lyrics/
    ├── lyrics-1.png
    └── lyrics-2.png
```

### Batch (Múltiples URLs)

```bash
# 1. Crear archivo con URLs
cat > config/urls/espirituguitarrista.txt << EOF
https://www.espirituguitarrista.com/y-lloro/
https://www.espirituguitarrista.com/otra-cancion/
EOF

# 2. Ejecutar batch
node tools/1-extraction/image-scraper.js --batch config/urls/espirituguitarrista.txt
```

### Metadata Generado

```json
{
  "title": "Y Lloro",
  "artist": "Junior H",
  "sourceUrl": "https://...",
  "scrapedAt": "2024-01-05T12:00:00Z",
  "imageCount": 9,
  "images": {
    "requinto": ["https://..."],
    "chords": ["https://..."],
    "lyrics": ["https://..."]
  }
}
```

---

## 🛠️ Scrapers Especializados

### AcordesWeb Scraper

Optimizado para AcordesWeb con manejo de PDFs:

```bash
node tools/1-extraction/acordesweb-scraper.js "URL"
```

### Catalog Scraper

Genera un catálogo de todas las canciones de un artista:

```bash
node tools/1-extraction/catalog-scraper.js --artist "nombre-artista"
```

**Output:** `output/catalog/artista.json`

### Lyrics Scraper

Solo extrae letras (sin acordes):

```bash
node tools/1-extraction/lyrics-scraper.js "URL"
```

---

## 🎛️ Opciones Avanzadas

### html-scraper.js

```bash
# Especificar formato de salida
node tools/1-extraction/html-scraper.js "URL" --format pdf

# Guardar en ubicación específica
node tools/1-extraction/html-scraper.js "URL" --output ./custom/path

# Modo verbose
node tools/1-extraction/html-scraper.js "URL" --verbose
```

### image-scraper.js

```bash
# Solo descargar requintos
node tools/1-extraction/image-scraper.js "URL" --type requinto

# Descargar en alta calidad
node tools/1-extraction/image-scraper.js "URL" --quality high

# Límite de imágenes
node tools/1-extraction/image-scraper.js "URL" --limit 10
```

---

## 📊 Sitios Compatibles

| Sitio | Scraper | Tipo | Notas |
|-------|---------|------|-------|
| AcordesWeb | `html-scraper.js` | HTML/PDF | Soporta PDFs |
| CifraClub | `html-scraper.js` | HTML | Compatible |
| Espíritu Guitarrista | `image-scraper.js` | Imágenes | Requiere OCR |
| Ultimate Guitar | `html-scraper.js` | HTML | Básico |

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Verifica la URL
- Verifica tu conexión a internet
- Algunos sitios pueden bloquear scrapers (usa VPN)

### Error: "No images found"
- Verifica que la URL sea correcta
- El sitio puede haber cambiado su estructura HTML

### Imágenes corruptas
- Reintenta la descarga
- Verifica que el sitio esté disponible
- Algunos sitios tienen protección anti-scraping

---

## 💡 Mejores Prácticas

1. **Respeta robots.txt**
   - Los scrapers esperan 2 segundos entre requests

2. **Modo batch**
   - Usa archivos de URLs para organizar mejor

3. **Verificación manual**
   - Revisa el output antes de importar a DB

4. **Backup de imágenes**
   - Las imágenes originales se mantienen como respaldo

---

## ➡️ Siguiente Paso

Una vez extraídos los datos:

- **Si tienes HTML/PDF:** → [03-IMPORTING.md](03-IMPORTING.md)
- **Si tienes imágenes:** → [02-PROCESSING.md](02-PROCESSING.md) (OCR primero)

---

**🎸 [Volver al README](../README.md)**
