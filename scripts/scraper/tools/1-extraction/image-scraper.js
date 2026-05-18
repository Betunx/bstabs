/**
 * Image Tab Scraper - Espíritu Guitarrista
 *
 * Extrae tablaturas de sitios que usan imágenes en lugar de HTML
 * Compatible con: espirituguitarrista.com
 *
 * Uso:
 *   node image-tab-scraper.js "https://www.espirituguitarrista.com/y-lloro/"
 *   node image-tab-scraper.js --batch urls.txt
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class ImageTabScraper {
  constructor() {
    this.outputDir = path.join(__dirname, 'downloaded-tabs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Fetch HTML content from URL
   */
  async fetchHTML(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, (res) => {
        let html = '';

        res.on('data', (chunk) => {
          html += chunk;
        });

        res.on('end', () => {
          resolve(html);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Download image from URL
   */
  async downloadImage(imageUrl, outputPath) {
    return new Promise((resolve, reject) => {
      const protocol = imageUrl.startsWith('https') ? https : http;

      const file = fs.createWriteStream(outputPath);

      protocol.get(imageUrl, (res) => {
        res.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
      }).on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
  }

  /**
   * Extract song metadata and image URLs from Espíritu Guitarrista
   */
  parseEspirituGuitarrista(html) {
    const result = {
      title: '',
      artist: '',
      images: {
        requinto: [],
        chords: [],
        lyrics: []
      }
    };

    // Extract title (from h1 or title tag)
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
                       html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      result.title = this.cleanText(titleMatch[1]);
    }

    // Extract all image URLs from wp-content/uploads
    const imageRegex = /<img[^>]+src=["']([^"']+wp-content\/uploads[^"']+)["'][^>]*>/gi;
    let match;

    while ((match = imageRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      const imgTag = match[0];

      // Classify images by type
      if (imgUrl.includes('image-') && !imgUrl.includes('Regional')) {
        // These are usually requinto tabs or lyrics with chords
        const imgHtml = this.extractImgContext(html, match.index);

        if (this.isRequintoImage(imgTag, imgHtml)) {
          result.images.requinto.push(imgUrl);
        } else {
          result.images.lyrics.push(imgUrl);
        }
      } else if (imgUrl.includes('Regional') || imgUrl.includes('cejilla')) {
        // Chord diagrams
        result.images.chords.push(imgUrl);
      } else if (imgUrl.includes('image-')) {
        // Other tab images
        result.images.lyrics.push(imgUrl);
      }
    }

    return result;
  }

  /**
   * Extract context around image tag
   */
  extractImgContext(html, imgIndex) {
    const start = Math.max(0, imgIndex - 200);
    const end = Math.min(html.length, imgIndex + 200);
    return html.substring(start, end);
  }

  /**
   * Determine if image is a requinto tab
   */
  isRequintoImage(imgTag, context) {
    const requintoKeywords = ['requinto', 'punteo', 'tab', 'tablatura'];
    const contextLower = context.toLowerCase();

    return requintoKeywords.some(keyword => contextLower.includes(keyword));
  }

  /**
   * Clean HTML entities and trim text
   */
  cleanText(text) {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  /**
   * Create safe folder name from song title
   */
  sanitizeFolderName(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Process a single URL
   */
  async processUrl(url) {
    console.log(`\n📥 Procesando: ${url}`);

    try {
      // Fetch HTML
      const html = await this.fetchHTML(url);

      // Parse content
      const songData = this.parseEspirituGuitarrista(html);

      if (!songData.title) {
        console.error('❌ No se pudo extraer el título de la canción');
        return;
      }

      console.log(`✅ Encontrado: ${songData.title}`);
      console.log(`   - Requintos: ${songData.images.requinto.length}`);
      console.log(`   - Acordes: ${songData.images.chords.length}`);
      console.log(`   - Letras: ${songData.images.lyrics.length}`);

      // Create folder for this song
      const folderName = this.sanitizeFolderName(songData.title);
      const songFolder = path.join(this.outputDir, folderName);

      if (!fs.existsSync(songFolder)) {
        fs.mkdirSync(songFolder, { recursive: true });
      }

      // Create subfolders
      const requintoFolder = path.join(songFolder, 'requinto');
      const chordsFolder = path.join(songFolder, 'chords');
      const lyricsFolder = path.join(songFolder, 'lyrics');

      [requintoFolder, chordsFolder, lyricsFolder].forEach(folder => {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
      });

      // Download images
      console.log('\n📷 Descargando imágenes...');

      let downloadCount = 0;

      // Download requinto images
      for (let i = 0; i < songData.images.requinto.length; i++) {
        const imgUrl = songData.images.requinto[i];
        const ext = path.extname(imgUrl).split('?')[0] || '.png';
        const filename = `requinto-${i + 1}${ext}`;
        const filepath = path.join(requintoFolder, filename);

        try {
          await this.downloadImage(imgUrl, filepath);
          console.log(`   ✓ ${filename}`);
          downloadCount++;
        } catch (err) {
          console.error(`   ✗ Error descargando ${filename}:`, err.message);
        }
      }

      // Download chord diagrams
      for (let i = 0; i < songData.images.chords.length; i++) {
        const imgUrl = songData.images.chords[i];
        const ext = path.extname(imgUrl).split('?')[0] || '.png';
        const filename = path.basename(imgUrl).split('?')[0];
        const filepath = path.join(chordsFolder, filename);

        try {
          await this.downloadImage(imgUrl, filepath);
          console.log(`   ✓ ${filename}`);
          downloadCount++;
        } catch (err) {
          console.error(`   ✗ Error descargando ${filename}:`, err.message);
        }
      }

      // Download lyrics images
      for (let i = 0; i < songData.images.lyrics.length; i++) {
        const imgUrl = songData.images.lyrics[i];
        const ext = path.extname(imgUrl).split('?')[0] || '.png';
        const filename = `lyrics-${i + 1}${ext}`;
        const filepath = path.join(lyricsFolder, filename);

        try {
          await this.downloadImage(imgUrl, filepath);
          console.log(`   ✓ ${filename}`);
          downloadCount++;
        } catch (err) {
          console.error(`   ✗ Error descargando ${filename}:`, err.message);
        }
      }

      // Save metadata
      const metadata = {
        title: songData.title,
        artist: songData.artist,
        sourceUrl: url,
        scrapedAt: new Date().toISOString(),
        imageCount: downloadCount,
        images: songData.images
      };

      const metadataPath = path.join(songFolder, 'metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      console.log(`\n✅ Completado: ${downloadCount} imágenes guardadas en:`);
      console.log(`   ${songFolder}`);

    } catch (error) {
      console.error('❌ Error procesando URL:', error.message);
    }
  }

  /**
   * Process multiple URLs from a file
   */
  async processBatch(filePath) {
    console.log(`📋 Procesando archivo batch: ${filePath}`);

    const urls = fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    console.log(`   Encontradas ${urls.length} URLs\n`);

    for (let i = 0; i < urls.length; i++) {
      console.log(`\n[${i + 1}/${urls.length}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      await this.processUrl(urls[i]);

      // Wait 2 seconds between requests to be polite
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n\n✅ Batch completado');
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📸 Image Tab Scraper - Espíritu Guitarrista

Uso:
  node image-tab-scraper.js "URL"
  node image-tab-scraper.js --batch urls.txt

Ejemplos:
  node image-tab-scraper.js "https://www.espirituguitarrista.com/y-lloro/"
  node image-tab-scraper.js --batch espirituguitarrista-urls.txt

Salida:
  ./downloaded-tabs/
    └── nombre-cancion/
        ├── metadata.json
        ├── requinto/
        │   └── requinto-1.png
        ├── chords/
        │   └── C-Regional.png
        └── lyrics/
            └── lyrics-1.png
    `);
    process.exit(0);
  }

  const scraper = new ImageTabScraper();

  if (args[0] === '--batch') {
    if (!args[1]) {
      console.error('❌ Error: Debes proporcionar un archivo de URLs');
      process.exit(1);
    }
    await scraper.processBatch(args[1]);
  } else {
    await scraper.processUrl(args[0]);
  }
}

main();
