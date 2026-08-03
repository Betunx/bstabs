import { ChordService } from './chord.service';
import { CHORD_VARIANTS } from '../constants/chords';

describe('ChordService', () => {
  let service: ChordService;

  beforeEach(() => {
    // Servicio de lógica pura: no necesita TestBed ni inyección.
    service = new ChordService();
  });

  it('resuelve una tríada mayor (C)', () => {
    const chord = service.resolve('C', '');
    expect(chord).not.toBeNull();
    expect(chord!.notes.map((n) => n.name)).toEqual(['C', 'E', 'G']);
    expect(chord!.notes.map((n) => n.degree)).toEqual(['1 (tónica)', '3', '5']);
    expect(chord!.displayName).toBe('C');
  });

  it('resuelve una tríada menor (Am = A, C, E)', () => {
    const chord = service.resolve('A', 'm');
    expect(chord!.notes.map((n) => n.name)).toEqual(['A', 'C', 'E']);
    expect(chord!.displayName).toBe('Am');
  });

  it('resuelve una séptima dominante (G7 = G, B, D, F)', () => {
    const chord = service.resolve('G', '7');
    expect(chord!.notes.map((n) => n.name)).toEqual(['G', 'B', 'D', 'F']);
  });

  it('usa bemoles por convención en F menor (Fm = F, Ab, C)', () => {
    const chord = service.resolve('F', 'm');
    expect(chord!.notes.map((n) => n.name)).toEqual(['F', 'Ab', 'C']);
  });

  it('devuelve null para una raíz inválida', () => {
    expect(service.resolve('H', '')).toBeNull();
  });

  it('devuelve null para un sufijo de variante inexistente', () => {
    expect(service.resolve('C', 'noexiste')).toBeNull();
  });

  it('resolveAllVariants devuelve todas las variantes definidas', () => {
    expect(service.resolveAllVariants('C').length).toBe(CHORD_VARIANTS.length);
  });

  it('getAllRoots devuelve las 12 notas cromáticas', () => {
    expect(service.getAllRoots().length).toBe(12);
  });
});
