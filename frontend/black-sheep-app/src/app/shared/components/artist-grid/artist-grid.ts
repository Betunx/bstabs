import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ArtistItem {
  id: string;
  name: string;
  songCount: number;
  imageUrl?: string;
  routerLink: string;
}

@Component({
  selector: 'app-artist-grid',
  imports: [CommonModule, RouterLink],
  templateUrl: './artist-grid.html',
  styleUrl: './artist-grid.scss',
  standalone: true
})
export class ArtistGrid {
  @Input({ required: true }) artists: ArtistItem[] = [];
  @Input() emptyMessage: string = 'No hay artistas disponibles';

  /**
   * Genera las iniciales del artista para el placeholder
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}