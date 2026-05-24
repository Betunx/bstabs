import { Component, signal, computed, inject, OnInit, effect, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SongListCompact, CompactSongItem } from '../../shared/components/song-list-compact/song-list-compact';
import { SkeletonSongList } from '../../shared/components/skeleton-song-list/skeleton-song-list';
import { SongsService } from '../../core/services/songs.service';
import { MusicGenre, MUSIC_GENRES, QUICK_GENRES } from '../../core/constants/genres';
import { environment } from '../../../environments/environment';

interface SongItemWithMeta extends CompactSongItem {
  createdAt?: Date;
}

type SortOption = 'recent' | 'a-z';

@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [SongListCompact, SkeletonSongList, CommonModule, FormsModule, RouterLink],
  templateUrl: './songs.html',
  styleUrl: './songs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Songs implements OnInit {
  private songsService = inject(SongsService);
  private route         = inject(ActivatedRoute);
  private router        = inject(Router);
  private destroyRef    = inject(DestroyRef);

  sortBy        = signal<SortOption>('recent');
  searchQuery   = signal('');
  selectedGenre = signal<MusicGenre | ''>('');
  loading       = signal(true);
  error         = signal(false);

  readonly genres      = MUSIC_GENRES;
  readonly quickGenres = QUICK_GENRES;

  private allSongs    = signal<SongItemWithMeta[]>([]);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  debouncedQuery = signal('');

  constructor() {
    effect(() => {
      const query = this.searchQuery();
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.debouncedQuery.set(query), 300);
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const genre = params.get('genre') as MusicGenre | null;
        if (genre && this.genres.includes(genre)) {
          this.selectedGenre.set(genre);
        }
      });

    this.loadSongs();
  }

  private loadSongs(): void {
    this.loading.set(true);
    this.songsService.getAllSongs().subscribe({
      next: (songs) => {
        this.allSongs.set(songs.map(s => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          genre: s.genre,
          key: s.key,
          tempo: s.tempo,
          routerLink: `/tab/${s.id}`,
          createdAt: s.createdAt,
        })));
        this.loading.set(false);
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading songs:', err);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  songs = computed(() => {
    let list = this.allSongs();

    const q = this.debouncedQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      );
    }

    const genre = this.selectedGenre();
    if (genre) {
      list = list.filter(s => s.genre === genre);
    }

    return [...list].sort((a, b) =>
      this.sortBy() === 'a-z'
        ? a.title.localeCompare(b.title)
        : (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  });

  setGenre(genre: MusicGenre | ''): void {
    this.selectedGenre.set(genre);
    // Reflejar selección en URL sin navegación
    this.router.navigate([], {
      queryParams: genre ? { genre } : {},
      replaceUrl: true,
    });
  }

  toggleQuickGenre(genre: MusicGenre): void {
    this.setGenre(this.selectedGenre() === genre ? '' : genre);
  }
}
