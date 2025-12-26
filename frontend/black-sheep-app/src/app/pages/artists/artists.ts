import { Component, signal, inject, OnInit } from '@angular/core';
import { ItemList, ListItem } from '../../shared/components/item-list/item-list';
import { ArtistsService } from '../../core/services/artists.service';

@Component({
  selector: 'app-artists',
  imports: [ItemList],
  templateUrl: './artists.html',
  styleUrl: './artists.scss',
})
export class Artists implements OnInit {
  private artistsService = inject(ArtistsService);

  artists = signal<ListItem[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadArtists();
  }

  private loadArtists() {
    this.loading.set(true);
    this.artistsService.getAllArtists().subscribe({
      next: (artists) => {
        const artistItems: ListItem[] = artists.map(artist => {
          const count = artist.songCount;
          const label = count === 1 ? 'canción' : 'canciones';
          return {
            id: artist.id,
            title: artist.name,
            subtitle: count + ' ' + label,
            routerLink: '/artist/' + artist.id
          };
        });
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
