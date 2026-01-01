import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistGrid, ArtistItem } from '../../shared/components/artist-grid/artist-grid';
import { SkeletonArtistGrid } from '../../shared/components/skeleton-artist-grid/skeleton-artist-grid';
import { ArtistsService } from '../../core/services/artists.service';
import { SongsService } from '../../core/services/songs.service';
import { MusicGenre, MUSIC_GENRES } from '../../core/constants/genres';
import { environment } from '../../../environments/environment';

interface ArtistItemWithGenres extends ArtistItem {
  genres: MusicGenre[];
}

@Component({
  selector: 'app-artists',
  imports: [ArtistGrid, SkeletonArtistGrid, CommonModule, FormsModule],
  templateUrl: './artists.html',
  styleUrl: './artists.scss',
})
export class Artists implements OnInit {
  private artistsService = inject(ArtistsService);
  private songsService = inject(SongsService);

  private allArtists = signal<ArtistItemWithGenres[]>([]);
  selectedGenre = signal<MusicGenre | ''>('');
  loading = signal(true);

  // Lista de géneros disponibles
  readonly genres = MUSIC_GENRES;

  // Artistas filtrados por género
  artists = computed(() => {
    const all = this.allArtists();
    const genre = this.selectedGenre();

    if (!genre) {
      return all;
    }

    return all.filter(artist => artist.genres.includes(genre));
  });

  ngOnInit() {
    this.loadArtists();
  }

  setGenre(genre: MusicGenre | '') {
    this.selectedGenre.set(genre);
  }

  private loadArtists() {
    this.loading.set(true);

    // Cargar todas las canciones para obtener géneros por artista
    this.songsService.getAllSongs().subscribe({
      next: (songs) => {
        // Agrupar canciones por artista con sus géneros
        const artistGenresMap = new Map<string, Set<MusicGenre>>();

        songs.forEach(song => {
          const artistSlug = this.slugify(song.artist);
          if (!artistGenresMap.has(artistSlug)) {
            artistGenresMap.set(artistSlug, new Set());
          }
          if (song.genre) {
            artistGenresMap.get(artistSlug)!.add(song.genre as MusicGenre);
          }
        });

        // Cargar artistas
        this.artistsService.getAllArtists().subscribe({
          next: (artists) => {
            const artistItems: ArtistItemWithGenres[] = artists.map(artist => ({
              id: artist.id,
              name: artist.name,
              songCount: artist.songCount,
              imageUrl: artist.imageUrl,
              routerLink: '/artist/' + artist.id,
              genres: Array.from(artistGenresMap.get(artist.id) || [])
            }));
            this.allArtists.set(artistItems);
            this.loading.set(false);
          },
          error: (err) => {
            if (environment.enableDebugMode) console.error('Error loading artists:', err);
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading songs for genre filtering:', err);
        this.loading.set(false);
      }
    });
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
