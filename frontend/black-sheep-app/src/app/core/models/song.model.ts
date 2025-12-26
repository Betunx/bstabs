export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  timeSignature: string;
  tuning: string;
  difficulty: Difficulty;
  story?: string;
  sections: SongSection[];
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SongSection {
  name: string;
  timeSignature?: string;
  lines: ChordLine[];
}

export interface ChordLine {
  chords: ChordPosition[];
  lyrics: string;
}

export interface ChordPosition {
  chord: string;
  position: number; // Posición del caracter en la línea de letra
}

// Ejemplo de uso:
// {
//   chords: [
//     { chord: 'E', position: 0 },
//     { chord: 'D', position: 14 },
//     { chord: 'Dm7', position: 18 }
//   ],
//   lyrics: 'Pero esa luna es mi condena'
// }
// Renderiza:
// E             D   Dm7
// Pero esa luna es mi condena
