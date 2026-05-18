import { Injectable, inject } from '@angular/core';
import { SongsService } from './songs.service';

export interface SearchResult {
  type: 'artist' | 'song';
  title: string;
  artist?: string;
  match: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private songsService = inject(SongsService);

  search(query: string): SearchResult[] {
    if (!query || query.length < 2) return [];

    const songs = this.songsService.getCachedSongs();
    if (songs.length === 0) return [];

    const q = query.toLowerCase();
    const results: SearchResult[] = [];
    const seenArtists = new Set<string>();

    for (const song of songs) {
      // Artist match (deduplicated)
      if (song.artist.toLowerCase().includes(q) && !seenArtists.has(song.artist)) {
        seenArtists.add(song.artist);
        results.push({
          type: 'artist',
          title: song.artist,
          match: `Artista: ${song.artist}`,
          url: `/artists`,
        });
      }

      // Song title match
      if (song.title.toLowerCase().includes(q)) {
        results.push({
          type: 'song',
          title: song.title,
          artist: song.artist,
          match: `${song.title} — ${song.artist}`,
          url: `/tab/${song.id}`,
        });
      }

      if (results.length >= 8) break;
    }

    return results.slice(0, 8);
  }

  getDidYouMean(query: string): string | null {
    if (!query || query.length < 3) return null;

    const songs = this.songsService.getCachedSongs();
    if (songs.length === 0) return null;

    let bestText = '';
    let bestScore = 0;

    for (const song of songs) {
      const titleScore = this.similarity(query, song.title);
      if (titleScore > 0.6 && titleScore > bestScore) {
        bestText = song.title;
        bestScore = titleScore;
      }
      const artistScore = this.similarity(query, song.artist);
      if (artistScore > 0.6 && artistScore > bestScore) {
        bestText = song.artist;
        bestScore = artistScore;
      }
    }

    return bestText && query.toLowerCase() !== bestText.toLowerCase() ? bestText : null;
  }

  private similarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(newValue, lastValue, costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    const maxLen = Math.max(s1.length, s2.length);
    return maxLen === 0 ? 1 : 1 - costs[s2.length] / maxLen;
  }
}
