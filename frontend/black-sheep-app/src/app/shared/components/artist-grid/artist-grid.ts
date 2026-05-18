import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GenreBadge } from '../genre-badge/genre-badge';
import { MusicGenre } from '../../../core/constants/genres';

export interface ArtistItem {
  id: string;
  name: string;
  songCount: number;
  imageUrl?: string;
  routerLink: string;
  genres?: MusicGenre[];
}

@Component({
  selector: 'app-artist-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, GenreBadge],
  templateUrl: './artist-grid.html',
  styleUrl: './artist-grid.scss',
})
export class ArtistGrid {
  @Input({ required: true }) artists: ArtistItem[] = [];
  @Input() emptyMessage = 'No hay artistas disponibles';

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
  }
}
