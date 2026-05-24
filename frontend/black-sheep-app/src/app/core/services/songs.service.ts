import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, catchError, throwError, from } from 'rxjs';
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
      return from(import('./mock-songs').then(m => m.MOCK_SONGS));
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
      return from(import('./mock-songs').then(m => {
        const song = m.MOCK_SONGS.find(s => s.id === id);
        if (!song) throw new Error(`Song not found: ${id}`);
        return song;
      }));
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
}
