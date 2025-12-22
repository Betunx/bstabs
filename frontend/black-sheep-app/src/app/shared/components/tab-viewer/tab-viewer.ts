import { Component, Input } from '@angular/core';
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
}
