/**
 * Teoría musical básica: escala cromática, raíces, variantes e intervalos.
 * Todo se calcula a partir de aquí — no hay tablas estáticas por acorde.
 *
 * Filosofía: instrumento-agnóstico. Mostramos las notas que componen el acorde;
 * las digitaciones (guitarra/piano/bajo) se agregarán como capa visual aparte.
 */

export type Accidental = 'natural' | 'sharp' | 'flat';

/** Escala cromática usando sostenidos (12 semitonos) */
export const CHROMATIC_SHARP = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

/** Escala cromática usando bemoles (equivalente enarmónico) */
export const CHROMATIC_FLAT = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
] as const;

/** Las 7 raíces naturales — nav horizontal principal en /acordes */
export const NATURAL_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export type NaturalRoot = typeof NATURAL_ROOTS[number];

/** Mapeo nota → índice en la escala cromática (sostenidos) */
export const NOTE_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
  'A#': 10, 'Bb': 10, 'B': 11,
};

/** Variantes de acorde con sus intervalos en semitonos desde la raíz */
export interface ChordVariant {
  /** Sufijo que se concatena al nombre de la raíz: C + "m" = Cm */
  suffix: string;
  /** Nombre humano legible en español */
  name: string;
  /** Intervalos en semitonos desde la raíz (0 = raíz) */
  intervals: number[];
  /** Familia para agrupar visualmente en el selector */
  family: 'basic' | 'seventh' | 'extended' | 'suspended' | 'altered';
  /** Descripción corta de la sonoridad */
  mood?: string;
}

export const CHORD_VARIANTS: ChordVariant[] = [
  // Básicos (triadas)
  { suffix: '',     name: 'Mayor',         intervals: [0, 4, 7],     family: 'basic',     mood: 'Brillante, alegre' },
  { suffix: 'm',    name: 'Menor',         intervals: [0, 3, 7],     family: 'basic',     mood: 'Triste, melancólico' },
  { suffix: 'dim',  name: 'Disminuido',    intervals: [0, 3, 6],     family: 'basic',     mood: 'Tenso, inestable' },
  { suffix: 'aug',  name: 'Aumentado',     intervals: [0, 4, 8],     family: 'basic',     mood: 'Misterioso, suspenso' },

  // Séptimas
  { suffix: '7',     name: 'Séptima dominante', intervals: [0, 4, 7, 10],  family: 'seventh', mood: 'Bluesy, con tensión' },
  { suffix: 'maj7',  name: 'Séptima mayor',     intervals: [0, 4, 7, 11],  family: 'seventh', mood: 'Jazz, sofisticado' },
  { suffix: 'm7',    name: 'Menor séptima',     intervals: [0, 3, 7, 10],  family: 'seventh', mood: 'Suave, soul' },
  { suffix: 'm7b5',  name: 'Semidisminuido',    intervals: [0, 3, 6, 10],  family: 'seventh', mood: 'Jazz, II-V-I menor' },
  { suffix: 'dim7',  name: 'Disminuido 7',      intervals: [0, 3, 6, 9],   family: 'seventh', mood: 'Muy tenso' },

  // Suspendidos
  { suffix: 'sus2', name: 'Suspendido 2', intervals: [0, 2, 7],     family: 'suspended', mood: 'Abierto, etéreo' },
  { suffix: 'sus4', name: 'Suspendido 4', intervals: [0, 5, 7],     family: 'suspended', mood: 'Suspenso, resolutorio' },

  // Extendidos / agregados
  { suffix: '6',    name: 'Sexta mayor',  intervals: [0, 4, 7, 9],  family: 'extended',  mood: 'Pop clásico' },
  { suffix: 'm6',   name: 'Sexta menor',  intervals: [0, 3, 7, 9],  family: 'extended' },
  { suffix: 'add9', name: 'Add9',         intervals: [0, 4, 7, 14], family: 'extended',  mood: 'Indie, espacioso' },
  { suffix: '9',    name: 'Novena',       intervals: [0, 4, 7, 10, 14], family: 'extended', mood: 'Funky, soul' },
  { suffix: 'maj9', name: 'Novena mayor', intervals: [0, 4, 7, 11, 14], family: 'extended', mood: 'Bossa, jazz' },
];

/** Acceso rápido por sufijo */
export const CHORD_VARIANT_BY_SUFFIX: Record<string, ChordVariant> =
  Object.fromEntries(CHORD_VARIANTS.map(v => [v.suffix, v]));

/** Familias para agrupar en UI */
export const CHORD_FAMILIES: Array<{ key: ChordVariant['family']; label: string }> = [
  { key: 'basic',     label: 'Básicos (triadas)' },
  { key: 'seventh',   label: 'Séptimas' },
  { key: 'suspended', label: 'Suspendidos' },
  { key: 'extended',  label: 'Extendidos' },
];

/** Color por familia (clases Tailwind para badges) */
export const FAMILY_COLORS: Record<ChordVariant['family'], string> = {
  basic:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  seventh:   'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  suspended: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  extended:  'text-pink-400 bg-pink-400/10 border-pink-400/20',
  altered:   'text-rose-400 bg-rose-400/10 border-rose-400/20',
};
