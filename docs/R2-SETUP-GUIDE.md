# Guía Paso a Paso: Configuración de Cloudflare R2

**Fecha:** 1 Enero 2026
**Objetivo:** Configurar CDN de imágenes de artistas con Cloudflare R2

---

## ✅ Checklist

- [ ] **Paso 1:** Crear bucket R2
- [ ] **Paso 2:** Obtener credenciales API
- [ ] **Paso 3:** Configurar variables de entorno
- [ ] **Paso 4:** Instalar dependencias
- [ ] **Paso 5:** Preparar imágenes de artistas
- [ ] **Paso 6:** Optimizar imágenes
- [ ] **Paso 7:** Subir a R2
- [ ] **Paso 8:** Configurar custom domain (artists.bstabs.com)
- [ ] **Paso 9:** Actualizar código frontend
- [ ] **Paso 10:** Testing

---

## Paso 1: Crear Bucket R2

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecciona tu cuenta
3. En el menú lateral: **R2 Object Storage**
4. Click **"Create bucket"**
5. Configuración:
   - **Nombre:** `bstabs-artist-images`
   - **Region:** Automatic
6. Click **"Create bucket"**

✅ **Verificación:** Deberías ver el bucket en la lista de R2 buckets

---

## Paso 2: Obtener Credenciales API

1. En R2 Dashboard, click **"Manage R2 API Tokens"**
2. Click **"Create API Token"**
3. Configuración:
   - **Token name:** `bstabs-images-upload`
   - **Permissions:**
     - ✅ Object Read & Write
   - **Bucket:** `bstabs-artist-images` (específico)
   - **TTL:** No expiry
4. Click **"Create API Token"**
5. **⚠️ IMPORTANTE:** Guarda estas credenciales (solo se muestran una vez):
   - Access Key ID
   - Secret Access Key
6. También necesitas tu **Account ID**:
   - Lo encuentras en: Dashboard → R2 → Settings
   - O en la URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/r2`

---

## Paso 3: Configurar Variables de Entorno

```bash
# En la raíz del proyecto
cd c:\Users\Humbe\Documents\Programacion\blackSheep

# Copiar el ejemplo
copy .env.example .env

# Editar .env con tus credenciales
notepad .env
```

**Contenido de `.env`:**
```env
R2_ACCOUNT_ID=abc123def456  # Tu Account ID
R2_ACCESS_KEY_ID=xyz789...   # Access Key del paso 2
R2_SECRET_ACCESS_KEY=...     # Secret Key del paso 2
R2_BUCKET_NAME=bstabs-artist-images
```

⚠️ **IMPORTANTE:** `.env` ya está en `.gitignore`, nunca lo commitees

---

## Paso 4: Instalar Dependencias

```bash
cd scripts

# Instalar AWS SDK (R2 usa protocolo S3)
npm install @aws-sdk/client-s3

# Instalar Sharp para optimización de imágenes
npm install sharp
```

---

## Paso 5: Preparar Imágenes de Artistas

Crea una carpeta para las imágenes originales:

```bash
mkdir artist-photos-original
```

**Obtener imágenes:**

1. **Wikipedia Commons** (dominio público):
   - https://commons.wikimedia.org/
   - Buscar: "nombre del artista"
   - Descargar imágenes de alta calidad

2. **Unsplash** (gratis, alta calidad):
   - https://unsplash.com/s/photos/musician
   - Usar fotos genéricas de músicos

3. **Sitios oficiales** (con permiso):
   - Verificar términos de uso

**Nombrar archivos:**
```
artist-photos-original/
├── peso-pluma.jpg
├── junior-h.jpg
├── natanael-cano.jpg
├── soda-stereo.jpg
└── ...
```

**⚠️ Importante:** El nombre del archivo debe ser el **slug** del artista (lo que devuelve `ArtistsService.slugify()`).

---

## Paso 6: Optimizar Imágenes

Las imágenes se optimizan a 500x500px, 85% quality, formato JPG:

```bash
cd scripts

# Optimizar una imagen
node optimize-images.js ../artist-photos-original/peso-pluma.jpg ../artist-photos/peso-pluma.jpg

# Optimizar carpeta completa (recomendado)
node optimize-images.js --folder ../artist-photos-original ../artist-photos
```

**Resultado esperado:**
```
📁 Encontradas 10 imágenes

🖼️  Procesando: peso-pluma.jpg...
✅ Optimizado: peso-pluma.jpg
   Original:   1920x1080 (458.32 KB)
   Optimizado: 500x500 (67.45 KB)
   Ahorro:     85.3%

...

✅ Completado: 10 optimizados, 0 fallidos
```

---

## Paso 7: Subir Imágenes a R2

```bash
cd scripts

# Subir una imagen
node r2-upload-images.js ../artist-photos/peso-pluma.jpg peso-pluma

# Subir carpeta completa (recomendado)
node r2-upload-images.js --folder ../artist-photos

# Verificar lo que se subió
node r2-upload-images.js --list
```

**Resultado esperado:**
```
📁 Encontradas 10 imágenes

📤 Subiendo: peso-pluma.jpg...
✅ Subido: peso-pluma.jpg (67.45 KB)

...

✅ Completado: 10 exitosos, 0 fallidos
```

---

## Paso 8: Configurar Custom Domain

Para usar `https://artists.bstabs.com` en lugar de URLs largas de R2:

### 8.1 En Cloudflare Dashboard

1. Ve al bucket: **R2** → `bstabs-artist-images`
2. Tab: **Settings**
3. Sección: **Public Access**
4. Click **"Connect Domain"**
5. Selecciona tu dominio: `bstabs.com`
6. Subdomain: `artists`
7. Click **"Connect Domain"**

Cloudflare configurará automáticamente:
- DNS record (CNAME)
- SSL certificate
- CDN caching

### 8.2 Verificar DNS

```bash
# Debería resolver
nslookup artists.bstabs.com
```

### 8.3 Probar URL

Después de ~5 minutos de propagación:

```
https://artists.bstabs.com/peso-pluma.jpg
```

Debería mostrar la imagen.

---

## Paso 9: Actualizar Código Frontend

Una vez que el custom domain funcione, actualizar `artist-images.ts`:

```typescript
// ANTES (mapeo manual)
export const ARTIST_IMAGES: Record<string, string> = {
  'peso-pluma': 'https://images.unsplash.com/photo-xxx.jpg',
  // ...
};

export function getArtistImage(artistSlug: string): string | undefined {
  return ARTIST_IMAGES[artistSlug.toLowerCase()];
}
```

```typescript
// DESPUÉS (usar CDN automáticamente)
const R2_CDN_BASE = 'https://artists.bstabs.com';

export function getArtistImage(artistSlug: string): string {
  return `${R2_CDN_BASE}/${artistSlug.toLowerCase()}.jpg`;
}

// Mantener mapeo solo para excepciones (ej. artistas con PNG)
const MANUAL_OVERRIDES: Record<string, string> = {
  // 'artista-especial': 'https://otra-url.jpg',
};

export function getArtistImage(artistSlug: string): string {
  // Verificar override manual primero
  if (MANUAL_OVERRIDES[artistSlug]) {
    return MANUAL_OVERRIDES[artistSlug];
  }

  // Usar CDN por defecto
  return `${R2_CDN_BASE}/${artistSlug.toLowerCase()}.jpg`;
}
```

---

## Paso 10: Testing

### 10.1 Verificar en Development

```bash
cd frontend/black-sheep-app
npm start
```

Navega a http://localhost:4200/artists

**Verificar:**
- ✅ Las imágenes cargan desde `artists.bstabs.com`
- ✅ Placeholders se muestran si no hay imagen
- ✅ No hay errores 404 en la consola

### 10.2 Deploy a Producción

```bash
npm run build
npm run deploy
```

Verificar en https://bstabs.com/artists

---

## Comandos Útiles

```bash
# Listar imágenes en R2
node r2-upload-images.js --list

# Re-subir una imagen específica
node r2-upload-images.js ../artist-photos/peso-pluma.jpg peso-pluma

# Optimizar + subir en un paso
node optimize-images.js ./original.jpg ./optimized/slug.jpg && \
node r2-upload-images.js ./optimized/slug.jpg slug

# Ver ayuda
node r2-upload-images.js --help
node optimize-images.js --help
```

---

## Troubleshooting

### Error: "Access Denied" o "Forbidden"

**Causa:** API Token sin permisos suficientes

**Solución:**
1. Ve a R2 → Manage API Tokens
2. Verifica que el token tenga **Object Read & Write**
3. Verifica que esté asignado al bucket correcto

### Error: "Bucket not found"

**Causa:** Nombre del bucket incorrecto

**Solución:**
- Verificar que el bucket se llame exactamente `bstabs-artist-images`
- Verificar variable `BUCKET_NAME` en el script

### Imágenes no cargan en el frontend

**Causa:** CORS no configurado

**Solución:**
1. Ve al bucket → Settings → CORS policy
2. Agregar regla:
```json
[
  {
    "AllowedOrigins": ["https://bstabs.com", "https://bstabs.pages.dev"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"]
  }
]
```

### Custom domain no resuelve

**Causa:** DNS no propagado

**Solución:**
- Esperar 5-10 minutos para propagación DNS
- Verificar: `nslookup artists.bstabs.com`
- Limpiar cache DNS: `ipconfig /flushdns` (Windows)

---

## Costos Estimados

| Uso | Costo |
|-----|-------|
| 500 artistas × 70KB | ~35 MB = **GRATIS** |
| 10,000 requests/día | 300K requests/mes = **GRATIS** |
| CDN bandwidth | Ilimitado = **GRATIS** |

**Total:** $0/mes (dentro del free tier de 10GB)

---

## Próximos Pasos

Después de configurar R2:

1. [ ] Agregar más imágenes de artistas
2. [ ] Implementar lazy loading en el frontend
3. [ ] Agregar imagen de respaldo (fallback) para artistas sin foto
4. [ ] Considerar WebP para mejor compresión (opcional)
5. [ ] Monitorear uso en Cloudflare Dashboard

---

**¿Necesitas ayuda?**
- Documentación R2: https://developers.cloudflare.com/r2/
- Contacto: bstabscontact@gmail.com