import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabViewer } from '../../shared/components/tab-viewer/tab-viewer';
import { Song } from '../../core/models/song.model';
import { SongsService } from '../../core/services/songs.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tab-reader',
  imports: [TabViewer],
  templateUrl: './tab-reader.html',
  styleUrl: './tab-reader.scss',
})
export class TabReader implements OnInit {
  private route = inject(ActivatedRoute);
  private songsService = inject(SongsService);

  song = signal<Song | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const songId = this.route.snapshot.paramMap.get('id');
    if (songId) {
      this.loadSong(songId);
    }
  }

  private loadSong(songId: string): void {
    this.loading.set(true);
    this.songsService.getSongById(songId).subscribe({
      next: (song) => {
        this.song.set(song);
        this.loading.set(false);
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading song:', err);
        this.loading.set(false);
      }
    });
  }
}
