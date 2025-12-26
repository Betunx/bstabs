/**
 * Scraper Combinado - Tabs + Lyrics
 * Scrape tabs de CifraClub y busca letras automáticamente
 */

const TabScraperV2 = require('./tab-scraper-v2');
const LyricsScraper = require('./lyrics-scraper');
const fs = require('fs');
const path = require('path');

class CombinedScraper {
  constructor() {
    this.tabScraper = new TabScraperV2();
    this.lyricsScraper = new LyricsScraper();
    this.outputDir = path.join(__dirname, 'extracted-tabs');
  }

  /**
   * Scrape tab y buscar lyrics
   */
  async scrapeWithLyrics(url) {
    console.log(`\n🎸 Scraping tab: ${url}`);

    try {
      // 1. Scrapear tab
      const tabResult = await this.tabScraper.processUrl(url);

      if (!tabResult) {
        console.log('   ❌ No se pudo scrapear el tab');
        return null;
      }

      console.log(`   ✅ Tab scrapeado: ${tabResult.title}`);

      // 2. Buscar lyrics si tenemos título y artista
      let lyricsData = null;
      if (tabResult.title && tabResult.artist) {
        console.log(`   🔍 Buscando letra...`);

        lyricsData = await this.lyricsScraper.searchAndScrapeLyrics(
          tabResult.title,
          tabResult.artist
        );
      }

      // 3. Combinar resultados
      const combined = {
        ...tabResult,
        lyrics: lyricsData ? lyricsData.lyrics : null,
        lyricsSource: lyricsData ? lyricsData.sourceUrl : null,
        lyricsFoundAt: lyricsData ? lyricsData.extractedAt : null
      };

      // 4. Guardar resultado combinado
      const filename = this.generateFilename(combined.title);
      const filepath = path.join(this.outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(combined, null, 2), 'utf-8');

      console.log(`   💾 Guardado: ${filename}`);
      console.log(`   📊 Tiene letra: ${lyricsData ? '✅' : '❌'}\n`);

      return combined;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      return null;
    }
  }

  /**
   * Batch scraping desde archivo de URLs
   */
  async batchScrape(urlsFile) {
    console.log(`\n🎵 SCRAPER COMBINADO (Tabs + Lyrics)\n`);

    const urls = fs.readFileSync(urlsFile, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.startsWith('http'));

    console.log(`📊 Total de URLs: ${urls.length}\n`);

    const results = [];

    for (let i = 0; i < urls.length; i++) {
      console.log(`[${i + 1}/${urls.length}]`);

      const result = await this.scrapeWithLyrics(urls[i]);

      if (result) {
        results.push(result);
      }

      // Delay entre requests
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Resumen
    const withLyrics = results.filter(r => r.lyrics).length;
    const withoutLyrics = results.length - withLyrics;

    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`📊 RESUMEN`);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`✅ Tabs scrapeados:      ${results.length}/${urls.length}`);
    console.log(`📝 Con letra:            ${withLyrics}`);
    console.log(`⚠️  Sin letra:           ${withoutLyrics}`);
    console.log(`\n✨ Proceso completado!\n`);

    return results;
  }

  generateFilename(title) {
    const normalized = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `${normalized}-${Date.now()}.json`;
  }
}

// Exportar
module.exports = CombinedScraper;

// Ejecución directa
if (require.main === module) {
  const scraper = new CombinedScraper();

  const urlsFile = process.argv[2] || 'popular-songs-urls.txt';
  const singleUrl = process.argv[2];

  if (singleUrl && singleUrl.startsWith('http')) {
    // Modo single URL
    scraper.scrapeWithLyrics(singleUrl);
  } else {
    // Modo batch
    scraper.batchScrape(urlsFile);
  }
}
