import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  getAllSongs(): Observable<Song[]> {
    return this.http.get<SongDto[]>(`${this.apiUrl}/songs`).pipe(
      map(songs => songs.map(dto => this.mapDtoToSong(dto)))
    );
  }

  getSongById(id: string): Observable<Song> {
    return this.http.get<SongDto>(`${this.apiUrl}/songs/${id}`).pipe(
      map(dto => this.mapDtoToSong(dto))
    );
  }

  searchSongs(query: string): Observable<Song[]> {
    return this.http.get<SongDto[]>(`${this.apiUrl}/songs/search?q=${encodeURIComponent(query)}`).pipe(
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
}
