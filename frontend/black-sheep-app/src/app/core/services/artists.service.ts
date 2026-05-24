import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { SongsService } from './songs.service';
import { getArtistImage } from '../constants/artist-images';
import { MusicGenre } from '../constants/genres';

export interface Artist {
  id: string;
  name: string;
  songCount: number;
  imageUrl?: string;
  genres: MusicGenre[];
}

@Injectable({
  providedIn: 'root'
})
export class ArtistsService {
  private songsService = inject(SongsService);

  // Single shared pipeline: el map de songs→artists corre una sola vez por emisión
  // de getAllSongs(), aunque varios componentes se suscriban (home + artists + search).
  private artists$ = this.songsService.getAllSongs().pipe(
    map(songs => {
      const artistMap = new Map<string, Artist>();

      songs.forEach(song => {
        const artistName = song.artist || 'Desconocido';
        const artistId = this.slugify(artistName);

        if (!artistMap.has(artistId)) {
          artistMap.set(artistId, {
            id: artistId,
            name: artistName,
            songCount: 0,
            imageUrl: getArtistImage(artistId),
            genres: [],
          });
        }

        const artist = artistMap.get(artistId)!;
        artist.songCount++;

        if (song.genre && !artist.genres.includes(song.genre as MusicGenre)) {
          artist.genres.push(song.genre as MusicGenre);
        }
      });

      return Array.from(artistMap.values());
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getAllArtists(): Observable<Artist[]> {
    return this.artists$;
  }

  getArtistById(id: string): Observable<Artist> {
    return this.artists$.pipe(
      map(artists => {
        const artist = artists.find(a => a.id === id);
        if (!artist) throw new Error(`Artist not found: ${id}`);
        return artist;
      })
    );
  }

  getSongsByArtist(artistId: string): Observable<any[]> {
    return this.songsService.getAllSongs().pipe(
      map(songs => songs.filter(song => this.slugify(song.artist) === artistId))
    );
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
