import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SongsService } from './songs.service';

export interface Artist {
  id: string;
  name: string;
  songCount: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArtistsService {
  private http = inject(HttpClient);
  private songsService = inject(SongsService);
  private apiUrl = environment.apiUrl;
  private useMockData = environment.enableMockData;

  getAllArtists(): Observable<Artist[]> {
    if (this.useMockData) {
      return this.songsService.getAllSongs().pipe(
        map(songs => this.aggregateArtistsFromSongs(songs))
      );
    }

    return this.http.get<any[]>(`${this.apiUrl}/songs`).pipe(
      map(songs => this.aggregateArtists(songs))
    );
  }

  getArtistById(id: string): Observable<Artist> {
    return this.getAllArtists().pipe(
      map(artists => {
        const artist = artists.find(a => this.slugify(a.name) === id);
        if (!artist) {
          throw new Error(`Artist not found: ${id}`);
        }
        return artist;
      })
    );
  }

  getSongsByArtist(artistId: string): Observable<any[]> {
    if (this.useMockData) {
      return this.songsService.getAllSongs().pipe(
        map(songs => songs.filter(song => this.slugify(song.artist) === artistId))
      );
    }

    return this.http.get<any[]>(`${this.apiUrl}/songs`).pipe(
      map(songs => songs.filter(song => this.slugify(song.artist) === artistId))
    );
  }

  private aggregateArtistsFromSongs(songs: any[]): Artist[] {
    const artistMap = new Map<string, Artist>();

    songs.forEach(song => {
      const artistName = song.artist || 'Desconocido';
      const artistId = this.slugify(artistName);

      if (artistMap.has(artistId)) {
        const artist = artistMap.get(artistId)!;
        artist.songCount++;
      } else {
        artistMap.set(artistId, {
          id: artistId,
          name: artistName,
          songCount: 1
        });
      }
    });

    return Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  private aggregateArtists(songs: any[]): Artist[] {
    const artistMap = new Map<string, Artist>();

    songs.forEach(song => {
      const artistName = song.artist || 'Desconocido';
      const artistId = this.slugify(artistName);

      if (artistMap.has(artistId)) {
        const artist = artistMap.get(artistId)!;
        artist.songCount++;
      } else {
        artistMap.set(artistId, {
          id: artistId,
          name: artistName,
          songCount: 1
        });
      }
    });

    return Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
