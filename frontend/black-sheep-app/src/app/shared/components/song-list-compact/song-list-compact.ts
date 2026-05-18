import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GenreBadge } from '../genre-badge/genre-badge';

export interface CompactSongItem {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  key?: string;
  tempo?: number;
  routerLink: string;
}

@Component({
  selector: 'app-song-list-compact',
  standalone: true,
  imports: [CommonModule, RouterLink, GenreBadge],
  templateUrl: './song-list-compact.html',
  styleUrl: './song-list-compact.scss',
})
export class SongListCompact {
  @Input({ required: true }) songs: CompactSongItem[] = [];
  @Input() emptyMessage = 'No hay canciones disponibles';
}
