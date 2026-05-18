/**
 * Artist Images CDN - Cloudflare R2
 * @see CLAUDE.md - Sistema de Imágenes de Artistas (documentación completa)
 */
const ARTIST_IMAGE_CDN_BASE = 'https://blacksheep-api.bstabs.workers.dev/artists/images';

const MANUAL_OVERRIDES: Record<string, string> = {};

export function getArtistImage(artistSlug: string): string | undefined {
  const slug = artistSlug.toLowerCase();
  if (MANUAL_OVERRIDES[slug]) {
    return MANUAL_OVERRIDES[slug];
  }
  return `${ARTIST_IMAGE_CDN_BASE}/${slug}.jpg`;
}

export function hasArtistImage(artistSlug: string): boolean {
  return artistSlug.toLowerCase() in MANUAL_OVERRIDES;
}

export function getArtistImageWithExt(artistSlug: string, ext: 'jpg' | 'png' | 'webp' = 'jpg'): string {
  return `${ARTIST_IMAGE_CDN_BASE}/${artistSlug.toLowerCase()}.${ext}`;
}