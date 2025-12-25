import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabViewer } from '../../shared/components/tab-viewer/tab-viewer';
import { Song } from '../../core/models/song.model';

@Component({
  selector: 'app-tab-reader',
  imports: [TabViewer],
  templateUrl: './tab-reader.html',
  styleUrl: './tab-reader.scss',
})
export class TabReader implements OnInit {
  route = inject(ActivatedRoute);
  song = signal<Song | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const songId = this.route.snapshot.paramMap.get('id');
    // TODO: Fetch song from API using songId
    // For now, using mock data
    this.loadMockSong();
  }

  private loadMockSong(): void {
    // Mock song data
    this.song.set({
      id: '1',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      key: 'Am',
      tempo: 72,
      timeSignature: '4/4',
      tuning: 'Standard (EADGBE)',
      difficulty: 'intermediate',
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.loading.set(false);
  }
}
