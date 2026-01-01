/**
 * Lista de géneros musicales permitidos en la plataforma
 * Máximo 20 géneros para evitar abrumar al usuario
 */

export type MusicGenre =
  | 'Rock'
  | 'Pop'
  | 'Balada'
  | 'Corrido'
  | 'Norteño'
  | 'Banda'
  | 'Regional Mexicano'
  | 'Ranchera'
  | 'Metal'
  | 'Punk'
  | 'Indie'
  | 'Folk'
  | 'Blues'
  | 'Jazz'
  | 'Gospel/Cristiana'
  | 'Cumbia'
  | 'Salsa'
  | 'Reggae'
  | 'Country'
  | 'Alternativo';

export const MUSIC_GENRES: MusicGenre[] = [
  'Rock',
  'Pop',
  'Balada',
  'Corrido',
  'Norteño',
  'Banda',
  'Regional Mexicano',
  'Ranchera',
  'Metal',
  'Punk',
  'Indie',
  'Folk',
  'Blues',
  'Jazz',
  'Gospel/Cristiana',
  'Cumbia',
  'Salsa',
  'Reggae',
  'Country',
  'Alternativo',
];

/**
 * Colores para badges de géneros (opcional para UI)
 */
export const GENRE_COLORS: Record<MusicGenre, string> = {
  'Rock': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Pop': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Balada': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Corrido': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Norteño': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Banda': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'Regional Mexicano': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  'Ranchera': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Metal': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  'Punk': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Indie': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Folk': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'Blues': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Jazz': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Gospel/Cristiana': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  'Cumbia': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'Salsa': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  'Reggae': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Country': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Alternativo': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
};