# Artist Images - Sistema de Gestión de Fotos

**Última actualización:** 1 Enero 2026

## Estado Actual

✅ **Mapeo manual** con URLs públicas (MVP)
⏳ **Cloudflare R2** pendiente de configuración (producción)

---

## Opción 1: Mapeo Manual (Implementado)

### Ubicación
[src/app/core/constants/artist-images.ts](../frontend/black-sheep-app/src/app/core/constants/artist-images.ts)

### Cómo agregar un artista

```typescript
// 1. Editar artist-images.ts
export const ARTIST_IMAGES: Record<string, string> = {
  'peso-pluma': 'https://example.com/peso-pluma.jpg',
  'nuevo-artista': 'https://url-publica-de-imagen.jpg', // ← Agregar aquí
};
```

### Fuentes de imágenes recomendadas

1. **Unsplash** (gratis, alta calidad)
   - https://unsplash.com/s/photos/musician
   - Usar parámetro `?w=500&h=500&fit=crop` para optimizar

2. **Wikipedia Commons** (dominio público)
   - https://commons.wikimedia.org/

3. **Sitios oficiales** (verificar derechos)

### Ventajas
- ✅ Rápido de implementar
- ✅ Sin costos de almacenamiento
- ✅ Fácil actualización (solo editar TS)

### Desventajas
- ❌ URLs pueden romperse
- ❌ Dependencia de terceros
- ❌ Sin control de caché

---

## Opción 2: Cloudflare R2 (Recomendado para Producción)

### ¿Qué es R2?

Almacenamiento S3-compatible de Cloudflare con **0 costos de egress** (transferencia).

- **10 GB gratis/mes** de almacenamiento
- **CDN integrado** (Cloudflare global network)
- **URLs permanentes** y controladas

### Configuración Paso a Paso

#### 1. Crear R2 Bucket

```bash
# Desde Dashboard de Cloudflare
1. Ir a R2 Object Storage
2. Crear bucket: "bstabs-artist-images"
3. Configurar acceso público
```

#### 2. Configurar Custom Domain

```bash
# Conectar dominio: artists.bstabs.com → R2 bucket
1. En bucket settings → "Connect Custom Domain"
2. Agregar: artists.bstabs.com
3. Cloudflare configura DNS automáticamente
```

#### 3. Subir Imágenes

**Opción A: Dashboard Web**
```
1. Ir al bucket "bstabs-artist-images"
2. Upload files
3. Nombrar: peso-pluma.jpg, junior-h.jpg, etc.
```

**Opción B: Wrangler CLI**
```bash
# Instalar Wrangler (si no está instalado)
npm install -g wrangler

# Subir imagen
wrangler r2 object put bstabs-artist-images/peso-pluma.jpg --file ./peso-pluma.jpg

# Subir múltiples (bash script)
for file in artist-photos/*.jpg; do
  filename=$(basename "$file")
  wrangler r2 object put bstabs-artist-images/$filename --file $file
done
```

**Opción C: Script de Node.js**
```javascript
// scripts/upload-artist-images.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://<account-id>.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadImage(filepath, artistSlug) {
  const fileContent = fs.readFileSync(filepath);

  await s3.send(new PutObjectCommand({
    Bucket: 'bstabs-artist-images',
    Key: `${artistSlug}.jpg`,
    Body: fileContent,
    ContentType: 'image/jpeg',
  }));

  console.log(`✅ Uploaded: ${artistSlug}.jpg`);
}

// Uso:
uploadImage('./photos/peso-pluma.jpg', 'peso-pluma');
```

#### 4. Actualizar Código

```typescript
// En artist-images.ts, cambiar a usar CDN:
export function getArtistImage(artistSlug: string): string {
  return `https://artists.bstabs.com/${artistSlug.toLowerCase()}.jpg`;
}
```

### Costos Estimados

| Uso | Costo |
|-----|-------|
| 500 artistas × 500KB | 250 MB = **GRATIS** |
| 10,000 requests/día | 300K requests/mes = **GRATIS** |
| CDN bandwidth | **GRATIS** (sin cargos de egress) |

**Total:** $0/mes para un catálogo de 500-1000 artistas

---

## Opción 3: GitHub como CDN (Alternativa)

### Setup

```bash
# 1. Crear repo público: bstabs-assets
# 2. Estructura:
bstabs-assets/
  artists/
    peso-pluma.jpg
    junior-h.jpg
    ...

# 3. URL pattern:
https://raw.githubusercontent.com/Betunx/bstabs-assets/main/artists/peso-pluma.jpg
```

### Ventajas
- ✅ Gratis
- ✅ Versionado con git
- ✅ Fácil deploy (git push)

### Desventajas
- ❌ Rate limiting (5000 requests/hour)
- ❌ No optimizado para CDN
- ❌ URLs largas

---

## Especificaciones de Imágenes

### Requisitos
- **Formato:** JPG o WebP (preferible WebP por tamaño)
- **Dimensiones:** 500x500px (cuadrada)
- **Peso máximo:** 200KB
- **Calidad:** 80-85% (balance calidad/tamaño)

### Optimización

```bash
# Usando ImageMagick
convert original.jpg -resize 500x500^ -gravity center -extent 500x500 -quality 85 peso-pluma.jpg

# Usando Node.js (sharp)
npm install sharp

const sharp = require('sharp');
sharp('original.jpg')
  .resize(500, 500, { fit: 'cover' })
  .jpeg({ quality: 85 })
  .toFile('peso-pluma.jpg');
```

---

## Workflow Recomendado

### Para Desarrollo (Ahora)
1. Usar mapeo manual en `artist-images.ts`
2. URLs de Unsplash/Wikipedia
3. Actualizar cuando se agreguen artistas nuevos

### Para Producción (Después)
1. Configurar Cloudflare R2
2. Migrar imágenes a R2 bucket
3. Actualizar `getArtistImage()` para usar CDN
4. Script automatizado para nuevos artistas

---

## Script de Migración (Para cuando se configure R2)

```bash
# scripts/migrate-to-r2.js
const { getArtistImage } = require('../frontend/black-sheep-app/src/app/core/constants/artist-images');
const https = require('https');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 1. Descargar todas las imágenes del mapeo actual
// 2. Subirlas a R2 con el nombre correcto (slug.jpg)
// 3. Verificar que todas se subieron
// 4. Actualizar código para usar R2
```

---

## FAQs

### ¿Qué pasa si un artista no tiene foto?
El componente `ArtistGrid` muestra un placeholder con gradiente dorado y las iniciales del artista.

### ¿Cómo actualizar una foto existente?
- **Mapeo manual:** Cambiar URL en `artist-images.ts`
- **R2:** Subir nueva imagen con mismo nombre (sobreescribe)

### ¿Puedo usar URLs de redes sociales?
No recomendado. Las URLs de Instagram/Facebook/Twitter requieren autenticación y se rompen fácilmente.

### ¿Cuándo migrar a R2?
Cuando tengas más de 50 artistas activos. Para MVP, el mapeo manual es suficiente.

---

## Próximos Pasos

1. [ ] Configurar Cloudflare R2 bucket
2. [ ] Crear script de upload masivo
3. [ ] Migrar imágenes actuales
4. [ ] Actualizar `artist-images.ts` para usar CDN
5. [ ] Documentar proceso para admin panel (para que puedan subir fotos desde UI)

---

**Documentado por:** Claude Code
**Contacto:** bstabscontact@gmail.com