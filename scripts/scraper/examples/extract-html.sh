#!/bin/bash
# Ejemplo: Extraer tablatura HTML de AcordesWeb

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎸 Extrayendo tablatura HTML...${NC}"

# URL de ejemplo (cambiar por la deseada)
URL="${1:-https://acordesweb.com/oasis/wonderwall-164885}"

echo -e "${GREEN}📥 URL: $URL${NC}"

# Ejecutar scraper
node ../tools/1-extraction/html-scraper.js "$URL"

echo -e "${GREEN}✅ Extracción completada!${NC}"
echo -e "${BLUE}📁 Revisa: output/extracted/${NC}"
