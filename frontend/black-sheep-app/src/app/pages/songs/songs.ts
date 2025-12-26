import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemList, ListItem } from '../../shared/components/item-list/item-list';
import { SongsService } from '../../core/services/songs.service';

interface SongItem extends ListItem {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt?: Date;
}

type SortOption = 'recent' | 'a-z' | 'difficulty';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

@Component({
  selector: 'app-songs',
  imports: [ItemList, CommonModule, FormsModule, RouterLink],
  templateUrl: './songs.html',
  styleUrl: './songs.scss',
})
export class Songs implements OnInit {
  private songsService = inject(SongsService);

  sortBy = signal<SortOption>('recent');
  difficultyFilter = signal<DifficultyFilter>('all');
  loading = signal(true);

  private allSongs = signal<SongItem[]>([]);

  ngOnInit() {
    this.loadSongs();
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
          difficulty: song.difficulty,
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

    if (this.difficultyFilter() !== 'all') {
      filtered = filtered.filter(song => song.difficulty === this.difficultyFilter());
    }

    const sorted = [...filtered];
    switch (this.sortBy()) {
      case 'recent':
        sorted.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        break;
      case 'a-z':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'difficulty':
        const diffOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        sorted.sort((a, b) => (diffOrder[a.difficulty || 'beginner'] || 0) - (diffOrder[b.difficulty || 'beginner'] || 0));
        break;
    }

    return sorted;
  });

  setSortBy(option: SortOption) {
    this.sortBy.set(option);
  }

  setDifficultyFilter(filter: DifficultyFilter) {
    this.difficultyFilter.set(filter);
  }
}
