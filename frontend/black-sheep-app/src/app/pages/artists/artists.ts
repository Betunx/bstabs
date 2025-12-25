import { Component, signal } from '@angular/core';
import { ItemList, ListItem } from '../../shared/components/item-list/item-list';

@Component({
  selector: 'app-artists',
  imports: [ItemList],
  templateUrl: './artists.html',
  styleUrl: './artists.scss',
})
export class Artists {
  artists = signal<ListItem[]>([
    // TODO: Replace with real data from API
    {
      id: '1',
      title: 'The Beatles',
      subtitle: '120 canciones',
      routerLink: '/artist/the-beatles'
    },
    {
      id: '2',
      title: 'Led Zeppelin',
      subtitle: '85 canciones',
      routerLink: '/artist/led-zeppelin'
    },
    // Add more mock data as needed
  ]);
}
