#!/bin/bash
#
# Upload Artist Image to R2 via Worker
#
# Usage:
#   ./upload-artist-image.sh peso-pluma.jpg
#   ./upload-artist-image.sh ./photos/junior-h.jpg junior-h

# API configuration
API_URL="https://blacksheep-api.bstabs.workers.dev"
API_KEY="your-admin-api-key-here"  # Reemplazar con tu API key real

# Verificar argumentos
if [ $# -lt 1 ]; then
  echo "Usage: $0 <image-file> [artist-slug]"
  echo ""
  echo "Examples:"
  echo "  $0 peso-pluma.jpg"
  echo "  $0 ./photos/junior-h.jpg junior-h"
  exit 1
fi

IMAGE_FILE="$1"
ARTIST_SLUG="${2:-$(basename "$IMAGE_FILE" | sed 's/\.[^.]*$//')}"

# Detectar extensión
EXT="${IMAGE_FILE##*.}"
FILENAME="${ARTIST_SLUG}.${EXT}"

# Verificar que el archivo existe
if [ ! -f "$IMAGE_FILE" ]; then
  echo "❌ Error: Archivo no encontrado: $IMAGE_FILE"
  exit 1
fi

# Detectar content type
case "$EXT" in
  jpg|jpeg)
    CONTENT_TYPE="image/jpeg"
    ;;
  png)
    CONTENT_TYPE="image/png"
    ;;
  webp)
    CONTENT_TYPE="image/webp"
    ;;
  *)
    echo "❌ Error: Extensión no soportada: $EXT"
    echo "Soportados: jpg, jpeg, png, webp"
    exit 1
    ;;
esac

echo "📤 Subiendo imagen de artista..."
echo "  Archivo:  $IMAGE_FILE"
echo "  Slug:     $ARTIST_SLUG"
echo "  Filename: $FILENAME"
echo ""

# Upload
RESPONSE=$(curl -X POST \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: $CONTENT_TYPE" \
  --data-binary "@$IMAGE_FILE" \
  -w "\nHTTP_STATUS:%{http_code}" \
  "$API_URL/admin/artists/images/$FILENAME" \
  2>/dev/null)

# Extraer status code
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Imagen subida exitosamente"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  echo ""
  echo "🌐 URL: $API_URL/artists/images/$FILENAME"
else
  echo "❌ Error al subir imagen (HTTP $HTTP_STATUS)"
  echo "$BODY"
  exit 1
fi
