import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemList, ListItem } from '../../shared/components/item-list/item-list';

@Component({
  selector: 'app-artist-detail',
  imports: [ItemList],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
})
export class ArtistDetail implements OnInit {
  route = inject(ActivatedRoute);
  artistName = signal<string>('');
  songs = signal<ListItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const artistId = this.route.snapshot.paramMap.get('id');
    this.loadArtistSongs(artistId || '');
  }

  private loadArtistSongs(artistId: string): void {
    // Mock data - in production this would come from API
    const artistData: { [key: string]: { name: string; songs: ListItem[] } } = {
      'oasis': {
        name: 'Oasis',
        songs: [
          {
            id: '1',
            title: 'Wonderwall',
            subtitle: 'Beginner',
            routerLink: '/tab/wonderwall'
          }
        ]
      },
      'eagles': {
        name: 'Eagles',
        songs: [
          {
            id: '1',
            title: 'Hotel California',
            subtitle: 'Intermediate',
            routerLink: '/tab/hotel-california'
          }
        ]
      },
      'led-zeppelin': {
        name: 'Led Zeppelin',
        songs: [
          {
            id: '1',
            title: 'Stairway to Heaven',
            subtitle: 'Advanced',
            routerLink: '/tab/stairway-to-heaven'
          }
        ]
      }
    };

    const artist = artistData[artistId.toLowerCase()];
    if (artist) {
      this.artistName.set(artist.name);
      this.songs.set(artist.songs);
    } else {
      this.artistName.set('Artista no encontrado');
      this.songs.set([]);
    }
    this.loading.set(false);
  }
}
