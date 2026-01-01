import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemList, ListItem } from '../../shared/components/item-list/item-list';
import { SongsService } from '../../core/services/songs.service';
import { MusicGenre, MUSIC_GENRES } from '../../core/constants/genres';

interface SongItem extends ListItem {
  genre?: MusicGenre;
  createdAt?: Date;
}

type SortOption = 'recent' | 'a-z';

@Component({
  selector: 'app-songs',
  imports: [ItemList, CommonModule, FormsModule, RouterLink],
  templateUrl: './songs.html',
  styleUrl: './songs.scss',
})
export class Songs implements OnInit {
  private songsService = inject(SongsService);

  sortBy = signal<SortOption>('recent');
  searchQuery = signal<string>('');
  debouncedQuery = signal<string>(''); // Query después del debounce
  selectedGenre = signal<MusicGenre | ''>(''); // Filtro de género
  loading = signal(true);
  suggestions = signal<SongItem[]>([]); // Sugerencias autocomplete
  showSuggestions = signal(false);

  // Lista de géneros disponibles
  readonly genres = MUSIC_GENRES;

  private allSongs = signal<SongItem[]>([]);
  private debounceTimer: any = null;

  ngOnInit() {
    this.loadSongs();

    // Efecto para debounce: espera 300ms después de que el usuario deje de escribir
    effect(() => {
      const query = this.searchQuery();

      // Limpiar timer anterior
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Esperar 300ms antes de actualizar
      this.debounceTimer = setTimeout(() => {
        this.debouncedQuery.set(query);
        this.updateSuggestions(query);
      }, 300);
    });
  }

  private loadSongs() {
    this.loading.set(true);
    this.songsService.getAllSongs().subscribe({
      next: (songs) => {
        const songItems: SongItem[] = songs.map(song => ({
          id: song.id,
          title: song.title,
          subtitle: song.artist,
          routerLink: `/tab/${song.id}`,
          genre: song.genre,
          createdAt: song.createdAt
        }));
        this.allSongs.set(songItems);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading songs:', err);
        this.loading.set(false);
      }
    });
  }

  songs = computed(() => {
    let filtered = this.allSongs();

    // Filtrar por búsqueda (usa debouncedQuery para evitar lag)
    const query = this.debouncedQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(query) ||
        (song.subtitle?.toLowerCase() || '').includes(query)
      );
    }

    // Filtrar por género
    const genre = this.selectedGenre();
    if (genre) {
      filtered = filtered.filter(song => song.genre === genre);
    }

    // Ordenar
    const sorted = [...filtered];
    switch (this.sortBy()) {
      case 'recent':
        sorted.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        break;
      case 'a-z':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return sorted;
  });

  /**
   * Actualiza sugerencias de autocomplete
   */
  private updateSuggestions(query: string) {
    const q = query.toLowerCase().trim();

    if (!q || q.length < 2) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }

    // Buscar las primeras 5 coincidencias
    const matches = this.allSongs()
      .filter(song =>
        song.title.toLowerCase().includes(q) ||
        (song.subtitle?.toLowerCase() || '').includes(q)
      )
      .slice(0, 5);

    this.suggestions.set(matches);
    this.showSuggestions.set(matches.length > 0);
  }

  /**
   * Resaltar texto que coincide con la búsqueda
   */
  highlightMatch(text: string, query: string): string {
    if (!query) return text;

    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">$1</mark>');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  setSortBy(option: SortOption) {
    this.sortBy.set(option);
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  setGenre(genre: MusicGenre | '') {
    this.selectedGenre.set(genre);
  }

  /**
   * Seleccionar una sugerencia
   */
  selectSuggestion(song: SongItem) {
    this.searchQuery.set(song.title);
    this.debouncedQuery.set(song.title);
    this.showSuggestions.set(false);
  }

  /**
   * Ocultar sugerencias
   */
  hideSuggestions() {
    // Delay para permitir click en sugerencia
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
  }

  /**
   * Mostrar sugerencias al hacer focus
   */
  onSearchFocus() {
    if (this.suggestions().length > 0) {
      this.showSuggestions.set(true);
    }
  }
}
