import {
  detectSectionHeader,
  isChordLine,
  isChordToken,
  lineToChordPro,
  parseChordProLine,
  parsePastedTab,
  sectionsToChordPro,
} from './tab-parser';

describe('tab-parser', () => {
  describe('isChordToken', () => {
    it('acepta acordes comunes', () => {
      const valid = ['C', 'Am', 'F#m', 'Bb', 'G7', 'Cmaj7', 'Dsus4', 'Em7b5', 'C/G', 'F#m7/A'];
      valid.forEach((chord) => expect(isChordToken(chord)).withContext(chord).toBe(true));
    });

    it('rechaza palabras de letra', () => {
      const invalid = ['Amor', 'Cuando', 'Ella', 'Bien', 'Gente', 'te', 'la', 'H', ''];
      invalid.forEach((word) => expect(isChordToken(word)).withContext(word).toBe(false));
    });
  });

  describe('isChordLine', () => {
    it('reconoce una línea de solo acordes', () => {
      expect(isChordLine('Am          F        C')).toBe(true);
    });

    it('rechaza una línea de letra', () => {
      expect(isChordLine('Quisiera ser un pez')).toBe(false);
    });

    it('rechaza una línea vacía', () => {
      expect(isChordLine('   ')).toBe(false);
    });
  });

  describe('detectSectionHeader', () => {
    it('reconoce encabezados entre corchetes', () => {
      expect(detectSectionHeader('[Verso 1]')).toBe('Verso 1');
    });

    it('no confunde un acorde solo con un encabezado', () => {
      expect(detectSectionHeader('[Am]')).toBeNull();
    });

    it('reconoce palabras clave con y sin dos puntos', () => {
      expect(detectSectionHeader('Coro:')).toBe('Coro');
      expect(detectSectionHeader('INTRO')).toBe('INTRO');
      expect(detectSectionHeader('Introducción')).toBe('Introducción');
    });

    it('ignora líneas de letra normales', () => {
      expect(detectSectionHeader('Quisiera ser un pez')).toBeNull();
    });
  });

  describe('parsePastedTab — formato dos líneas', () => {
    it('deriva la posición de cada acorde de su columna', () => {
      const sections = parsePastedTab(
        ['[Verso 1]', 'Am          F', 'Quisiera ser un pez'].join('\n'),
      );

      expect(sections.length).toBe(1);
      expect(sections[0].name).toBe('Verso 1');
      expect(sections[0].lines.length).toBe(1);
      expect(sections[0].lines[0].lyrics).toBe('Quisiera ser un pez');
      expect(sections[0].lines[0].chords).toEqual([
        { chord: 'Am', position: 0 },
        { chord: 'F', position: 12 },
      ]);
    });

    it('trata acordes sin letra debajo como pasaje instrumental', () => {
      const sections = parsePastedTab(['Intro', 'Am  F  C', '', 'Coro:', 'Ay ay ay'].join('\n'));

      expect(sections.map((s) => s.name)).toEqual(['Intro', 'Coro']);
      expect(sections[0].lines[0].lyrics).toBe('');
      expect(sections[0].lines[0].chords.length).toBe(3);
      expect(sections[1].lines[0]).toEqual({ chords: [], lyrics: 'Ay ay ay' });
    });

    it('acepta una canción de solo letra (acordes pendientes)', () => {
      const sections = parsePastedTab('Quisiera ser un pez\npara tocar mi nariz');

      expect(sections.length).toBe(1);
      expect(sections[0].name).toBe('Sección 1');
      expect(sections[0].lines.every((l) => l.chords.length === 0)).toBe(true);
      expect(sections[0].lines.map((l) => l.lyrics)).toEqual([
        'Quisiera ser un pez',
        'para tocar mi nariz',
      ]);
    });

    it('decodifica entidades HTML del texto pegado', () => {
      const sections = parsePastedTab('Tú &amp; yo');
      expect(sections[0].lines[0].lyrics).toBe('Tú & yo');
    });
  });

  describe('parseChordProLine', () => {
    it('deriva la posición del índice del corchete', () => {
      const line = parseChordProLine('[Am]Quisiera ser [F]un pez');

      expect(line.lyrics).toBe('Quisiera ser un pez');
      expect(line.chords).toEqual([
        { chord: 'Am', position: 0 },
        { chord: 'F', position: 13 },
      ]);
    });

    it('conserva los espacios que sostienen acordes instrumentales', () => {
      const line = parseChordProLine('[Am] [F]');
      expect(line.chords).toEqual([
        { chord: 'Am', position: 0 },
        { chord: 'F', position: 1 },
      ]);
    });
  });

  describe('round-trip modelo ↔ ChordPro', () => {
    it('serializa y vuelve a leer sin pérdida', () => {
      const original = parsePastedTab(
        [
          '[Verso 1]',
          'Am          F',
          'Quisiera ser un pez',
          '',
          '[Coro]',
          'C   G',
          'Ay ay ay',
        ].join('\n'),
      );

      const roundTripped = parsePastedTab(sectionsToChordPro(original));

      expect(roundTripped).toEqual(original);
    });

    it('inserta los acordes en la posición correcta al serializar', () => {
      const text = lineToChordPro({
        lyrics: 'Quisiera ser un pez',
        chords: [
          { chord: 'Am', position: 0 },
          { chord: 'F', position: 13 },
        ],
      });

      expect(text).toBe('[Am]Quisiera ser [F]un pez');
    });

    it('rellena con espacios si un acorde cae más allá de la letra', () => {
      const text = lineToChordPro({ lyrics: 'Hey', chords: [{ chord: 'C', position: 6 }] });
      expect(text).toBe('Hey   [C]');
      expect(parseChordProLine(text).chords).toEqual([{ chord: 'C', position: 6 }]);
    });
  });
});
