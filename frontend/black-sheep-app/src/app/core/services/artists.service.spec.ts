import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ArtistsService } from './artists.service';
import { SongsService } from './songs.service';

const FAKE_SONGS = [
  { id: '1', title: 'A', artist: 'Queen', genre: 'Rock' },
  { id: '2', title: 'B', artist: 'Queen', genre: 'Pop' },
  { id: '3', title: 'C', artist: 'Oasis', genre: 'Rock' },
];

describe('ArtistsService', () => {
  let service: ArtistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArtistsService,
        { provide: SongsService, useValue: { getAllSongs: () => of(FAKE_SONGS) } },
      ],
    });
    service = TestBed.inject(ArtistsService);
  });

  describe('slugify', () => {
    it('normaliza acentos y espacios', () => {
      expect(service.slugify('Café Tacvba')).toBe('cafe-tacvba');
    });

    it('reemplaza caracteres no alfanuméricos por guiones', () => {
      expect(service.slugify('AC/DC')).toBe('ac-dc');
    });

    it('recorta guiones al inicio y final', () => {
      expect(service.slugify('¡Maná!')).toBe('mana');
    });
  });

  describe('getAllArtists', () => {
    it('deriva artistas únicos con conteo de canciones', (done) => {
      service.getAllArtists().subscribe((artists) => {
        expect(artists.length).toBe(2);
        const queen = artists.find((a) => a.id === 'queen')!;
        expect(queen.songCount).toBe(2);
        expect(queen.genres).toEqual(['Rock', 'Pop']);
        done();
      });
    });
  });
});
