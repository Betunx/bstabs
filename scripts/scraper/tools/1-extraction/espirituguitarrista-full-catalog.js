/**
 * Espíritu Guitarrista - Full Catalog Scraper
 *
 * Extrae TODAS las canciones de TODOS los artistas del sitio.
 *
 * Proceso:
 * 1. Extrae lista de artistas de /artist/
 * 2. Para cada artista, extrae sus canciones
 * 3. Para cada canción, descarga imágenes
 *
 * Uso:
 *   node espirituguitarrista-full-catalog.js
 *   node espirituguitarrista-full-catalog.js --artists-only
 *   node espirituguitarrista-full-catalog.js --resume
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class EspirituGuitarristaFullCatalog {
  constructor() {
    this.baseUrl = 'https://www.espirituguitarrista.com';
    this.outputDir = path.join(__dirname, '../../output/espirituguitarrista-catalog');
    this.progressFile = path.join(this.outputDir, 'progress.json');

    this.stats = {
      artists: 0,
      songs: 0,
      images: 0,
      errors: 0,
      skippedNavPages: 0
    };

    this.progress = {
      artistsDone: [],
      songsDone: [],
      currentArtist: null
    };

    // Lista de páginas de navegación a excluir
    this.navigationPages = [
      'bckpckbyz',
      'contacto',
      'dano',
      'donar',
      'dopamina',
      'feed',
      'ni-pedo',
      'platica-con-cupido',
      'politica-de-cookies',
      'politica-de-privacidad',
      'terminos-y-condiciones',
      'ultimos-tutoriales',
      'sobre-mi',
      'about',
      'privacidad',
      'cookies',
      'terminos',
      'tutoriales',
      'wp-json'  // WordPress API endpoint
    ];

    // Crear carpetas
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Cargar progreso si existe
    if (fs.existsSync(this.progressFile)) {
      this.progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
    }
  }

  /**
   * Fetch HTML
   */
  async fetchHTML(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let html = '';
        res.on('data', (chunk) => { html += chunk; });
        res.on('end', () => resolve(html));
      }).on('error', reject);
    });
  }

  /**
   * Extract all artist URLs from /artist/ page
   */
  async extractArtists() {
    console.log('🎸 Extrayendo lista de artistas...\n');

    const html = await this.fetchHTML(`${this.baseUrl}/artist/`);

    // Buscar todos los enlaces a páginas de artistas
    const artistPattern = /href=["'](https:\/\/www\.espirituguitarrista\.com\/artistas\/[^"'\/]+\/?)["']/gi;
    const matches = [...html.matchAll(artistPattern)];

    // Extraer URLs únicas
    const artistUrls = [...new Set(matches.map(m => m[1]))];

    console.log(`✅ Encontrados ${artistUrls.length} artistas\n`);

    // Extraer nombres de artistas
    const artists = artistUrls.map(url => {
      const slug = url.match(/\/artistas\/([^\/]+)/)[1];
      return {
        name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug,
        url
      };
    });

    // Guardar lista
    const artistsFile = path.join(this.outputDir, 'artists.json');
    fs.writeFileSync(artistsFile, JSON.stringify(artists, null, 2));

    console.log(`📄 Lista guardada en: ${artistsFile}\n`);

    return artists;
  }

  /**
   * Extract all songs from an artist page
   */
  async extractSongsFromArtist(artist) {
    console.log(`📂 Procesando: ${artist.name} (${artist.url})`);

    try {
      const html = await this.fetchHTML(artist.url);

      // Buscar enlaces de canciones (URLs raíz del sitio)
      const songPattern = /href=["'](https:\/\/www\.espirituguitarrista\.com\/[a-z0-9-]+\/?)["']/gi;
      const matches = [...html.matchAll(songPattern)];

      let skippedNav = 0;

      // Filtrar solo canciones (excluir /artistas/, /artist/, navegación, etc.)
      const songUrls = [...new Set(matches.map(m => m[1]))]
        .filter(url => {
          const slug = url.replace(this.baseUrl + '/', '').replace('/', '');

          // Excluir rutas con /
          if (url.includes('/artistas/') ||
              url.includes('/artist/') ||
              url.includes('/categoria/') ||
              url.includes('/tag/') ||
              url === this.baseUrl + '/') {
            return false;
          }

          // Excluir páginas de navegación
          if (this.navigationPages.includes(slug)) {
            skippedNav++;
            this.stats.skippedNavPages++;
            return false;
          }

          return true;
        });

      if (skippedNav > 0) {
        console.log(`   ⏭️  Omitidas ${skippedNav} páginas de navegación`);
      }
      console.log(`   ✓ ${songUrls.length} canciones encontradas`);

      const songs = songUrls.map(url => {
        const slug = url.replace(this.baseUrl + '/', '').replace('/', '');
        return {
          title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug,
          url,
          artist: artist.name
        };
      });

      return songs;

    } catch (error) {
      console.error(`   ✗ Error: ${error.message}`);
      this.stats.errors++;
      return [];
    }
  }

  /**
   * Download images from a song page
   */
  async downloadSongImages(song) {
    console.log(`   📷 Descargando: ${song.title}`);

    const songFolder = path.join(this.outputDir, 'images', this.sanitizeFilename(song.artist), this.sanitizeFilename(song.slug));

    try {
      const html = await this.fetchHTML(song.url);

      // Extraer imágenes de wp-content/uploads
      const imagePattern = /(https:\/\/www\.espirituguitarrista\.com\/wp-content\/uploads\/[^"'\s]+\.(?:png|jpg|jpeg|webp))/gi;
      const matches = [...html.matchAll(imagePattern)];
      const imageUrls = [...new Set(matches.map(m => m[1]))];

      if (imageUrls.length === 0) {
        console.log(`      ⚠️  Sin imágenes encontradas`);
        return;
      }

      // Crear carpetas
      ['requinto', 'chords', 'lyrics'].forEach(folder => {
        const dir = path.join(songFolder, folder);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      // Descargar imágenes
      let downloaded = 0;
      for (let i = 0; i < imageUrls.length; i++) {
        const imgUrl = imageUrls[i];
        const filename = path.basename(imgUrl).split('?')[0];

        // Clasificar imagen
        let folder = 'lyrics';
        if (filename.includes('Regional') || filename.includes('cejilla')) {
          folder = 'chords';
        } else if (i === 0 && !filename.includes('image-')) {
          folder = 'requinto';
        }

        const filepath = path.join(songFolder, folder, filename);

        try {
          await this.downloadImage(imgUrl, filepath);
          downloaded++;
        } catch (err) {
          console.error(`      ✗ Error descargando ${filename}`);
        }
      }

      // Guardar metadata
      const metadata = {
        title: song.title,
        artist: song.artist,
        slug: song.slug,
        url: song.url,
        scrapedAt: new Date().toISOString(),
        imageCount: downloaded
      };

      fs.writeFileSync(
        path.join(songFolder, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      console.log(`      ✓ ${downloaded} imágenes descargadas`);
      this.stats.images += downloaded;
      this.stats.songs++;

    } catch (error) {
      console.error(`      ✗ Error: ${error.message}`);
      this.stats.errors++;
    }
  }

  /**
   * Download single image
   */
  async downloadImage(imageUrl, outputPath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      https.get(imageUrl, (res) => {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Save progress
   */
  saveProgress() {
    fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
  }

  /**
   * Wait between requests
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Run full catalog extraction
   */
  async run(artistsOnly = false, resume = false, filterArtists = null) {
    console.log('🎸 Espíritu Guitarrista - Full Catalog Scraper\n');
    console.log('━'.repeat(60) + '\n');

    // Paso 1: Extraer artistas
    let artists = [];

    if (resume && fs.existsSync(path.join(this.outputDir, 'artists.json'))) {
      console.log('📂 Cargando lista de artistas existente...\n');
      artists = JSON.parse(fs.readFileSync(path.join(this.outputDir, 'artists.json'), 'utf8'));
    } else {
      artists = await this.extractArtists();
    }

    // Filtrar artistas si se especifica
    if (filterArtists && filterArtists.length > 0) {
      const filterSlugs = filterArtists.map(name =>
        name.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
      );

      artists = artists.filter(artist =>
        filterSlugs.some(slug => artist.slug.includes(slug) || slug.includes(artist.slug))
      );

      console.log(`🔍 Filtrando a ${artists.length} artistas específicos:\n`);
      artists.forEach(a => console.log(`   - ${a.name}`));
      console.log('');
    }

    this.stats.artists = artists.length;

    if (artistsOnly) {
      console.log('✅ Solo extracción de artistas completada');
      return;
    }

    // Paso 2: Extraer canciones de cada artista
    console.log('━'.repeat(60) + '\n');
    console.log('📥 Extrayendo canciones de cada artista...\n');

    const allSongs = [];
    const seenSlugs = new Set(); // Para detectar duplicados

    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];

      // Skip si ya se procesó
      if (resume && this.progress.artistsDone.includes(artist.slug)) {
        console.log(`⏭️  Saltando ${artist.name} (ya procesado)\n`);
        continue;
      }

      console.log(`\n[${i + 1}/${artists.length}] ${artist.name}`);
      console.log('─'.repeat(60));

      this.progress.currentArtist = artist.slug;
      this.saveProgress();

      const songs = await this.extractSongsFromArtist(artist);

      // Filtrar duplicados
      const newSongs = songs.filter(song => {
        if (seenSlugs.has(song.slug)) {
          console.log(`   ⚠️  Duplicado (ya extraído): ${song.title}`);
          return false;
        }
        seenSlugs.add(song.slug);
        return true;
      });

      allSongs.push(...newSongs);

      this.progress.artistsDone.push(artist.slug);
      this.saveProgress();

      // Esperar 2 segundos entre artistas
      await this.wait(2000);
    }

    // Guardar lista completa de canciones
    const songsFile = path.join(this.outputDir, 'songs.json');
    fs.writeFileSync(songsFile, JSON.stringify(allSongs, null, 2));

    console.log(`\n\n📄 Lista de canciones guardada: ${songsFile}`);
    console.log(`   Total: ${allSongs.length} canciones\n`);

    // Paso 3: Descargar imágenes
    console.log('━'.repeat(60) + '\n');
    console.log('📷 Descargando imágenes...\n');

    for (let i = 0; i < allSongs.length; i++) {
      const song = allSongs[i];

      // Skip si ya se procesó
      if (resume && this.progress.songsDone.includes(song.slug)) {
        continue;
      }

      console.log(`\n[${i + 1}/${allSongs.length}]`);
      await this.downloadSongImages(song);

      this.progress.songsDone.push(song.slug);
      this.saveProgress();

      // Esperar 3 segundos entre canciones
      await this.wait(3000);
    }

    // Resumen final
    console.log('\n\n' + '━'.repeat(60));
    console.log('✅ SCRAPING COMPLETADO\n');
    console.log(`📊 Estadísticas:`);
    console.log(`   Artistas: ${this.stats.artists}`);
    console.log(`   Canciones: ${this.stats.songs}`);
    console.log(`   Imágenes: ${this.stats.images}`);
    console.log(`   Páginas omitidas: ${this.stats.skippedNavPages}`);
    console.log(`   Errores: ${this.stats.errors}`);
    console.log('\n📁 Output: ' + this.outputDir);
    console.log('━'.repeat(60) + '\n');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const artistsOnly = args.includes('--artists-only');
  const resume = args.includes('--resume');

  // Artistas específicos para extracción
  const testArtists = [
    'natanael cano', 'eslabon armado', 'junior h', 'santa fe klan', 'rammstein',
    'piso 21', 'kings of leon', 'kevin kaarl', 'franco escamilla', 'fobia',
    'el tri', 'ed maverick', 'drake bell', 'cartel de santa', 'camilo',
    'caifanes', 'bratty', 'bon jovi', 'black sabbath', 'neton vega',
    'gabito ballesteros', 'ariel camacho', 'luis r conriquez', 'calle 24',
    'chino pacas', 'fuerza regida', 'tito doble p', 'dareyes de la sierra',
    'oscar maydon', 'victor valverde', 't3r elemento'
  ];

  const scraper = new EspirituGuitarristaFullCatalog();

  try {
    await scraper.run(artistsOnly, resume, testArtists);
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  }
}

main();
