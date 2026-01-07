import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemList, ListItem } from '../../shared/components/item-list/item-list';
import { ArtistsService } from '../../core/services/artists.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-artist-detail',
  imports: [ItemList],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
})
export class ArtistDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private artistsService = inject(ArtistsService);

  artistName = signal<string>('');
  songs = signal<ListItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const artistId = this.route.snapshot.paramMap.get('id');
    if (artistId) {
      this.loadArtistSongs(artistId);
    }
  }

  private loadArtistSongs(artistId: string): void {
    this.loading.set(true);
    
    this.artistsService.getArtistById(artistId).subscribe({
      next: (artist) => {
        this.artistName.set(artist.name);
        this.loadSongs(artistId);
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading artist:', err);
        this.artistName.set('Artista no encontrado');
        this.loading.set(false);
      }
    });
  }

  private loadSongs(artistId: string): void {
    this.artistsService.getSongsByArtist(artistId).subscribe({
      next: (songs) => {
        const songItems: ListItem[] = songs.map(song => ({
          id: song.id,
          title: song.title,
          subtitle: song.difficulty || 'Beginner',
          routerLink: '/tab/' + song.id
        }));
        this.songs.set(songItems);
        this.loading.set(false);
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading songs:', err);
        this.songs.set([]);
        this.loading.set(false);
      }
    });
  }
}
