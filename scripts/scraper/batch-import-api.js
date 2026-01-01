/**
 * Batch Import API - Scrapea e importa directamente al API de Black Sheep
 *
 * Uso:
 *   node batch-import-api.js [artistas] [limite]
 *
 * Ejemplos:
 *   node batch-import-api.js                           # Artistas predefinidos
 *   node batch-import-api.js "oasis,coldplay" 50      # Artistas custom, max 50 songs
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuración
const API_URL = 'https://blacksheep-api.bstabs.workers.dev';
const API_KEY = process.env.ADMIN_API_KEY || 'admin123';

// Artistas populares para stock inicial (variados géneros)
const DEFAULT_ARTISTS = [
  // Rock clásico
  'oasis', 'the-beatles', 'led-zeppelin', 'queen', 'pink-floyd', 'the-rolling-stones',
  'eagles', 'guns-n-roses', 'ac-dc', 'metallica', 'nirvana', 'u2', 'coldplay',
  'red-hot-chili-peppers', 'foo-fighters', 'green-day', 'linkin-park', 'bon-jovi',
  // Rock en español
  'mana', 'soda-stereo', 'caifanes', 'cafe-tacvba', 'el-tri', 'maldita-vecindad',
  'heroes-del-silencio', 'la-ley', 'los-fabulosos-cadillacs', 'molotov',
  // Pop latino
  'luis-miguel', 'juan-gabriel', 'jose-jose', 'rocio-durcal', 'alejandro-sanz',
  'shakira', 'juanes', 'enrique-iglesias', 'ricky-martin', 'marc-anthony',
  // Regional mexicano
  'vicente-fernandez', 'pedro-infante', 'jose-alfredo-jimenez', 'joan-sebastian',
  'pepe-aguilar', 'alejandro-fernandez', 'christian-nodal', 'banda-ms',
  // Pop/Rock actual
  'ed-sheeran', 'bruno-mars', 'adele', 'taylor-swift', 'maroon-5',
  // Acústico/Folk
  'bob-dylan', 'eric-clapton', 'john-mayer', 'jason-mraz', 'jack-johnson'
];

class BatchImporter {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.stats = { scraped: 0, imported: 0, errors: 0, duplicates: 0 };
    this.processedUrls = new Set();
  }

  /**
   * Fetch con headers
   */
  fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const urlObj = new URL(url);

      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (url.startsWith('https') ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
          ...options.headers
        }
      };

      const req = protocol.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });

      req.on('error', reject);

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  /**
   * Obtiene lista de canciones de un artista en CifraClub
   */
  async getArtistSongs(artistSlug) {
    const url = `https://www.cifraclub.com.br/${artistSlug}/`;
    console.log(`\n👤 Buscando canciones de: ${artistSlug}`);

    try {
      const { data: html } = await this.fetch(url);

      // Extraer nombre real del artista desde el title
      const titleMatch = html.match(/<title>([^<|]+)/);
      const artistName = titleMatch ? titleMatch[1].trim() : this.formatSlug(artistSlug);

      // Patrón simple: buscar todas las URLs de canciones del artista
      const songPattern = new RegExp(`"/${artistSlug}/([a-z0-9-]+)/"`, 'g');

      const songs = [];
      let match;
      const seen = new Set();

      while ((match = songPattern.exec(html)) !== null) {
        const songSlug = match[1];
        const key = songSlug.toLowerCase();

        // Evitar duplicados y enlaces de navegación
        if (!seen.has(key) &&
            !songSlug.includes('imprimir') &&
            !songSlug.includes('video') &&
            !songSlug.includes('todas') &&
            songSlug.length > 2) {
          seen.add(key);
          songs.push({
            title: this.formatSlug(songSlug),
            artist: artistName,
            artistSlug,
            songSlug,
            url: `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`
          });
        }
      }

      console.log(`   ✅ ${songs.length} canciones encontradas`);
      return songs;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return [];
    }
  }

  /**
   * Scrapea una canción individual de CifraClub
   */
  async scrapeSong(songInfo) {
    const { url, title, artist } = songInfo;

    if (this.processedUrls.has(url)) {
      return null;
    }
    this.processedUrls.add(url);

    try {
      const { data: html } = await this.fetch(url);

      // Extraer el contenido de la cifra (acordes + letra)
      const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
      if (!preMatch) {
        console.log(`   ⚠️  Sin contenido: ${title}`);
        return null;
      }

      let content = preMatch[1];

      // Limpiar HTML
      content = content
        .replace(/<b>([^<]+)<\/b>/g, '$1')  // Acordes en bold
        .replace(/<[^>]+>/g, '')             // Otros tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      // Extraer metadata adicional
      const keyMatch = html.match(/Tom:\s*<[^>]+>([^<]+)/);
      const tempoMatch = html.match(/(\d+)\s*BPM/i);

      // Parsear secciones
      const sections = this.parseSections(content);

      // Extraer acordes únicos
      const allChords = this.extractChords(content);

      const song = {
        title: title,
        artist: artist,
        key: keyMatch ? keyMatch[1].trim() : null,
        tempo: tempoMatch ? parseInt(tempoMatch[1]) : null,
        time_signature: '4/4',
        tuning: 'Standard (EADGBE)',
        difficulty: this.guessDifficulty(allChords),
        sections: sections,
        source_url: url,
        status: 'pending'
      };

      this.stats.scraped++;
      return song;

    } catch (error) {
      console.log(`   ❌ Error scraping ${title}: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Parsea el contenido en secciones
   */
  parseSections(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = { name: 'Intro', lines: [] };

    const sectionKeywords = /^\s*\[?\s*(intro|verse|verso|chorus|coro|estribillo|bridge|puente|outro|final|solo|pre-chorus|pre-coro|refr[aã]o?|primera|segunda|tercera|\d+[ªº]?\s*(vez|parte))/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detectar inicio de sección
      const sectionMatch = trimmed.match(sectionKeywords);
      if (sectionMatch || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        const sectionName = trimmed.replace(/[\[\]]/g, '').trim();
        currentSection = {
          name: this.normalizeSectionName(sectionName),
          lines: []
        };
        continue;
      }

      if (!trimmed) continue;

      // Detectar si es línea de acordes o letra
      const isChordLine = this.isChordOnlyLine(trimmed);
      const nextLine = lines[i + 1]?.trim() || '';
      const nextIsChordLine = this.isChordOnlyLine(nextLine);

      if (isChordLine && !nextIsChordLine && nextLine) {
        // Línea de acordes seguida de letra
        currentSection.lines.push({
          chords: this.parseChordPositions(line),
          lyrics: nextLine
        });
        i++; // Saltar la línea de letra
      } else if (isChordLine) {
        // Solo acordes
        currentSection.lines.push({
          chords: this.parseChordPositions(line),
          lyrics: ''
        });
      } else {
        // Solo letra
        currentSection.lines.push({
          chords: [],
          lyrics: trimmed
        });
      }
    }

    if (currentSection.lines.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Normaliza nombre de sección
   */
  normalizeSectionName(name) {
    const mappings = {
      'intro': 'Intro',
      'verse': 'Verso',
      'verso': 'Verso',
      'chorus': 'Coro',
      'coro': 'Coro',
      'estribillo': 'Coro',
      'refrão': 'Coro',
      'refrao': 'Coro',
      'bridge': 'Puente',
      'puente': 'Puente',
      'outro': 'Outro',
      'final': 'Final',
      'solo': 'Solo',
      'pre-chorus': 'Pre-Coro',
      'pre-coro': 'Pre-Coro'
    };

    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(mappings)) {
      if (lower.includes(key)) {
        return value;
      }
    }

    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Detecta si una línea es solo acordes
   */
  isChordOnlyLine(line) {
    if (!line || line.trim().length === 0) return false;

    const words = line.trim().split(/\s+/);
    const chordPattern = /^[A-G][#b]?(m|maj|min|aug|dim|sus|add|7|9|11|13|6|M)?[0-9]?(\/[A-G][#b]?)?$/;

    let chordCount = 0;
    for (const word of words) {
      if (chordPattern.test(word)) {
        chordCount++;
      }
    }

    return words.length > 0 && (chordCount / words.length) >= 0.6;
  }

  /**
   * Parsea posiciones de acordes en una línea
   */
  parseChordPositions(line) {
    const positions = [];
    const chordPattern = /([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|7|9|11|13|6|M)?(?:[0-9])?(?:\/[A-G][#b]?)?)/g;

    let match;
    while ((match = chordPattern.exec(line)) !== null) {
      positions.push({
        chord: match[1],
        position: match.index
      });
    }

    return positions;
  }

  /**
   * Extrae todos los acordes únicos
   */
  extractChords(content) {
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|7|9|11|13|6)?(?:[0-9])?(?:\/[A-G][#b]?)?)\b/g;
    const chords = new Set();
    let match;

    while ((match = chordPattern.exec(content)) !== null) {
      chords.add(match[1]);
    }

    return [...chords];
  }

  /**
   * Adivina dificultad basado en acordes
   */
  guessDifficulty(chords) {
    const hardChords = chords.filter(c =>
      c.includes('dim') || c.includes('aug') || c.includes('sus') ||
      c.includes('9') || c.includes('11') || c.includes('13') ||
      c.includes('/') || c.length > 3
    );

    if (hardChords.length > 5 || chords.length > 15) return 'advanced';
    if (hardChords.length > 2 || chords.length > 8) return 'intermediate';
    return 'beginner';
  }

  /**
   * Sube una canción al API
   */
  async uploadSong(song) {
    try {
      const { data, status } = await this.fetch(`${API_URL}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(song)
      });

      const response = JSON.parse(data);

      if (status === 201 || status === 200) {
        this.stats.imported++;
        return { success: true, id: response.id };
      } else if (response.error?.includes('duplicate') || response.error?.includes('already exists')) {
        this.stats.duplicates++;
        return { success: false, duplicate: true };
      } else {
        console.log(`   ⚠️  Error API: ${response.error || 'Unknown'}`);
        this.stats.errors++;
        return { success: false, error: response.error };
      }

    } catch (error) {
      console.log(`   ❌ Error upload: ${error.message}`);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Procesa un artista completo
   */
  async processArtist(artistSlug, maxSongs = 20) {
    const songs = await this.getArtistSongs(artistSlug);
    const toProcess = songs.slice(0, maxSongs);

    console.log(`   📥 Procesando ${toProcess.length} de ${songs.length} canciones...`);

    for (const songInfo of toProcess) {
      process.stdout.write(`   ♪ ${songInfo.title.substring(0, 40)}... `);

      const song = await this.scrapeSong(songInfo);

      if (song && song.sections.length > 0) {
        const result = await this.uploadSong(song);
        if (result.success) {
          console.log('✅');
        } else if (result.duplicate) {
          console.log('⏭️  (duplicado)');
        } else {
          console.log('❌');
        }
      } else {
        console.log('⏭️  (sin contenido)');
      }

      // Pausa para no saturar
      await this.sleep(1500);
    }
  }

  /**
   * Ejecuta importación masiva
   */
  async run(artists = DEFAULT_ARTISTS, songsPerArtist = 15) {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('🎸 BLACK SHEEP - BATCH IMPORT');
    console.log('════════════════════════════════════════════════════════');
    console.log(`📊 Artistas: ${artists.length}`);
    console.log(`📊 Canciones por artista: ${songsPerArtist}`);
    console.log(`📊 Máximo estimado: ~${artists.length * songsPerArtist} canciones`);
    console.log(`🌐 API: ${API_URL}`);
    console.log('════════════════════════════════════════════════════════\n');

    const startTime = Date.now();

    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];
      console.log(`\n[${i + 1}/${artists.length}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      await this.processArtist(artist, songsPerArtist);

      // Pausa entre artistas
      if (i < artists.length - 1) {
        await this.sleep(3000);
      }
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);

    console.log('\n════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN FINAL');
    console.log('════════════════════════════════════════════════════════');
    console.log(`✅ Importadas:   ${this.stats.imported}`);
    console.log(`⏭️  Duplicados:   ${this.stats.duplicates}`);
    console.log(`❌ Errores:      ${this.stats.errors}`);
    console.log(`📥 Scrapeadas:   ${this.stats.scraped}`);
    console.log(`⏱️  Tiempo:       ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
    console.log('════════════════════════════════════════════════════════\n');

    return this.stats;
  }

  formatSlug(slug) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecución
if (require.main === module) {
  const arg1 = process.argv[2];
  const arg2 = process.argv[3];

  let artists = DEFAULT_ARTISTS;
  let limit = 15;

  if (arg1 && !arg1.startsWith('-')) {
    artists = arg1.split(',').map(a => a.trim());
  }

  if (arg2) {
    limit = parseInt(arg2);
  }

  if (arg1 === '--help' || arg1 === '-h') {
    console.log(`
🎸 Batch Import API - Importa canciones masivamente

Uso:
  node batch-import-api.js                              # Artistas predefinidos (~50), 15 canciones c/u
  node batch-import-api.js "oasis,coldplay" 20          # Artistas custom, 20 canciones c/u
  node batch-import-api.js --all 10                     # Todos los predefinidos, 10 canciones c/u

Variables de entorno:
  ADMIN_API_KEY    API key para autenticación (default: admin123)

Ejemplo para ~500 canciones:
  node batch-import-api.js --all 10
    `);
    process.exit(0);
  }

  if (arg1 === '--all') {
    limit = arg2 ? parseInt(arg2) : 10;
  }

  const importer = new BatchImporter();
  importer.run(artists, limit);
}

module.exports = BatchImporter;
