/**
 * AcordesWeb Scraper - Acceso directo a API
 *
 * Extrae tablaturas de acordesweb.com usando su API JSON interna.
 * No requiere navegador headless, usa fetch directo a sus endpoints.
 *
 * Uso:
 *   node acordesweb-scraper.js "https://acordesweb.com/cancion/peso-pluma/rubicon"
 *   node acordesweb-scraper.js --artist "peso-pluma" --song "rubicon"
 *   node acordesweb-scraper.js --batch urls.txt
 *
 * API Endpoint: https://acordesweb.com/tema_json2.php
 * Parámetros: artista, tema, transp (transposición)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class AcordesWebScraper {
  constructor() {
    this.outputDir = path.join(__dirname, 'extracted-tabs');
    this.apiBase = 'https://acordesweb.com/tema_json2.php';

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Extrae artista y tema de una URL de acordesweb
   * https://acordesweb.com/cancion/peso-pluma/rubicon → { artist: 'peso-pluma', song: 'rubicon' }
   */
  parseURL(url) {
    const match = url.match(/acordesweb\.com\/cancion\/([^\/]+)\/([^\/\?]+)/);
    if (!match) {
      throw new Error('URL inválida. Formato esperado: https://acordesweb.com/cancion/{artista}/{cancion}');
    }

    return {
      artist: match[1],
      song: match[2]
    };
  }

  /**
   * Hace petición a la API de acordesweb
   */
  async fetchFromAPI(artist, song, transposition = 0) {
    const params = new URLSearchParams({
      artista: artist,
      tema: song,
      transp: transposition.toString(),
      skin: 'bw' // black/white theme
    });

    const url = `${this.apiBase}?${params.toString()}`;

    console.log(`🌐 Fetching: ${url}`);

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (error) {
            reject(new Error(`Error parseando JSON: ${error.message}`));
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Decodifica el contenido base64 de la respuesta
   */
  decodeChordContent(apiResponse) {
    if (!apiResponse || !apiResponse.cancion || !apiResponse.cancion.acorde) {
      throw new Error('Respuesta de API inválida o sin contenido de acordes');
    }

    // Decodifica base64
    const encodedContent = apiResponse.cancion.acorde;
    const decodedContent = Buffer.from(encodedContent, 'base64').toString('utf-8');

    return decodedContent;
  }

  /**
   * Parsea el contenido HTML de acordes y lo estructura
   */
  parseChordHTML(html, metadata) {
    // Limpia HTML básico
    let clean = html
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<!--.*?-->/gs, '');

    // Extrae acordes de tags <a class="acord">
    const chordPattern = /<a[^>]*class="acord"[^>]*>([^<]+)<\/a>/g;
    const chords = [];
    let match;

    while ((match = chordPattern.exec(clean)) !== null) {
      const chord = match[1].trim();
      if (chord && !chords.includes(chord)) {
        chords.push(chord);
      }
    }

    // Reemplaza tags de acordes con marcadores temporales para facilitar parsing
    clean = clean.replace(/<a[^>]*class="acord"[^>]*>([^<]+)<\/a>/g, '[$1]');

    // Limpia resto de HTML
    clean = clean
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    // Detecta secciones (Intro, Verso, Coro, etc.)
    const sections = this.detectSections(clean);

    // Extrae TODOS los acordes únicos de todas las secciones
    const allChords = new Set();
    sections.forEach(section => {
      section.lines.forEach(line => {
        if (line.chords && line.chords.length > 0) {
          line.chords.forEach(c => allChords.add(c.chord));
        }
      });
    });

    const uniqueChords = Array.from(allChords);

    return {
      title: metadata.title || 'Unknown',
      artist: metadata.artist || 'Unknown',
      sourceUrl: metadata.sourceUrl || '',
      chords: uniqueChords,
      key: this.detectKey(uniqueChords),
      sections: sections,
      rawText: clean
    };
  }

  /**
   * Detecta secciones en el texto (Intro, Verso, Coro, etc.)
   */
  detectSections(text) {
    const lines = text.split('\n');
    const sections = [];
    let currentSection = null;

    const sectionMarkers = /^(intro|verso|coro|estribillo|puente|bridge|solo|outro|final)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      // Detecta marcador de sección
      const sectionMatch = line.match(sectionMarkers);

      if (sectionMatch) {
        // Guarda sección anterior si existe
        if (currentSection && currentSection.lines.length > 0) {
          sections.push(currentSection);
        }

        // Inicia nueva sección
        currentSection = {
          name: this.normalizeSectionName(sectionMatch[1]),
          lines: []
        };
      } else if (currentSection) {
        // Parsea línea con acordes y letras
        const parsedLine = this.parseChordLine(line);
        if (parsedLine) {
          currentSection.lines.push(parsedLine);
        }
      } else {
        // Línea antes de primera sección definida
        if (!currentSection) {
          currentSection = {
            name: 'Intro',
            lines: []
          };
        }

        const parsedLine = this.parseChordLine(line);
        if (parsedLine) {
          currentSection.lines.push(parsedLine);
        }
      }
    }

    // Agrega última sección
    if (currentSection && currentSection.lines.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Parsea una línea que puede tener acordes intercalados o en línea separada
   * Formatos soportados:
   * 1. "[Am]Hola [G]mundo" → acordes entre []
   * 2. "Am      G      F" → línea solo de acordes
   * 3. "Dm                                     C7" → acordes con espaciado
   */
  parseChordLine(line) {
    // Patrón 1: Acordes entre corchetes [Am]
    const bracketPattern = /\[([^\]]+)\]/g;
    let chords = [];
    let lyrics = line;
    let match;
    let offset = 0;

    // Busca acordes entre []
    while ((match = bracketPattern.exec(line)) !== null) {
      chords.push({
        chord: match[1],
        position: match.index - offset
      });
      offset += match[0].length;
    }

    // Remueve marcadores []
    lyrics = lyrics.replace(/\[([^\]]+)\]/g, '').trim();

    if (chords.length > 0) {
      return {
        chords: chords,
        lyrics: lyrics || ''
      };
    }

    // Patrón 2: Detectar si la línea es SOLO acordes (sin letras)
    // Ejemplo: "Dm                                     C7"
    const chordOnlyPattern = /^([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]?(?:\/[A-G][#b]?)?(?:\s+|$))+$/;

    if (chordOnlyPattern.test(line.trim())) {
      // Extrae todos los acordes con sus posiciones
      const chordRegex = /([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)/g;
      let chordMatch;

      while ((chordMatch = chordRegex.exec(line)) !== null) {
        chords.push({
          chord: chordMatch[1],
          position: chordMatch.index
        });
      }

      return {
        chords: chords,
        lyrics: '' // Línea solo de acordes
      };
    }

    // Patrón 3: Acordes al inicio + letras después
    // Ejemplo: "C7                             Dm"
    // O líneas normales con letras
    const firstWordChordPattern = /^([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\s+(.+)$/;
    const firstWordMatch = line.match(firstWordChordPattern);

    if (firstWordMatch) {
      return {
        chords: [{ chord: firstWordMatch[1], position: 0 }],
        lyrics: firstWordMatch[2].trim()
      };
    }

    // Línea normal de letras (sin acordes detectados)
    if (line.trim()) {
      return {
        chords: [],
        lyrics: line.trim()
      };
    }

    return null;
  }

  /**
   * Normaliza nombres de secciones
   */
  normalizeSectionName(name) {
    const normalized = {
      'intro': 'Intro',
      'verso': 'Verse',
      'coro': 'Chorus',
      'estribillo': 'Chorus',
      'puente': 'Bridge',
      'bridge': 'Bridge',
      'solo': 'Solo',
      'outro': 'Outro',
      'final': 'Outro'
    };

    return normalized[name.toLowerCase()] || name;
  }

  /**
   * Detecta tonalidad principal basándose en acordes
   */
  detectKey(chords) {
    if (!chords || chords.length === 0) return null;

    // Cuenta acordes mayores
    const majorChords = {};
    chords.forEach(chord => {
      const root = chord.match(/^([A-G][#b]?)/);
      if (root && !chord.includes('m')) {
        majorChords[root[1]] = (majorChords[root[1]] || 0) + 1;
      }
    });

    // Retorna el más frecuente
    let maxCount = 0;
    let detectedKey = null;

    for (const [key, count] of Object.entries(majorChords)) {
      if (count > maxCount) {
        maxCount = count;
        detectedKey = key;
      }
    }

    return detectedKey;
  }

  /**
   * Scrapea una canción por URL
   */
  async scrapeByURL(url) {
    console.log(`\n📋 Scrapeando: ${url}`);

    try {
      // Parsea URL
      const { artist, song } = this.parseURL(url);
      console.log(`   Artista: ${artist}`);
      console.log(`   Canción: ${song}`);

      // Fetch de API
      const apiResponse = await this.fetchFromAPI(artist, song);

      // Decodifica contenido
      const htmlContent = this.decodeChordContent(apiResponse);

      // Parsea y estructura
      const structured = this.parseChordHTML(htmlContent, {
        title: song.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        artist: artist.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        sourceUrl: url
      });

      // Guarda a archivo
      const filename = `${song}-${Date.now()}.json`;
      const filepath = path.join(this.outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(structured, null, 2));

      console.log(`✅ Guardado: ${filename}`);
      console.log(`   Acordes: ${structured.chords.join(', ')}`);
      console.log(`   Secciones: ${structured.sections.length}`);
      console.log(`   Tonalidad detectada: ${structured.key || 'N/A'}`);

      return structured;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Scrapea múltiples URLs desde un archivo
   */
  async scrapeBatch(filepath) {
    const urls = fs.readFileSync(filepath, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    console.log(`📚 Scrapeando ${urls.length} URLs...\n`);

    const results = [];
    for (const url of urls) {
      const result = await this.scrapeByURL(url);
      results.push(result);

      // Delay para no saturar el servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successful = results.filter(r => r !== null).length;
    console.log(`\n✅ Completado: ${successful}/${urls.length} exitosos`);

    return results;
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const scraper = new AcordesWebScraper();

  if (args.length === 0) {
    console.log(`
📖 Uso:
  node acordesweb-scraper.js "URL"
  node acordesweb-scraper.js --batch archivo.txt
  node acordesweb-scraper.js --artist "artista" --song "cancion"

Ejemplos:
  node acordesweb-scraper.js "https://acordesweb.com/cancion/peso-pluma/rubicon"
  node acordesweb-scraper.js --artist "peso-pluma" --song "lady-gaga"
  node acordesweb-scraper.js --batch urls-acordesweb.txt
    `);
    process.exit(0);
  }

  if (args[0] === '--batch') {
    scraper.scrapeBatch(args[1]);
  } else if (args[0] === '--artist' && args[2] === '--song') {
    const url = `https://acordesweb.com/cancion/${args[1]}/${args[3]}`;
    scraper.scrapeByURL(url);
  } else {
    scraper.scrapeByURL(args[0]);
  }
}

module.exports = AcordesWebScraper;