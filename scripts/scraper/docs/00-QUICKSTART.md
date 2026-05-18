# ⚡ Guía de Inicio Rápido

> Empieza a scrapear tablaturas en 5 minutos.

## 🎯 Caso de Uso 1: Extraer tablatura HTML

**Sitios compatibles:** AcordesWeb, CifraClub, etc.

```bash
# 1. Extraer
node tools/1-extraction/html-scraper.js "https://acordesweb.com/cancion"

# 2. Revisar
cat output/extracted/cancion.json

# 3. Importar a DB
node tools/3-import/extracted-importer.js
```

**Resultado:** Tablatura importada en Supabase

---

## 🎯 Caso de Uso 2: Extraer de Imágenes (OCR)

**Sitios compatibles:** Espíritu Guitarrista

```bash
# 1. Instalar dependencia OCR
npm install tesseract.js

# 2. Descargar imágenes
node tools/1-extraction/image-scraper.js "https://espirituguitarrista.com/cancion"

# 3. Procesar con OCR
node tools/2-processing/ocr-processor.js "./output/images/cancion"

# 4. Revisar texto extraído
cat output/ocr-results/cancion.txt

# 5. Importar a DB
node tools/3-import/extracted-importer.js
```

**Resultado:** Texto extraído de imágenes e importado

---

## 🎯 Caso de Uso 3: Importación Masiva

```bash
# 1. Crear archivo con URLs
cat > config/urls/mis-urls.txt << EOF
https://acordesweb.com/cancion1
https://acordesweb.com/cancion2
EOF

# 2. Extraer todas
node tools/1-extraction/html-scraper.js --batch config/urls/mis-urls.txt

# 3. Importar todas
node tools/3-import/batch-importer.js
```

---

## 📋 Requisitos

```bash
# Node.js 18+
node --version

# Dependencias básicas (ya instaladas)
npm install

# Dependencia para OCR (opcional)
npm install tesseract.js
```

---

## 🔑 Configuración Inicial

### 1. Variables de Entorno

Crea `.env` en la raíz del proyecto:

```bash
ADMIN_API_KEY=tu_api_key_aqui
```

### 2. Probar Conexión

```bash
node tools/3-import/batch-importer.js --test
```

---

## 🚀 Flujos Comunes

### Flujo A: HTML → DB
```
URL → html-scraper.js → output/extracted/ → extracted-importer.js → Supabase
```

### Flujo B: Imágenes → OCR → DB
```
URL → image-scraper.js → output/images/ → ocr-processor.js → output/ocr-results/ → extracted-importer.js → Supabase
```

### Flujo C: Batch
```
URLs.txt → html-scraper.js --batch → output/extracted/*.json → batch-importer.js → Supabase
```

---

## 📖 Siguiente Paso

- **Extracción detallada:** [01-EXTRACTION.md](01-EXTRACTION.md)
- **Procesamiento OCR:** [02-PROCESSING.md](02-PROCESSING.md)
- **Importación a DB:** [03-IMPORTING.md](03-IMPORTING.md)

---

## 💡 Tips

- Empieza con una sola URL para probar
- Revisa `output/` después de cada paso
- Usa `--help` en cualquier script para ver opciones
- Los logs se guardan en `output/logs/`

---

**🎸 Listo para empezar → [Volver al README](../README.md)**
