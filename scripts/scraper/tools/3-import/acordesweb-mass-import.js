/**
 * AcordesWeb Mass Import - Importación masiva por artista
 *
 * Extrae el catálogo completo de canciones de artistas específicos
 * desde acordesweb.com y las importa a nuestra base de datos.
 *
 * Estrategias:
 * 1. Scraping de página de artista (lista de canciones)
 * 2. Uso directo de API JSON para cada canción
 * 3. Importación automática via batch-import-api.js
 *
 * Uso:
 *   node acordesweb-mass-import.js "junior-h" "natanael-cano" "peso-pluma"
 *   node acordesweb-mass-import.js --file artists.txt
 *   node acordesweb-mass-import.js --genre corrido --limit 50
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const AcordesWebScraper = require('./acordesweb-scraper');

class MassImporter {
  constructor() {
    this.scraper = new AcordesWebScraper();
    this.outputDir = path.join(__dirname, 'mass-import-output');
    this.catalogCache = path.join(__dirname, 'catalog-cache.json');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.stats = {
      artists: 0,
      songsFound: 0,
      songsScraped: 0,
      errors: 0
    };
  }

  /**
   * Obtiene el catálogo de canciones de un artista
   * scrapeando su página de artista
   */
  async getArtistCatalog(artistSlug) {
    console.log(`\n📂 Obteniendo catálogo de: ${artistSlug}`);

    const url = `https://acordesweb.com/artista/${artistSlug}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let html = '';

        res.on('data', (chunk) => {
          html += chunk;
        });

        res.on('end', () => {
          try {
            const songs = this.parseArtistPage(html, artistSlug);
            console.log(`   ✅ Encontradas: ${songs.length} canciones`);
            resolve(songs);
          } catch (error) {
            console.error(`   ❌ Error parseando catálogo: ${error.message}`);
            resolve([]);
          }
        });
      }).on('error', (err) => {
        console.error(`   ❌ Error HTTP: ${err.message}`);
        resolve([]);
      });
    });
  }

  /**
   * Parsea la página de artista y extrae URLs de canciones
   */
  parseArtistPage(html, artistSlug) {
    const songs = [];

    // Patrón para links de canciones: /cancion/{artista}/{titulo}
    const songPattern = new RegExp(`/cancion/${artistSlug}/([^"'>\\s]+)`, 'g');
    const matches = html.matchAll(songPattern);

    const seen = new Set();

    for (const match of matches) {
      const songSlug = match[1];

      // Evita duplicados
      if (seen.has(songSlug)) continue;
      seen.add(songSlug);

      songs.push({
        artist: artistSlug,
        song: songSlug,
        url: `https://acordesweb.com/cancion/${artistSlug}/${songSlug}`,
        pdfUrl: `https://acordesweb.com/descarga-pdf/${artistSlug}/${songSlug}/0/0/0.pdf`
      });
    }

    return songs;
  }

  /**
   * Importa todas las canciones de un artista
   */
  async importArtist(artistSlug, limit = null) {
    console.log(`\n🎸 Importando artista: ${artistSlug}`);
    this.stats.artists++;

    try {
      // Obtiene catálogo
      const catalog = await this.getArtistCatalog(artistSlug);
      this.stats.songsFound += catalog.length;

      if (catalog.length === 0) {
        console.log(`   ⚠️ No se encontraron canciones`);
        return [];
      }

      // Aplica límite si se especificó
      const songsToImport = limit ? catalog.slice(0, limit) : catalog;
      console.log(`\n📥 Importando ${songsToImport.length} canciones...`);

      const results = [];

      for (let i = 0; i < songsToImport.length; i++) {
        const song = songsToImport[i];

        console.log(`\n[${i + 1}/${songsToImport.length}] ${song.song}`);

        try {
          const result = await this.scraper.scrapeByURL(song.url);

          if (result) {
            results.push({
              ...result,
              pdfUrl: song.pdfUrl
            });
            this.stats.songsScraped++;
          } else {
            this.stats.errors++;
          }
        } catch (error) {
          console.error(`   ❌ Error: ${error.message}`);
          this.stats.errors++;
        }

        // Delay para no saturar el servidor
        if (i < songsToImport.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Guarda catálogo completo del artista
      const artistFile = path.join(this.outputDir, `${artistSlug}-catalog.json`);
      fs.writeFileSync(artistFile, JSON.stringify({
        artist: artistSlug,
        totalSongs: catalog.length,
        importedSongs: results.length,
        songs: results
      }, null, 2));

      console.log(`\n✅ Catálogo guardado: ${artistFile}`);

      return results;

    } catch (error) {
      console.error(`❌ Error importando artista: ${error.message}`);
      this.stats.errors++;
      return [];
    }
  }

  /**
   * Importa múltiples artistas
   */
  async importMultipleArtists(artists, limitPerArtist = null) {
    console.log(`\n🎵 Importación masiva iniciada`);
    console.log(`   Artistas: ${artists.length}`);
    console.log(`   Límite por artista: ${limitPerArtist || 'Sin límite'}\n`);

    const allResults = [];

    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i].trim();

      if (!artist || artist.startsWith('#')) continue;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`Artista ${i + 1}/${artists.length}: ${artist}`);
      console.log('='.repeat(60));

      const results = await this.importArtist(artist, limitPerArtist);
      allResults.push(...results);

      // Delay entre artistas
      if (i < artists.length - 1) {
        console.log(`\n⏳ Esperando 3 segundos antes del siguiente artista...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    this.printSummary();

    return allResults;
  }

  /**
   * Genera URLs sugeridas para artistas populares
   */
  generatePopularArtistsURLs(genre = 'all') {
    const genres = {
      corrido: [
        'peso-pluma', 'junior-h', 'natanael-cano', 'luis-r-conriquez',
        'grupo-frontera', 'fuerza-regida', 'los-tucanes-de-tijuana',
        'calibre-50', 'banda-ms', 'el-fantasma'
      ],
      rock: [
        'soda-stereo', 'caifanes', 'mana', 'heroes-del-silencio',
        'el-tri', 'molotov', 'cafe-tacvba', 'los-fabulosos-cadillacs',
        'enanitos-verdes', 'la-ley'
      ],
      pop: [
        'shakira', 'juanes', 'alejandro-sanz', 'luis-miguel',
        'jesse-joy', 'camila', 'reik', 'sin-bandera'
      ],
      metal: [
        'metallica', 'iron-maiden', 'megadeth', 'slayer',
        'black-sabbath', 'pantera', 'sepultura', 'tool'
      ],
      all: []
    };

    if (genre === 'all') {
      return [].concat(...Object.values(genres));
    }

    return genres[genre] || [];
  }

  /**
   * Imprime resumen de la importación
   */
  printSummary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(60));
    console.log(`Artistas procesados:  ${this.stats.artists}`);
    console.log(`Canciones encontradas: ${this.stats.songsFound}`);
    console.log(`Canciones scrapeadas:  ${this.stats.songsScraped}`);
    console.log(`Errores:              ${this.stats.errors}`);
    console.log(`Tasa de éxito:        ${((this.stats.songsScraped / this.stats.songsFound) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
  }

  /**
   * Guarda lista de URLs para batch-import-api
   */
  generateBatchImportFile(songs, filename = 'batch-import-urls.txt') {
    const urls = songs.map(s => s.sourceUrl).join('\n');
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, urls);
    console.log(`\n📝 Archivo batch generado: ${filepath}`);
    console.log(`   Usar con: node batch-import-api.js --batch ${filepath}`);

    return filepath;
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const importer = new MassImporter();

  if (args.length === 0) {
    console.log(`
📖 Uso:

1. Importar artistas específicos:
   node acordesweb-mass-import.js "peso-pluma" "junior-h" "natanael-cano"

2. Importar desde archivo:
   node acordesweb-mass-import.js --file artists.txt

3. Importar por género (con límite):
   node acordesweb-mass-import.js --genre corrido --limit 10

4. Generar lista de artistas populares:
   node acordesweb-mass-import.js --suggest corrido
   node acordesweb-mass-import.js --suggest rock
   node acordesweb-mass-import.js --suggest metal

Ejemplos:
  # Importa 5 canciones de cada artista
  node acordesweb-mass-import.js "peso-pluma" "junior-h" --limit 5

  # Importa 10 artistas de corridos (10 canciones c/u)
  node acordesweb-mass-import.js --genre corrido --limit 10

  # Muestra artistas sugeridos de rock
  node acordesweb-mass-import.js --suggest rock
    `);
    process.exit(0);
  }

  // Manejo de comandos
  (async () => {
    if (args[0] === '--suggest') {
      const genre = args[1] || 'all';
      const artists = importer.generatePopularArtistsURLs(genre);

      console.log(`\n🎵 Artistas sugeridos - Género: ${genre.toUpperCase()}`);
      console.log('='.repeat(60));
      artists.forEach((artist, i) => {
        console.log(`${(i + 1).toString().padStart(2, '0')}. ${artist}`);
      });
      console.log(`\nTotal: ${artists.length} artistas`);
      console.log(`\nPara importar: node acordesweb-mass-import.js "${artists.slice(0, 3).join('" "')}"`);

    } else if (args[0] === '--file') {
      const filepath = args[1];
      const artists = fs.readFileSync(filepath, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      const limitIndex = args.indexOf('--limit');
      const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;

      await importer.importMultipleArtists(artists, limit);

    } else if (args[0] === '--genre') {
      const genre = args[1];
      const limitIndex = args.indexOf('--limit');
      const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 10;

      const artists = importer.generatePopularArtistsURLs(genre);

      if (artists.length === 0) {
        console.error(`❌ Género desconocido: ${genre}`);
        console.log(`Géneros disponibles: corrido, rock, pop, metal, all`);
        process.exit(1);
      }

      await importer.importMultipleArtists(artists, limit);

    } else {
      // Lista de artistas directa
      const limitIndex = args.indexOf('--limit');
      const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;

      const artists = args.filter(arg => !arg.startsWith('--') && arg !== limit?.toString());

      await importer.importMultipleArtists(artists, limit);
    }
  })();
}

module.exports = MassImporter;