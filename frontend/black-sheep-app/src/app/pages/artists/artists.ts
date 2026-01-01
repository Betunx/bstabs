import { Component, signal, inject, OnInit } from '@angular/core';
import { ArtistGrid, ArtistItem } from '../../shared/components/artist-grid/artist-grid';
import { ArtistsService } from '../../core/services/artists.service';

@Component({
  selector: 'app-artists',
  imports: [ArtistGrid],
  templateUrl: './artists.html',
  styleUrl: './artists.scss',
})
export class Artists implements OnInit {
  private artistsService = inject(ArtistsService);

  artists = signal<ArtistItem[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadArtists();
  }

  private loadArtists() {
    this.loading.set(true);
    this.artistsService.getAllArtists().subscribe({
      next: (artists) => {
        const artistItems: ArtistItem[] = artists.map(artist => ({
          id: artist.id,
          name: artist.name,
          songCount: artist.songCount,
          imageUrl: artist.imageUrl,
          routerLink: '/artist/' + artist.id
        }));
        this.artists.set(artistItems);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading artists:', err);
        this.loading.set(false);
      }
    });
  }
}
