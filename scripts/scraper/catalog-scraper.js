/**
 * Catalog Scraper - Extrae listados masivos de canciones
 *
 * Fuentes soportadas:
 * - CifraClub: /artistas/, /estilos/, /canciones-mais-acessadas/
 * - AcordesWeb: /canciones, /artistas
 * - Ultimate Guitar: /artists/, /tabs/top/
 *
 * Output: URLs de tabs individuales para procesar con tab-scraper-v2.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class CatalogScraper {
  constructor() {
    this.outputDir = path.join(__dirname, 'catalog-output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  }

  /**
   * Fetch HTML desde URL con headers personalizados
   */
  async fetchHTML(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
          'Accept-Encoding': 'identity',
          'Connection': 'keep-alive'
        }
      };

      protocol.get(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Extrae URLs de tabs desde CifraClub
   * Ejemplo: https://www.cifraclub.com.br/artistas/
   */
  async scrapeCifraClubArtists(startLetter = 'a') {
    const baseUrl = `https://www.cifraclub.com.br/letras/${startLetter}/`;
    console.log(`\n🎵 Scraping CifraClub letra: ${startLetter.toUpperCase()}`);

    try {
      const html = await this.fetchHTML(baseUrl);

      // Patrón para artistas: <a href="/artista/">Nombre</a>
      const artistPattern = /<a\s+href="\/([^"\/]+)\/"[^>]*>([^<]+)<\/a>/g;
      const artists = [];
      let match;

      while ((match = artistPattern.exec(html)) !== null) {
        const slug = match[1];
        const name = match[2].trim();

        // Evita enlaces de navegación y categorías
        if (!slug.match(/^(letras|estilos|top|mais)/)) {
          artists.push({
            name: name,
            slug: slug,
            url: `https://www.cifraclub.com.br/${slug}/`
          });
        }
      }

      console.log(`   ✅ ${artists.length} artistas encontrados`);
      return artists;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return [];
    }
  }

  /**
   * Extrae canciones de un artista en CifraClub
   */
  async scrapeCifraClubArtist(artistSlug) {
    const url = `https://www.cifraclub.com.br/${artistSlug}/`;
    console.log(`\n👤 Scraping artista: ${artistSlug}`);

    try {
      const html = await this.fetchHTML(url);

      // Patrón para canciones: <a href="/artista/cancion/">Título</a>
      const songPattern = new RegExp(`<a\\s+href="\\/${artistSlug}\\/([^"\\/]+)\\/"[^>]*>([^<]+)<\\/a>`, 'g');
      const songs = [];
      let match;

      while ((match = songPattern.exec(html)) !== null) {
        const songSlug = match[1];
        const title = match[2].trim();

        songs.push({
          title: title,
          artist: artistSlug,
          url: `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`
        });
      }

      console.log(`   ✅ ${songs.length} canciones encontradas`);
      return songs;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return [];
    }
  }

  /**
   * Extrae listado de AcordesWeb
   * Ejemplo: https://acordesweb.com/canciones
   */
  async scrapeAcordesWebCatalog(page = 1) {
    const url = `https://acordesweb.com/canciones?page=${page}`;
    console.log(`\n🎸 Scraping AcordesWeb página: ${page}`);

    try {
      const html = await this.fetchHTML(url);

      // Patrón para canciones: <a href="/artista/cancion">
      const songPattern = /<a\s+href="\/([^"\/]+)\/([^"\/]+)"[^>]*>/g;
      const songs = [];
      let match;

      while ((match = songPattern.exec(html)) !== null) {
        const artistSlug = match[1];
        const songSlug = match[2];

        // Evita enlaces de navegación
        if (!artistSlug.match(/^(canciones|artistas|estilos|top)/)) {
          songs.push({
            artist: this.formatSlug(artistSlug),
            title: this.formatSlug(songSlug),
            url: `https://acordesweb.com/${artistSlug}/${songSlug}`
          });
        }
      }

      // Elimina duplicados
      const unique = this.deduplicateSongs(songs);

      console.log(`   ✅ ${unique.length} canciones únicas encontradas`);
      return unique;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return [];
    }
  }

  /**
   * Scraping masivo de CifraClub (todas las letras A-Z)
   */
  async scrapeCifraClubFull() {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const allArtists = [];

    console.log('\n🎼 INICIANDO SCRAPING MASIVO DE CIFRACLUB\n');

    for (const letter of letters) {
      const artists = await this.scrapeCifraClubArtists(letter);
      allArtists.push(...artists);

      // Pausa entre requests
      await this.sleep(2000);
    }

    // Guarda listado de artistas
    const artistsFile = path.join(this.outputDir, 'cifraclub-artists.json');
    fs.writeFileSync(artistsFile, JSON.stringify(allArtists, null, 2));

    console.log(`\n📦 Total artistas: ${allArtists.length}`);
    console.log(`📁 Guardado en: ${artistsFile}`);

    return allArtists;
  }

  /**
   * Extrae canciones de múltiples artistas
   */
  async scrapeCifraClubSongs(artistSlugs, limit = 10) {
    const allSongs = [];
    const slugs = artistSlugs.slice(0, limit);

    console.log(`\n🎵 Extrayendo canciones de ${slugs.length} artistas...\n`);

    for (const slug of slugs) {
      const songs = await this.scrapeCifraClubArtist(slug);
      allSongs.push(...songs);

      // Pausa entre requests
      await this.sleep(3000);
    }

    // Guarda canciones
    const songsFile = path.join(this.outputDir, 'cifraclub-songs.json');
    fs.writeFileSync(songsFile, JSON.stringify(allSongs, null, 2));

    console.log(`\n📦 Total canciones: ${allSongs.length}`);
    console.log(`📁 Guardado en: ${songsFile}`);

    // Genera archivo de URLs para tab-scraper-v2
    const urlsFile = path.join(this.outputDir, 'cifraclub-urls.txt');
    const urls = allSongs.map(s => s.url).join('\n');
    fs.writeFileSync(urlsFile, urls);

    console.log(`📝 URLs listas para scraping: ${urlsFile}`);
    console.log(`\n💡 Ahora ejecuta:`);
    console.log(`   node tab-scraper-v2.js --batch ${urlsFile}`);

    return allSongs;
  }

  /**
   * Scraping masivo de AcordesWeb (múltiples páginas)
   */
  async scrapeAcordesWebFull(maxPages = 10) {
    const allSongs = [];

    console.log(`\n🎼 INICIANDO SCRAPING MASIVO DE ACORDESWEB (${maxPages} páginas)\n`);

    for (let page = 1; page <= maxPages; page++) {
      const songs = await this.scrapeAcordesWebCatalog(page);
      allSongs.push(...songs);

      if (songs.length === 0) {
        console.log(`   ⚠️  Página ${page} vacía - deteniendo`);
        break;
      }

      // Pausa entre requests
      await this.sleep(3000);
    }

    // Elimina duplicados globales
    const unique = this.deduplicateSongs(allSongs);

    // Guarda canciones
    const songsFile = path.join(this.outputDir, 'acordesweb-songs.json');
    fs.writeFileSync(songsFile, JSON.stringify(unique, null, 2));

    console.log(`\n📦 Total canciones únicas: ${unique.length}`);
    console.log(`📁 Guardado en: ${songsFile}`);

    // Genera archivo de URLs
    const urlsFile = path.join(this.outputDir, 'acordesweb-urls.txt');
    const urls = unique.map(s => s.url).join('\n');
    fs.writeFileSync(urlsFile, urls);

    console.log(`📝 URLs listas: ${urlsFile}`);

    return unique;
  }

  /**
   * Utilidades
   */
  formatSlug(slug) {
    return slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  deduplicateSongs(songs) {
    const seen = new Set();
    return songs.filter(song => {
      const key = `${song.artist}|${song.title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = CatalogScraper;

// Ejecución directa
if (require.main === module) {
  const scraper = new CatalogScraper();
  const command = process.argv[2];
  const arg = process.argv[3];

  const showHelp = () => {
    console.log(`
🎸 Catalog Scraper - Extractor masivo de listados

📖 Comandos disponibles:

  Extraer artistas de CifraClub (A-Z completo):
    node catalog-scraper.js cifraclub-artists

  Extraer canciones de artistas específicos:
    node catalog-scraper.js cifraclub-songs oasis,the-beatles,led-zeppelin

  Extraer catálogo de AcordesWeb (10 páginas):
    node catalog-scraper.js acordesweb

  Extraer catálogo de AcordesWeb (custom páginas):
    node catalog-scraper.js acordesweb 50

📦 Output:
  - catalog-output/[site]-artists.json  → Listado de artistas
  - catalog-output/[site]-songs.json    → Listado de canciones
  - catalog-output/[site]-urls.txt      → URLs listas para tab-scraper-v2

💡 Flujo recomendado:
  1. node catalog-scraper.js cifraclub-artists
  2. node catalog-scraper.js cifraclub-songs oasis,the-beatles
  3. node tab-scraper-v2.js --batch catalog-output/cifraclub-urls.txt
    `);
  };

  if (!command) {
    showHelp();
  } else if (command === 'cifraclub-artists') {
    scraper.scrapeCifraClubFull();
  } else if (command === 'cifraclub-songs') {
    const artists = arg ? arg.split(',') : ['oasis', 'the-beatles', 'led-zeppelin'];
    scraper.scrapeCifraClubSongs(artists, 999);
  } else if (command === 'acordesweb') {
    const pages = arg ? parseInt(arg) : 10;
    scraper.scrapeAcordesWebFull(pages);
  } else {
    console.log(`❌ Comando desconocido: ${command}\n`);
    showHelp();
  }
}
