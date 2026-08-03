/**
 * Parser de tablaturas pegadas como texto plano.
 *
 * Idea central: las posiciones de los acordes NUNCA se teclean a mano, se
 * derivan del texto. Dos formatos de entrada, ambos soportados a la vez:
 *
 *   1. Dos líneas (lo que se copia de casi cualquier sitio):
 *        Am          F
 *        Quisiera ser un pez
 *      → la posición del acorde es la columna del carácter donde empieza.
 *
 *   2. ChordPro inline (lo cómodo para editar a mano):
 *        [Am]Quisiera ser [F]un pez
 *      → la posición es el índice del corchete sobre la letra ya limpia.
 *
 * `sectionsToChordPro` + `parsePastedTab` forman un round-trip: se puede
 * mostrar una canción como texto editable y volver a leerla sin pérdida.
 */

import { ChordLine, ChordPosition, SongSection } from '../models/song.model';

/**
 * Átomos de calidad de un acorde. El orden importa: las alternativas largas
 * van antes que las cortas para que `maj` no se parta en `m` + `aj`.
 */
const QUALITY_ATOM = '(?:maj|Maj|MAJ|min|sus|add|aug|dim|alt|no|ø|°|º|Δ|M|m|\\+|-)';

/** Raíz + cuerpo de calidad + bajo opcional (C/G, Fmaj7/A). */
const CHORD_RE = new RegExp(`^[A-G][#b]?(?:${QUALITY_ATOM}|\\d|[#b()])*(?:/[A-G][#b]?)?$`);

/** Encabezados de sección reconocidos (sin acentos, en minúsculas). */
const SECTION_KEYWORDS = [
  'intro',
  'introduccion',
  'verso',
  'estrofa',
  'coro',
  'estribillo',
  'refran',
  'precoro',
  'pre-coro',
  'pre coro',
  'puente',
  'interludio',
  'instrumental',
  'solo',
  'outro',
  'final',
  'salida',
  'tag',
  'verse',
  'chorus',
  'prechorus',
  'pre-chorus',
  'bridge',
];

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

/** Quita tildes para comparar encabezados ("Introducción" → "introduccion"). */
function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** ¿Este token es un nombre de acorde válido? (Am, F#m7b5, C/G…) */
export function isChordToken(token: string): boolean {
  return token.length > 0 && CHORD_RE.test(token);
}

/** ¿La línea entera es una línea de acordes? (todos sus tokens lo son) */
export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every(isChordToken);
}

/** ¿La línea trae acordes en formato ChordPro inline? */
export function hasInlineChords(line: string): boolean {
  return /\[[^\]]*\]/.test(line);
}

/**
 * Detecta un encabezado de sección y devuelve su nombre, o null.
 * `[Am]` a solas NO es encabezado: es una línea instrumental.
 */
export function detectSectionHeader(raw: string): string | null {
  const line = raw.trim();
  if (!line) return null;

  const bracketed = line.match(/^\[([^\]]{1,40})\]$/);
  if (bracketed) {
    const inner = bracketed[1].trim();
    return isChordToken(inner) ? null : inner;
  }

  const withoutColon = line.replace(/:$/, '').trim();
  if (!withoutColon || withoutColon.length > 40) return null;

  const normalized = stripAccents(withoutColon.toLowerCase());

  const isKeyword = SECTION_KEYWORDS.some(
    (kw) => normalized === kw || new RegExp(`^${kw}\\s*\\d*$`).test(normalized),
  );
  if (isKeyword) return withoutColon;

  // Encabezado libre: línea corta terminada en ':' que no sea acordes.
  if (line.endsWith(':') && withoutColon.length <= 30 && !isChordLine(withoutColon)) {
    return withoutColon;
  }
  return null;
}

/** Acordes de una línea de acordes, posicionados por su columna. */
function chordPositions(line: string): ChordPosition[] {
  const out: ChordPosition[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(line)) !== null) {
    out.push({ chord: match[0], position: match.index });
  }
  return out;
}

/**
 * Quita espacios finales sin invalidar posiciones: nunca recorta más allá del
 * último acorde (una línea instrumental es todo espacios y debe conservarlos).
 */
function trimTrailing(lyrics: string, chords: ChordPosition[]): string {
  const keep = chords.length ? Math.max(...chords.map((c) => c.position)) : 0;
  let out = lyrics;
  while (out.length > keep && /\s$/.test(out)) {
    out = out.slice(0, -1);
  }
  return out;
}

/** Parsea una línea ChordPro inline: `[Am]Hola [F]adiós`. */
export function parseChordProLine(text: string): ChordLine {
  const chords: ChordPosition[] = [];
  let lyrics = '';
  let last = 0;
  const re = /\[([^\]]*)\]/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    lyrics += text.slice(last, match.index);
    const name = match[1].trim();
    if (name) chords.push({ chord: name, position: lyrics.length });
    last = match.index + match[0].length;
  }
  lyrics += text.slice(last);

  return { chords, lyrics: trimTrailing(lyrics, chords) };
}

/** Serializa una línea a ChordPro inline (inverso de `parseChordProLine`). */
export function lineToChordPro(line: ChordLine): string {
  const sorted = [...line.chords].sort((a, b) => a.position - b.position);
  let out = line.lyrics;

  const furthest = sorted.length ? sorted[sorted.length - 1].position : 0;
  if (furthest > out.length) out = out.padEnd(furthest, ' ');

  // De atrás hacia adelante para que insertar no corra las posiciones previas.
  for (let i = sorted.length - 1; i >= 0; i--) {
    const { chord, position } = sorted[i];
    const at = Math.max(0, Math.min(position, out.length));
    out = out.slice(0, at) + `[${chord}]` + out.slice(at);
  }
  return out;
}

/** Serializa la canción completa a texto ChordPro editable. */
export function sectionsToChordPro(sections: SongSection[]): string {
  return sections
    .map((section) => [`[${section.name}]`, ...section.lines.map(lineToChordPro)].join('\n'))
    .join('\n\n');
}

function normalizeLines(text: string): string[] {
  let clean = text.replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    clean = clean.split(entity).join(char);
  }
  return clean.split('\n');
}

/**
 * Convierte texto pegado (dos líneas, ChordPro, o solo letra) en secciones.
 * Una canción sin acordes es válida: cada línea sale con `chords: []`, lista
 * para guardarse como borrador y completarse después.
 */
export function parsePastedTab(text: string): SongSection[] {
  const lines = normalizeLines(text);
  const sections: SongSection[] = [];
  let current: SongSection | null = null;

  const ensureSection = (): SongSection => {
    if (current) return current;
    const created: SongSection = { name: `Sección ${sections.length + 1}`, lines: [] };
    sections.push(created);
    current = created;
    return created;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Directivas ChordPro ({soc}, {title: …}) — se ignoran, no son letra.
    if (/^\{.*\}$/.test(line.trim())) continue;

    const header = detectSectionHeader(line);
    if (header) {
      current = { name: header, lines: [] };
      sections.push(current);
      continue;
    }

    if (hasInlineChords(line)) {
      ensureSection().lines.push(parseChordProLine(line));
      continue;
    }

    if (isChordLine(line)) {
      const chords = chordPositions(line);
      const next = lines[i + 1];
      const nextIsLyrics =
        next !== undefined &&
        next.trim() !== '' &&
        !isChordLine(next) &&
        !hasInlineChords(next) &&
        !detectSectionHeader(next);

      if (nextIsLyrics) {
        ensureSection().lines.push({ chords, lyrics: trimTrailing(next, chords) });
        i++;
      } else {
        // Acordes sin letra debajo: pasaje instrumental.
        ensureSection().lines.push({ chords, lyrics: '' });
      }
      continue;
    }

    ensureSection().lines.push({ chords: [], lyrics: trimTrailing(line, []) });
  }

  return sections;
}
