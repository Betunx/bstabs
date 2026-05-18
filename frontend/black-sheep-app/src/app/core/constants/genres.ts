/**
 * Géneros musicales de la plataforma. Máximo 20.
 * GENRE_COLORS usa clases Tailwind para badges (text + bg + border).
 * getGenreColor() es el helper central — importar desde aquí en toda la app.
 */

export type MusicGenre =
  | 'Rock' | 'Pop' | 'Balada' | 'Corrido' | 'Norteño'
  | 'Banda' | 'Regional Mexicano' | 'Ranchera' | 'Metal' | 'Punk'
  | 'Indie' | 'Folk' | 'Blues' | 'Jazz' | 'Gospel/Cristiana'
  | 'Cumbia' | 'Salsa' | 'Reggae' | 'Country' | 'Alternativo';

export const MUSIC_GENRES: MusicGenre[] = [
  'Rock', 'Pop', 'Balada', 'Corrido', 'Norteño',
  'Banda', 'Regional Mexicano', 'Ranchera', 'Metal', 'Punk',
  'Indie', 'Folk', 'Blues', 'Jazz', 'Gospel/Cristiana',
  'Cumbia', 'Salsa', 'Reggae', 'Country', 'Alternativo',
];

/** Tailwind classes para badges de género: text-color + bg/10 + border */
export const GENRE_COLORS: Record<MusicGenre, string> = {
  'Rock':              'text-red-400 bg-red-400/10 border-red-400/20',
  'Pop':               'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'Balada':            'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Corrido':           'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'Norteño':           'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Banda':             'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Regional Mexicano': 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  'Ranchera':          'text-green-400 bg-green-400/10 border-green-400/20',
  'Metal':             'text-slate-400 bg-slate-400/10 border-slate-400/20',
  'Punk':              'text-rose-400 bg-rose-400/10 border-rose-400/20',
  'Indie':             'text-teal-400 bg-teal-400/10 border-teal-400/20',
  'Folk':              'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Blues':             'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Jazz':              'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  'Gospel/Cristiana':  'text-sky-400 bg-sky-400/10 border-sky-400/20',
  'Cumbia':            'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  'Salsa':             'text-rose-400 bg-rose-400/10 border-rose-400/20',
  'Reggae':            'text-green-400 bg-green-400/10 border-green-400/20',
  'Country':           'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'Alternativo':       'text-violet-400 bg-violet-400/10 border-violet-400/20',
};

/** Helper central — devuelve clases de color para un género dado */
export function getGenreColor(genre: MusicGenre | string | undefined): string {
  if (!genre) return 'text-muted-foreground bg-muted border-border';
  return GENRE_COLORS[genre as MusicGenre] ?? 'text-muted-foreground bg-muted border-border';
}

/** Quick-access genres para pills de filtro rápido en Songs/Home */
export const QUICK_GENRES: MusicGenre[] = [
  'Rock', 'Pop', 'Metal', 'Balada', 'Alternativo', 'Folk', 'Blues', 'Corrido',
];