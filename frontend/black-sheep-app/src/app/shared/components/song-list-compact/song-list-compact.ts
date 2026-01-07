import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface CompactSongItem {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  key?: string;
  routerLink: string;
}

@Component({
  selector: 'app-song-list-compact',
  imports: [CommonModule, RouterLink],
  templateUrl: './song-list-compact.html',
  styleUrl: './song-list-compact.scss',
  standalone: true
})
export class SongListCompact {
  @Input({ required: true }) songs: CompactSongItem[] = [];
  @Input() emptyMessage: string = 'No hay canciones disponibles';
}