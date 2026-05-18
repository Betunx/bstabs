#!/bin/bash
# Ejemplo: Flujo completo - Extraer → Importar

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎸 Black Sheep Tabs - Flujo Completo${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# URL de ejemplo
URL="${1:-https://acordesweb.com/oasis/wonderwall-164885}"

echo -e "${GREEN}📥 Paso 1/3: Extrayendo tablatura...${NC}"
node ../tools/1-extraction/html-scraper.js "$URL"

echo ""
echo -e "${GREEN}⏳ Paso 2/3: Esperando confirmación...${NC}"
echo -e "${YELLOW}Revisa el archivo extraído en output/extracted/${NC}"
read -p "¿Continuar con la importación? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${GREEN}📤 Paso 3/3: Importando a base de datos...${NC}"
    node ../tools/3-import/extracted-importer.js

    echo ""
    echo -e "${GREEN}✅ ¡Flujo completado exitosamente!${NC}"
    echo -e "${BLUE}La tablatura ha sido importada a Supabase${NC}"
else
    echo -e "${YELLOW}⚠️  Importación cancelada${NC}"
    echo -e "${BLUE}Los archivos extraídos están en output/extracted/${NC}"
fi
