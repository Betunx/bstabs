import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { SongListCompact, CompactSongItem } from '../../shared/components/song-list-compact/song-list-compact';
import { SkeletonSongList } from '../../shared/components/skeleton-song-list/skeleton-song-list';
import { GenreBadge } from '../../shared/components/genre-badge/genre-badge';
import { ArtistsService, Artist } from '../../core/services/artists.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SongListCompact, SkeletonSongList, GenreBadge],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private artistsService = inject(ArtistsService);

  artist  = signal<Artist | null>(null);
  songs   = signal<CompactSongItem[]>([]);
  loading = signal(true);
  error   = signal(false);

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
  }

  ngOnInit(): void {
    const artistId = this.route.snapshot.paramMap.get('id');
    if (!artistId) {
      this.loading.set(false);
      this.error.set(true);
      return;
    }

    forkJoin({
      artist: this.artistsService.getArtistById(artistId),
      songs:  this.artistsService.getSongsByArtist(artistId),
    }).subscribe({
      next: ({ artist, songs }) => {
        this.artist.set(artist);
        this.songs.set(songs.map(song => ({
          id:         song.id,
          title:      song.title,
          artist:     song.artist,
          genre:      song.genre,
          key:        song.key,
          tempo:      song.tempo,
          routerLink: '/tab/' + song.id,
        })));
        this.loading.set(false);
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading artist detail:', err);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
