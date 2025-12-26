import { Component, signal } from '@angular/core';
import { ItemList, ListItem } from '../../shared/components/item-list/item-list';

@Component({
  selector: 'app-songs',
  imports: [ItemList],
  templateUrl: './songs.html',
  styleUrl: './songs.scss',
})
export class Songs {
  songs = signal<ListItem[]>([
    // TODO: Replace with real data from API
    {
      id: '1',
      title: 'Wonderwall',
      subtitle: 'Oasis',
      routerLink: '/tab/wonderwall'
    },
    {
      id: '2',
      title: 'Hotel California',
      subtitle: 'Eagles',
      routerLink: '/tab/hotel-california'
    },
    {
      id: '3',
      title: 'Stairway to Heaven',
      subtitle: 'Led Zeppelin',
      routerLink: '/tab/stairway-to-heaven'
    }
  ]);
}
