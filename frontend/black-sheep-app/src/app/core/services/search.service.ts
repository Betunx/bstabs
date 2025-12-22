import { Injectable, signal } from '@angular/core';

export interface SearchResult {
  type: 'artist' | 'song' | 'lyric';
  title: string;
  artist?: string;
  match: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // Mock data - esto se conectará al API después
  private mockSongs = [
    { id: '1', title: 'Viejo Lobo', artist: 'Natanael Cano', lyrics: 'Cargo buen equipo ando bien ensillado' },
    { id: '2', title: 'AMG', artist: 'Natanael Cano', lyrics: 'En el AMG paseando por la ciudad' },
    { id: '3', title: 'Pacas de Billetes', artist: 'Natanael Cano', lyrics: 'Pacas de billetes verdes contando' },
    { id: '4', title: 'Let It Be', artist: 'The Beatles', lyrics: 'When I find myself in times of trouble' },
    { id: '5', title: 'Hey Jude', artist: 'The Beatles', lyrics: 'Hey Jude dont make it bad' },
  ];

  search(query: string): SearchResult[] {
    if (!query || query.length < 2) {
      return [];
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    this.mockSongs.forEach(song => {
      // Search in artist
      if (song.artist.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'artist',
          title: song.artist,
          match: `Artista: ${song.artist}`,
          url: `/artists/${this.slugify(song.artist)}`
        });
      }

      // Search in song title
      if (song.title.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'song',
          title: song.title,
          artist: song.artist,
          match: `${song.title} - ${song.artist}`,
          url: `/songs/${song.id}`
        });
      }

      // Search in lyrics
      if (song.lyrics.toLowerCase().includes(queryLower)) {
        const snippet = this.extractSnippet(song.lyrics, queryLower);
        results.push({
          type: 'lyric',
          title: song.title,
          artist: song.artist,
          match: `"${snippet}..." - ${song.title}`,
          url: `/songs/${song.id}`
        });
      }
    });

    // Remove duplicates and limit to 6 results
    const uniqueResults = this.removeDuplicates(results);
    return uniqueResults.slice(0, 6);
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   * For "did you mean" functionality
   */
  similarity(str1: string, str2: string): number {
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
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }

    const maxLength = Math.max(s1.length, s2.length);
    return maxLength === 0 ? 1 : 1 - costs[s2.length] / maxLength;
  }

  /**
   * Get suggestions for misspelled queries
   */
  getDidYouMean(query: string): string | null {
    if (!query || query.length < 3) {
      return null;
    }

    let bestMatch: { text: string; score: number } | null = null;

    this.mockSongs.forEach(song => {
      // Check song title similarity
      const titleScore = this.similarity(query, song.title);
      if (titleScore > 0.6 && (!bestMatch || titleScore > bestMatch.score)) {
        bestMatch = { text: song.title, score: titleScore };
      }

      // Check artist similarity
      const artistScore = this.similarity(query, song.artist);
      if (artistScore > 0.6 && (!bestMatch || artistScore > bestMatch.score)) {
        bestMatch = { text: song.artist, score: artistScore };
      }
    });

    // Only suggest if query doesn't already match exactly
    if (bestMatch && query.toLowerCase() !== bestMatch.text.toLowerCase()) {
      return bestMatch.text;
    }

    return null;
  }

  private extractSnippet(text: string, query: string): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text.substring(0, 50);

    const start = Math.max(0, index - 15);
    const end = Math.min(text.length, index + query.length + 15);

    return text.substring(start, end);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }

  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = `${result.type}-${result.title}-${result.artist}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
