import { Song } from '../models/song.model';

/**
 * Mock songs para desarrollo offline (cuando `environment.enableMockData = true`).
 * Importado de forma dinámica (`await import(...)`) para que NO entre al bundle
 * de producción cuando el flag está apagado.
 */
export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Wonderwall',
    artist: 'Oasis',
    key: 'Em',
    tempo: 87,
    timeSignature: '4/4',
    tuning: 'Standard (EADGBE)',
    genre: 'Rock',
    story: 'Icónica canción de Oasis lanzada en 1995.',
    sourceUrl: 'https://www.cifraclub.com.br/oasis/wonderwall/',
    sections: [
      {
        name: 'Intro',
        lines: [{ chords: [{ chord: 'Em7', position: 0 }], lyrics: '' }],
      },
      {
        name: 'Verso',
        lines: [
          { chords: [{ chord: 'Em7', position: 0 }, { chord: 'G', position: 25 }], lyrics: 'Today is gonna be the day' },
          { chords: [{ chord: 'Dsus4', position: 0 }], lyrics: "That they're gonna throw it back to you" },
        ],
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Hey Jude',
    artist: 'The Beatles',
    key: 'F',
    tempo: 73,
    timeSignature: '4/4',
    tuning: 'Standard (EADGBE)',
    genre: 'Pop',
    story: 'Clásico atemporal de The Beatles.',
    sourceUrl: 'https://www.cifraclub.com.br/the-beatles/hey-jude/',
    sections: [
      {
        name: 'Verso',
        lines: [{ chords: [{ chord: 'F', position: 0 }], lyrics: "Hey Jude, don't make it bad" }],
      },
    ],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    key: 'Am',
    tempo: 82,
    timeSignature: '4/4',
    tuning: 'Standard (EADGBE)',
    genre: 'Rock',
    story: 'Obra maestra de Led Zeppelin.',
    sourceUrl: 'https://www.cifraclub.com.br/led-zeppelin/stairway-to-heaven/',
    sections: [
      { name: 'Intro', lines: [{ chords: [{ chord: 'Am', position: 0 }], lyrics: '' }] },
    ],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    key: 'Bb',
    tempo: 72,
    timeSignature: '4/4',
    tuning: 'Standard (EADGBE)',
    genre: 'Rock',
    story: 'Épica obra maestra de Queen.',
    sourceUrl: 'https://www.cifraclub.com.br/queen/bohemian-rhapsody/',
    sections: [
      { name: 'Intro', lines: [{ chords: [{ chord: 'Bb', position: 0 }], lyrics: 'Is this the real life?' }] },
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    title: 'Nothing Else Matters',
    artist: 'Metallica',
    key: 'Em',
    tempo: 46,
    timeSignature: '4/4',
    tuning: 'Standard (EADGBE)',
    genre: 'Metal',
    story: 'Balada icónica de Metallica.',
    sourceUrl: 'https://www.cifraclub.com.br/metallica/nothing-else-matters/',
    sections: [
      { name: 'Intro', lines: [{ chords: [{ chord: 'Em', position: 0 }], lyrics: '' }] },
    ],
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
  },
];
