import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from '../../../core/models/song.model';

@Component({
  selector: 'app-tab-viewer',
  imports: [CommonModule],
  templateUrl: './tab-viewer.html',
  styleUrl: './tab-viewer.scss',
  standalone: true
})
export class TabViewer {
  @Input({ required: true }) song!: Song;

  lyricsOnlyMode = signal(false);

  toggleLyricsMode() {
    this.lyricsOnlyMode.update(current => !current);
  }

  getSourceName(url: string): string {
    if (url.includes('cifraclub.com')) return 'CifraClub';
    if (url.includes('letras.com')) return 'Letras.com';
    if (url.includes('musica.com')) return 'Musica.com';
    return 'Fuente externa';
  }
}
