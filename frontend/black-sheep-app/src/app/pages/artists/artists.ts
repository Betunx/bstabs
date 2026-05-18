import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistGrid, ArtistItem } from '../../shared/components/artist-grid/artist-grid';
import { SkeletonArtistGrid } from '../../shared/components/skeleton-artist-grid/skeleton-artist-grid';
import { ArtistsService } from '../../core/services/artists.service';
import { MusicGenre, MUSIC_GENRES } from '../../core/constants/genres';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-artists',
  imports: [ArtistGrid, SkeletonArtistGrid, CommonModule, FormsModule],
  templateUrl: './artists.html',
  styleUrl: './artists.scss',
})
export class Artists implements OnInit {
  private artistsService = inject(ArtistsService);

  private allArtists = signal<ArtistItem[]>([]);
  selectedGenre = signal<MusicGenre | ''>('');
  searchQuery   = signal('');
  loading = signal(true);
  error   = signal(false);

  availableGenres = computed(() => {
    const genresSet = new Set<MusicGenre>();
    this.allArtists().forEach(a => (a.genres ?? []).forEach(g => genresSet.add(g as MusicGenre)));
    return MUSIC_GENRES.filter(g => genresSet.has(g));
  });

  artists = computed(() => {
    let results = this.allArtists();

    const q = this.searchQuery().trim().toLowerCase();
    if (q.length >= 2) results = results.filter(a => a.name.toLowerCase().includes(q));

    const genre = this.selectedGenre();
    if (genre) results = results.filter(a => (a.genres ?? []).includes(genre));

    return [...results].sort((a, b) => b.songCount - a.songCount);
  });

  ngOnInit(): void {
    this.artistsService.getAllArtists().subscribe({
      next: (artists) => {
        this.allArtists.set(artists.map(a => ({
          id: a.id,
          name: a.name,
          songCount: a.songCount,
          imageUrl: a.imageUrl,
          routerLink: '/artist/' + a.id,
          genres: a.genres,
        })));
        this.loading.set(false);
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading artists:', err);
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  setGenre(genre: MusicGenre | ''): void {
    this.selectedGenre.set(genre);
  }
}
