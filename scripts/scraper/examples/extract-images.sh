#!/bin/bash
# Ejemplo: Extraer imágenes + OCR de Espíritu Guitarrista

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🖼️  Flujo completo: Imágenes → OCR → Texto${NC}"

# URL de ejemplo
URL="${1:-https://www.espirituguitarrista.com/y-lloro/}"

echo -e "${GREEN}Paso 1/2: Descargando imágenes...${NC}"
node ../tools/1-extraction/image-scraper.js "$URL"

# Obtener nombre de la carpeta generada (último directorio creado)
SONG_FOLDER=$(ls -td ../output/images/*/ | head -1)

echo -e "${GREEN}Paso 2/2: Procesando con OCR...${NC}"
node ../tools/2-processing/ocr-processor.js "$SONG_FOLDER"

echo -e "${GREEN}✅ Completado!${NC}"
echo -e "${BLUE}📁 Imágenes: $SONG_FOLDER${NC}"
echo -e "${BLUE}📄 Texto: output/ocr-results/${NC}"
