import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemList, ListItem } from '../../shared/components/item-list/item-list';

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
export class Songs {
  // Estado
  sortBy = signal<SortOption>('recent');
  difficultyFilter = signal<DifficultyFilter>('all');

  // Datos originales
  private allSongs = signal<SongItem[]>([
    // TODO: Replace with real data from API
    {
      id: '1',
      title: 'Wonderwall',
      subtitle: 'Oasis',
      routerLink: '/tab/wonderwall',
      difficulty: 'beginner',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Hotel California',
      subtitle: 'Eagles',
      routerLink: '/tab/hotel-california',
      difficulty: 'intermediate',
      createdAt: new Date('2024-01-16')
    },
    {
      id: '3',
      title: 'Stairway to Heaven',
      subtitle: 'Led Zeppelin',
      routerLink: '/tab/stairway-to-heaven',
      difficulty: 'advanced',
      createdAt: new Date('2024-01-17')
    }
  ]);

  // Canciones filtradas y ordenadas
  songs = computed(() => {
    let filtered = this.allSongs();

    // Filtrar por dificultad
    if (this.difficultyFilter() !== 'all') {
      filtered = filtered.filter(song => song.difficulty === this.difficultyFilter());
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
