/**
 * Artist Images Mapping
 *
 * Sistema centralizado para gestión de fotos de artistas.
 *
 * ESTRATEGIA DE IMPLEMENTACIÓN:
 *
 * Opción 1 (Actual - Recomendada para MVP):
 * - Mapeo manual de URLs públicas (Unsplash, Wikipedia, sitios oficiales)
 * - Ventajas: Rápido, sin costos de almacenamiento, fácil actualización
 * - Desventajas: URLs pueden romperse, dependencia de terceros
 *
 * Opción 2 (Futuro - Producción):
 * - Cloudflare R2 (S3-compatible storage)
 * - URL pattern: https://artists.bstabs.com/{artist-slug}.jpg
 * - Ventajas: Control total, CDN integrado, sin costos de egress
 * - Desventajas: Requiere configuración de R2 bucket
 *
 * Opción 3 (Alternativa):
 * - GitHub repo público como CDN
 * - URL pattern: https://raw.githubusercontent.com/Betunx/bstabs-assets/main/artists/{artist-slug}.jpg
 * - Ventajas: Gratis, versionado con git, fácil deploy
 * - Desventajas: Rate limiting, no optimizado para CDN
 *
 * CÓMO AGREGAR NUEVOS ARTISTAS:
 *
 * 1. Obtener imagen (preferiblemente 500x500px o mayor, cuadrada)
 * 2. Subir a Cloudflare R2 bucket 'artist-images' (cuando se configure)
 * 3. Agregar entrada en este objeto con el slug del artista
 * 4. El slug debe coincidir con el generado por ArtistsService.slugify()
 *
 * EJEMPLO DE USO:
 * ```typescript
 * import { ARTIST_IMAGES } from '@core/constants/artist-images';
 *
 * const imageUrl = ARTIST_IMAGES['peso-pluma']; // Returns URL or undefined
 * ```
 */

export const ARTIST_IMAGES: Record<string, string> = {
  // Corridos / Regional Mexicano
  'peso-pluma': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
  'junior-h': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
  'natanael-cano': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',

  // Rock en Español
  'soda-stereo': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
  'caifanes': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
  'mana': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',

  // TODO: Agregar más artistas conforme se vayan importando a la base de datos
  // Formato: 'artist-slug': 'https://url-to-image.jpg',
};

/**
 * Obtiene la URL de la imagen de un artista
 * @param artistSlug - Slug del artista (generado por ArtistsService.slugify)
 * @returns URL de la imagen o undefined si no existe
 */
export function getArtistImage(artistSlug: string): string | undefined {
  return ARTIST_IMAGES[artistSlug.toLowerCase()];
}

/**
 * Verifica si un artista tiene imagen configurada
 */
export function hasArtistImage(artistSlug: string): boolean {
  return artistSlug.toLowerCase() in ARTIST_IMAGES;
}

/**
 * Placeholder cuando se configure Cloudflare R2
 * URL pattern futuro: https://artists.bstabs.com/{slug}.jpg
 */
export const ARTIST_IMAGE_CDN_BASE = 'https://artists.bstabs.com';

export function getArtistImageFromCDN(artistSlug: string): string {
  return `${ARTIST_IMAGE_CDN_BASE}/${artistSlug.toLowerCase()}.jpg`;
}