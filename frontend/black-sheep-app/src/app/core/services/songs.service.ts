import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, catchError, throwError } from 'rxjs';
import { Song, SongSection } from '../models/song.model';
import { MUSIC_GENRES } from '../constants/genres';
import { environment } from '../../../environments/environment';

interface SongDto {
  id: string;
  title: string;
  artist: string;
  key: string | null;
  tempo: number | null;
  time_signature: string | null;
  tuning: string | null;
  genre: string | null;
  story: string | null;
  sections: SongSection[];
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

  // In-memory cache for performance
  private songsCache: Song[] | null = null;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamp: number | null = null;

  getAllSongs(): Observable<Song[]> {
    if (this.useMockData) {
      return of(this.getMockSongs());
    }

    // Check cache validity
    const now = Date.now();
    if (this.songsCache && this.cacheTimestamp && (now - this.cacheTimestamp) < this.cacheTTL) {
      if (environment.enableDebugMode) console.log('📦 Returning cached songs');
      return of(this.songsCache);
    }

    return this.http.get<SongDto[]>(`${this.apiUrl}/songs`).pipe(
      map(songs => songs.map(dto => this.mapDtoToSong(dto))),
      map(songs => {
        // Update cache
        this.songsCache = songs;
        this.cacheTimestamp = Date.now();
        return songs;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.enableDebugMode) console.error('Error fetching songs:', error);
        // Return stale cache if available (production-safe fallback)
        if (this.songsCache) {
          if (environment.enableDebugMode) console.warn('⚠️ Using stale cache due to API error');
          return of(this.songsCache);
        }
        return throwError(() => error);
      })
    );
  }

  getSongById(id: string): Observable<Song> {
    if (this.useMockData) {
      const song = this.getMockSongs().find(s => s.id === id);
      return song ? of(song) : throwError(() => new Error(`Song not found: ${id}`));
    }

    return this.http.get<SongDto>(`${this.apiUrl}/songs/${id}`).pipe(
      map(dto => this.mapDtoToSong(dto)),
      catchError((error: HttpErrorResponse) => {
        if (environment.enableDebugMode) console.error(`Error fetching song ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /** Returns cached songs synchronously (empty array if cache not yet populated). */
  getCachedSongs(): Song[] {
    return this.songsCache ?? [];
  }

  /**
   * Clear all caches (useful for manual refresh)
   */
  clearCache(): void {
    this.songsCache = null;
    this.cacheTimestamp = null;
    if (environment.enableDebugMode) console.log('🗑️ Cache cleared');
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
      genre: MUSIC_GENRES.includes(dto.genre as any) ? (dto.genre as any) : undefined,
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
        genre: 'Rock',
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
        genre: 'Pop',
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
        genre: 'Rock',
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
        genre: 'Rock',
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
        genre: 'Metal',
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
