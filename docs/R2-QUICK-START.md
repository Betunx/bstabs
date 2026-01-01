# R2 Quick Start - Prueba Rápida

## ✅ Sistema Configurado

El sistema de imágenes con R2 ya está completamente configurado:

- ✅ Bucket R2 creado: `bstabs-artist-images`
- ✅ Worker deployado con endpoints de R2
- ✅ Frontend actualizado para usar Worker como CDN
- ✅ Scripts de upload listos

## 🚀 Prueba Rápida (5 minutos)

### Paso 1: Obtener tu API Key

Tu API key de admin está en el secret `ADMIN_API_KEY` de tu Worker.

Para verla:
```bash
cd backend-workers
npx wrangler secret list
```

Si no la recuerdas, puedes crear una nueva:
```bash
npx wrangler secret put ADMIN_API_KEY
# Ingresa tu nueva API key cuando te lo pida
```

### Paso 2: Editar el script de upload

Edita `scripts/upload-artist-image.ps1` (línea 15):
```powershell
$API_KEY = "tu-api-key-aqui"  # Reemplazar con tu API key real
```

### Paso 3: Conseguir una imagen de prueba

Descarga cualquier imagen de un artista (o usa una genérica):

**Opción 1: Descargar de Unsplash**
```
https://unsplash.com/photos/a-man-with-a-guitar-sitting-on-a-couch-wVZ0NB5c8QI
```

**Opción 2: Usar imagen genérica**
Busca en Google Images: "musician portrait square" y descarga una imagen

**Requisitos:**
- Formato: JPG, PNG, o WebP
- Tamaño ideal: 500x500px (cuadrada)
- Peso: < 200KB

Guárdala como: `test-artist.jpg`

### Paso 4: Subir la imagen

```powershell
cd c:\Users\Humbe\Documents\Programacion\blackSheep
.\scripts\upload-artist-image.ps1 .\test-artist.jpg test-artist
```

**Resultado esperado:**
```
📤 Subiendo imagen de artista...
  Archivo:  .\test-artist.jpg
  Slug:     test-artist
  Filename: test-artist.jpg

✅ Imagen subida exitosamente
{
  "message": "Image uploaded successfully",
  "filename": "test-artist.jpg",
  "url": "/artists/images/test-artist.jpg"
}

🌐 URL: https://blacksheep-api.bstabs.workers.dev/artists/images/test-artist.jpg
```

### Paso 5: Verificar en el navegador

Abre esta URL en tu navegador:
```
https://blacksheep-api.bstabs.workers.dev/artists/images/test-artist.jpg
```

Deberías ver la imagen cargada.

### Paso 6: Listar imágenes subidas

```powershell
# Usando curl (necesitas tu API key)
curl -H "x-api-key: TU_API_KEY" https://blacksheep-api.bstabs.workers.dev/admin/artists/images
```

## 📋 Próximos Pasos

### Subir imágenes reales de artistas

1. **Identificar artistas en tu base de datos:**
```bash
# Desde el frontend en desarrollo
# Ve a http://localhost:4200/artists
# Verás la lista de artistas con sus slugs
```

2. **Buscar imágenes:**
- Wikipedia Commons (dominio público)
- Unsplash (fotos genéricas de músicos)
- Sitios oficiales (con permiso)

3. **Optimizar imágenes** (opcional pero recomendado):
```bash
cd scripts
npm install sharp  # Si no lo has hecho

# Optimizar una imagen
node optimize-images.js ./original.jpg ./optimized/peso-pluma.jpg

# O toda una carpeta
node optimize-images.js --folder ./artist-photos-original ./artist-photos
```

4. **Subir imágenes:**
```powershell
# Una por una
.\scripts\upload-artist-image.ps1 .\photos\peso-pluma.jpg peso-pluma
.\scripts\upload-artist-image.ps1 .\photos\junior-h.jpg junior-h

# O crear un loop para subir varias
```

### Verificar en el frontend

1. Iniciar el frontend:
```bash
cd frontend/black-sheep-app
npm start
```

2. Navegar a: http://localhost:4200/artists

3. Las imágenes que hayas subido aparecerán automáticamente en las tarjetas de artistas

4. Si un artista no tiene imagen, se mostrará el placeholder con sus iniciales

## 🎯 Tips

### Naming Convention

El nombre del archivo debe ser exactamente el slug del artista:

| Artista | Slug | Filename |
|---------|------|----------|
| Peso Pluma | peso-pluma | peso-pluma.jpg |
| Junior H | junior-h | junior-h.jpg |
| Soda Stereo | soda-stereo | soda-stereo.jpg |
| Café Tacvba | cafe-tacvba | cafe-tacvba.jpg |

**Regla:** Minúsculas, sin acentos, espacios reemplazados por guiones.

### Batch Upload (PowerShell)

Si tienes muchas imágenes en una carpeta:

```powershell
$apiKey = "tu-api-key"
Get-ChildItem .\artist-photos\*.jpg | ForEach-Object {
    $slug = $_.BaseName
    Write-Host "Subiendo: $slug" -ForegroundColor Cyan
    .\scripts\upload-artist-image.ps1 $_.FullName $slug
    Start-Sleep -Seconds 1  # Rate limiting
}
```

### Eliminar una imagen

```powershell
curl -X DELETE `
  -H "x-api-key: TU_API_KEY" `
  https://blacksheep-api.bstabs.workers.dev/admin/artists/images/test-artist.jpg
```

## ❓ Troubleshooting

### Error: "Unauthorized"
- Verifica que tu API key esté correcta en el script
- Asegúrate de haber configurado el secret en Wrangler

### Error: "Image not found" al ver la imagen
- Espera 1-2 segundos después del upload
- Verifica que el nombre del archivo sea correcto
- Revisa que la extensión sea .jpg (no .jpeg)

### La imagen no aparece en el frontend
- Verifica que el slug del artista coincida exactamente
- Limpia el cache del navegador (Ctrl+Shift+R)
- Verifica la URL en las DevTools → Network tab

### Script no funciona
- Asegúrate de estar en la raíz del proyecto
- Verifica la ruta del archivo de imagen
- En Windows, usa PowerShell (no CMD)

## 🎉 ¡Listo!

Tu sistema de imágenes con R2 está funcionando. Ahora puedes:

1. Subir imágenes de todos tus artistas
2. Las imágenes se servirán automáticamente via CDN
3. Cache de 1 año para máximo rendimiento
4. Costo: $0 (dentro del free tier de R2)

**Siguiente paso recomendado:** Subir las primeras 10-20 imágenes de artistas populares para ver el impacto visual en tu sitio.
