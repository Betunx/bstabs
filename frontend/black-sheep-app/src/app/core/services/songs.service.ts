import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Song } from '../models/song.model';
import { environment } from '../../../environments/environment';

interface SongDto {
  id: string;
  title: string;
  artist: string;
  key: string | null;
  tempo: number | null;
  time_signature: string | null;
  tuning: string | null;
  difficulty: string | null;
  story: string | null;
  sections: any[];
  source_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SongsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private useMockData = environment.enableMockData;

  getAllSongs(): Observable<Song[]> {
    if (this.useMockData) {
      return of(this.getMockSongs());
    }

    return this.http.get<SongDto[]>(`${this.apiUrl}/songs`).pipe(
      map(songs => songs.map(dto => this.mapDtoToSong(dto)))
    );
  }

  getSongById(id: string): Observable<Song> {
    if (this.useMockData) {
      const song = this.getMockSongs().find(s => s.id === id);
      if (song) return of(song);
      throw new Error('Song not found');
    }

    return this.http.get<SongDto>(`${this.apiUrl}/songs/${id}`).pipe(
      map(dto => this.mapDtoToSong(dto))
    );
  }

  searchSongs(query: string): Observable<Song[]> {
    if (this.useMockData) {
      const filtered = this.getMockSongs().filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
      );
      return of(filtered);
    }

    const encodedQuery = encodeURIComponent(query);
    return this.http.get<SongDto[]>(`${this.apiUrl}/songs/search?q=${encodedQuery}`).pipe(
      map(songs => songs.map(dto => this.mapDtoToSong(dto)))
    );
  }

  private mapDtoToSong(dto: SongDto): Song {
    return {
      id: dto.id,
      title: dto.title,
      artist: dto.artist,
      key: dto.key || 'C',
      tempo: dto.tempo || 120,
      timeSignature: dto.time_signature || '4/4',
      tuning: dto.tuning || 'Standard',
      difficulty: (dto.difficulty as any) || 'beginner',
      story: dto.story || undefined,
      sections: dto.sections || [],
      sourceUrl: dto.source_url || undefined,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at)
    };
  }

  private getMockSongs(): Song[] {
    return [
      {
        id: '1',
        title: 'Wonderwall',
        artist: 'Oasis',
        key: 'Em',
        tempo: 87,
        timeSignature: '4/4',
        tuning: 'Standard (EADGBE)',
        difficulty: 'beginner',
        story: 'Icónica canción de Oasis lanzada en 1995.',
        sourceUrl: 'https://www.cifraclub.com.br/oasis/wonderwall/',
        sections: [
          {
            name: 'Intro',
            lines: [{ chords: [{ chord: 'Em7', position: 0 }], lyrics: '' }]
          },
          {
            name: 'Verso',
            lines: [
              { chords: [{ chord: 'Em7', position: 0 }, { chord: 'G', position: 25 }], lyrics: 'Today is gonna be the day' },
              { chords: [{ chord: 'Dsus4', position: 0 }], lyrics: 'That they\'re gonna throw it back to you' }
            ]
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Hey Jude',
        artist: 'The Beatles',
        key: 'F',
        tempo: 73,
        timeSignature: '4/4',
        tuning: 'Standard (EADGBE)',
        difficulty: 'beginner',
        story: 'Clásico atemporal de The Beatles.',
        sourceUrl: 'https://www.cifraclub.com.br/the-beatles/hey-jude/',
        sections: [
          {
            name: 'Verso',
            lines: [
              { chords: [{ chord: 'F', position: 0 }], lyrics: 'Hey Jude, don\'t make it bad' }
            ]
          }
        ],
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      },
      {
        id: '3',
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        key: 'Am',
        tempo: 82,
        timeSignature: '4/4',
        tuning: 'Standard (EADGBE)',
        difficulty: 'advanced',
        story: 'Obra maestra de Led Zeppelin.',
        sourceUrl: 'https://www.cifraclub.com.br/led-zeppelin/stairway-to-heaven/',
        sections: [
          {
            name: 'Intro',
            lines: [
              { chords: [{ chord: 'Am', position: 0 }], lyrics: '' }
            ]
          }
        ],
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17')
      },
      {
        id: '4',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        key: 'Bb',
        tempo: 72,
        timeSignature: '4/4',
        tuning: 'Standard (EADGBE)',
        difficulty: 'advanced',
        story: 'Épica obra maestra de Queen.',
        sourceUrl: 'https://www.cifraclub.com.br/queen/bohemian-rhapsody/',
        sections: [
          {
            name: 'Intro',
            lines: [
              { chords: [{ chord: 'Bb', position: 0 }], lyrics: 'Is this the real life?' }
            ]
          }
        ],
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: '5',
        title: 'Nothing Else Matters',
        artist: 'Metallica',
        key: 'Em',
        tempo: 46,
        timeSignature: '4/4',
        tuning: 'Standard (EADGBE)',
        difficulty: 'intermediate',
        story: 'Balada icónica de Metallica.',
        sourceUrl: 'https://www.cifraclub.com.br/metallica/nothing-else-matters/',
        sections: [
          {
            name: 'Intro',
            lines: [
              { chords: [{ chord: 'Em', position: 0 }], lyrics: '' }
            ]
          }
        ],
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19')
      }
    ];
  }
}
