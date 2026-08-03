import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { SongsService } from './songs.service';

const FAKE_SONGS = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen' },
  { id: '2', title: 'Bicycle Race', artist: 'Queen' },
  { id: '3', title: 'Wonderwall', artist: 'Oasis' },
];

class SongsServiceStub {
  private songs: any[] = FAKE_SONGS;
  setSongs(s: any[]) {
    this.songs = s;
  }
  getCachedSongs() {
    return this.songs;
  }
}

describe('SearchService', () => {
  let service: SearchService;
  let songs: SongsServiceStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchService, { provide: SongsService, useClass: SongsServiceStub }],
    });
    service = TestBed.inject(SearchService);
    songs = TestBed.inject(SongsService) as unknown as SongsServiceStub;
  });

  it('devuelve [] para queries de menos de 2 caracteres', () => {
    expect(service.search('a')).toEqual([]);
    expect(service.search('')).toEqual([]);
  });

  it('encuentra canciones por título', () => {
    const results = service.search('wonder');
    expect(results.some((r) => r.type === 'song' && r.title === 'Wonderwall')).toBe(true);
  });

  it('deduplica artistas en los resultados', () => {
    const artistResults = service.search('queen').filter((r) => r.type === 'artist');
    expect(artistResults.length).toBe(1);
  });

  it('devuelve [] cuando no hay canciones en caché', () => {
    songs.setSongs([]);
    expect(service.search('queen')).toEqual([]);
  });

  describe('getDidYouMean', () => {
    it('sugiere un título cercano ante un typo', () => {
      expect(service.getDidYouMean('wonderwoll')).toBe('Wonderwall');
    });

    it('no sugiere nada cuando el texto ya coincide', () => {
      expect(service.getDidYouMean('Wonderwall')).toBeNull();
    });

    it('devuelve null para queries muy cortas', () => {
      expect(service.getDidYouMean('wo')).toBeNull();
    });
  });
});
