import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SongsService } from '../../core/services/songs.service';
import { Song } from '../../core/models/song.model';
import { QUICK_GENRES, MUSIC_GENRES, getGenreColor } from '../../core/constants/genres';
import { GenreBadge } from '../../shared/components/genre-badge/genre-badge';
import { SkeletonSongList } from '../../shared/components/skeleton-song-list/skeleton-song-list';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, GenreBadge, SkeletonSongList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private songsService = inject(SongsService);

  searchQuery = signal('');
  loading     = signal(true);
  error       = signal(false);

  private allSongs = signal<Song[]>([]);

  readonly quickGenres = QUICK_GENRES;

  readonly navCards = [
    { to: '/artists',      label: 'Artistas',      desc: 'Explora músicos y sus canciones',      icon: '🎸', iconClass: 'text-indigo-400 bg-indigo-400/10' },
    { to: '/songs',        label: 'Canciones',      desc: 'Busca tablaturas por nombre',          icon: '🎵', iconClass: 'text-emerald-400 bg-emerald-400/10' },
    { to: '/request-song', label: 'Pedir canción',  desc: 'Solicita una tablatura nueva',         icon: '📝', iconClass: 'text-amber-400 bg-amber-400/10' },
    { to: '/contact',      label: 'Contacto',       desc: 'Envíanos tus comentarios',             icon: '✉️', iconClass: 'text-cyan-400 bg-cyan-400/10' },
  ];

  // Stats calculados desde los datos reales
  stats = computed(() => {
    const songs   = this.allSongs();
    const artists = new Set(songs.map(s => s.artist)).size;
    return [
      { label: 'Canciones',    value: songs.length ? songs.length.toString() : '500+' },
      { label: 'Artistas',     value: artists ? artists.toString() : '100+' },
      { label: 'Géneros',      value: MUSIC_GENRES.length.toString() },
      { label: 'Sin anuncios', value: '0 ads' },
    ];
  });

  // 6 más recientes (por updatedAt desc)
  recentSongs = computed(() =>
    [...this.allSongs()]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 6)
  );

  // 6 "populares" — hasta tener endpoint de views usamos los primeros de la lista
  popularSongs = computed(() => this.allSongs().slice(0, 6));

  // Live search results para el hero (máx 5)
  heroResults = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (q.length < 2) return [];
    return this.allSongs()
      .filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
      .slice(0, 5);
  });

  retry(): void {
    this.error.set(false);
    this.loading.set(true);
    this.loadSongs();
  }

  ngOnInit(): void {
    this.loadSongs();
  }

  private loadSongs(): void {
    this.songsService.getAllSongs().subscribe({
      next: (songs) => {
        this.allSongs.set(songs);
        this.loading.set(false);
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading songs:', err);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  getGenreColor = getGenreColor;
}
