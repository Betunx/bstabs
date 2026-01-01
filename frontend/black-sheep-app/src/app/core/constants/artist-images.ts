/**
 * Artist Images - Cloudflare R2 CDN
 *
 * Sistema de imágenes de artistas usando Cloudflare R2 via Worker.
 *
 * ARQUITECTURA ACTUAL (Producción):
 * - Cloudflare R2 bucket: bstabs-artist-images
 * - Servido via Worker: https://blacksheep-api.bstabs.workers.dev/artists/images/{slug}.jpg
 * - CDN automático de Cloudflare
 * - Cache: 1 año (max-age=31536000)
 *
 * CÓMO AGREGAR/ACTUALIZAR IMÁGENES:
 *
 * Opción 1: PowerShell (Windows)
 * ```powershell
 * .\scripts\upload-artist-image.ps1 .\photos\peso-pluma.jpg peso-pluma
 * ```
 *
 * Opción 2: Bash (Linux/Mac)
 * ```bash
 * ./scripts/upload-artist-image.sh ./photos/peso-pluma.jpg peso-pluma
 * ```
 *
 * Opción 3: curl directo
 * ```bash
 * curl -X POST \
 *   -H "x-api-key: YOUR_API_KEY" \
 *   -H "Content-Type: image/jpeg" \
 *   --data-binary "@peso-pluma.jpg" \
 *   https://blacksheep-api.bstabs.workers.dev/admin/artists/images/peso-pluma.jpg
 * ```
 *
 * REQUISITOS DE IMÁGENES:
 * - Formato: JPG, PNG, o WebP
 * - Tamaño recomendado: 500x500px (cuadrada)
 * - Peso máximo: 200KB
 * - Nombre: {artist-slug}.{ext} (ej: peso-pluma.jpg)
 *
 * El slug debe coincidir con el generado por ArtistsService.slugify()
 */

/**
 * Base URL del CDN de imágenes (Worker)
 */
const ARTIST_IMAGE_CDN_BASE = 'https://blacksheep-api.bstabs.workers.dev/artists/images';

/**
 * Mapeo manual para casos especiales o overrides
 *
 * Usar solo cuando necesites una URL diferente para un artista específico
 * (ej. imagen temporal, URL externa, etc.)
 */
const MANUAL_OVERRIDES: Record<string, string> = {
  // Ejemplo:
  // 'artista-especial': 'https://otra-url.com/imagen.jpg',
};

/**
 * Obtiene la URL de la imagen de un artista
 *
 * @param artistSlug - Slug del artista (generado por ArtistsService.slugify)
 * @returns URL de la imagen o undefined
 *
 * NOTA: Siempre retorna una URL, incluso si la imagen no existe en R2.
 * El componente ArtistGrid mostrará un placeholder si la imagen da 404.
 */
export function getArtistImage(artistSlug: string): string | undefined {
  const slug = artistSlug.toLowerCase();

  // Verificar override manual primero
  if (MANUAL_OVERRIDES[slug]) {
    return MANUAL_OVERRIDES[slug];
  }

  // Retornar URL del CDN (asume JPG por defecto)
  // Si la imagen no existe, el frontend mostrará placeholder
  return `${ARTIST_IMAGE_CDN_BASE}/${slug}.jpg`;
}

/**
 * Verifica si un artista tiene una imagen manual configurada
 *
 * NOTA: Esta función solo verifica overrides manuales.
 * Para verificar si existe en R2, hay que hacer una petición HTTP.
 */
export function hasArtistImage(artistSlug: string): boolean {
  return artistSlug.toLowerCase() in MANUAL_OVERRIDES;
}

/**
 * Construye URL de imagen con extensión específica
 */
export function getArtistImageWithExt(artistSlug: string, ext: 'jpg' | 'png' | 'webp' = 'jpg'): string {
  return `${ARTIST_IMAGE_CDN_BASE}/${artistSlug.toLowerCase()}.${ext}`;
}