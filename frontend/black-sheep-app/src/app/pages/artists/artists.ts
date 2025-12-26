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
      title: 'Oasis',
      subtitle: '1 canción',
      routerLink: '/artist/oasis'
    },
    {
      id: '2',
      title: 'Eagles',
      subtitle: '1 canción',
      routerLink: '/artist/eagles'
    },
    {
      id: '3',
      title: 'Led Zeppelin',
      subtitle: '1 canción',
      routerLink: '/artist/led-zeppelin'
    }
  ]);
}
