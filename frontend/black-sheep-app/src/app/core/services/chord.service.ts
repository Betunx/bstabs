import { Injectable } from '@angular/core';
import {
  CHROMATIC_SHARP, CHROMATIC_FLAT, NOTE_INDEX, NATURAL_ROOTS,
  CHORD_VARIANTS, CHORD_VARIANT_BY_SUFFIX, ChordVariant, NaturalRoot,
} from '../constants/chords';

/** Grado funcional de cada nota dentro del acorde */
export interface ChordNote {
  /** Nombre de la nota: "C", "E", "G", etc. */
  name: string;
  /** Grado tonal: 1 = tónica, 3 = tercera, 5 = quinta, 7 = séptima, 9 = novena... */
  degree: string;
  /** Distancia en semitonos desde la raíz */
  semitones: number;
}

export interface ResolvedChord {
  root: string;
  variant: ChordVariant;
  /** Nombre completo del acorde: "Cm7", "F#maj9" */
  displayName: string;
  /** Notas que componen el acorde, en orden de intervalo ascendente */
  notes: ChordNote[];
}

/** Mapeo intervalo → grado tonal */
const INTERVAL_TO_DEGREE: Record<number, string> = {
  0: '1 (tónica)',
  2: '2',
  3: 'b3',
  4: '3',
  5: '4',
  6: 'b5',
  7: '5',
  8: '#5',
  9: '6',
  10: 'b7',
  11: '7',
  14: '9',
};

@Injectable({ providedIn: 'root' })
export class ChordService {

  readonly naturalRoots: readonly NaturalRoot[] = NATURAL_ROOTS;
  readonly variants: readonly ChordVariant[] = CHORD_VARIANTS;

  /** Devuelve todas las raíces posibles (naturales + sostenidos) para un dropdown */
  getAllRoots(): string[] {
    return [...CHROMATIC_SHARP];
  }

  /** Resuelve un acorde completo a partir de raíz + sufijo de variante */
  resolve(root: string, suffix: string = ''): ResolvedChord | null {
    const rootIndex = NOTE_INDEX[root];
    const variant = CHORD_VARIANT_BY_SUFFIX[suffix];

    if (rootIndex === undefined || !variant) return null;

    const useFlats = this.shouldUseFlats(root);
    const scale = useFlats ? CHROMATIC_FLAT : CHROMATIC_SHARP;

    const notes: ChordNote[] = variant.intervals.map(interval => ({
      name: scale[(rootIndex + interval) % 12],
      degree: INTERVAL_TO_DEGREE[interval] ?? `+${interval}`,
      semitones: interval,
    }));

    return {
      root,
      variant,
      displayName: `${root}${variant.suffix}`,
      notes,
    };
  }

  /** Todas las variantes para una raíz dada, ya resueltas */
  resolveAllVariants(root: string): ResolvedChord[] {
    return CHORD_VARIANTS
      .map(v => this.resolve(root, v.suffix))
      .filter((c): c is ResolvedChord => c !== null);
  }

  /** Heurística: F, Bb, Eb, Ab usan bemoles por convención de teoría */
  private shouldUseFlats(root: string): boolean {
    return root.endsWith('b') || root === 'F';
  }
}
