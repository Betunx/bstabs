/**
 * Lyrics Scraper - Extrae letras de canciones desde letras.com y musica.com
 * Integrado con tab-scraper-v2.js
 */

const axios = require('axios');
const cheerio = require('cheerio');

class LyricsScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
  }

  /**
   * Detecta la fuente de la URL
   */
  detectSource(url) {
    if (url.includes('letras.com')) return 'letras.com';
    if (url.includes('musica.com')) return 'musica.com';
    return 'unknown';
  }

  /**
   * Scrape lyrics from URL
   */
  async scrapeLyrics(url) {
    const source = this.detectSource(url);

    try {
      const response = await axios.get(url, { headers: this.headers });
      const html = response.data;

      switch (source) {
        case 'letras.com':
          return this.scrapeLetrascom(html, url);
        case 'musica.com':
          return this.scrapeMusicacom(html, url);
        default:
          throw new Error(`Fuente no soportada: ${source}`);
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Scrape de letras.com
   */
  scrapeLetrascom(html, url) {
    const $ = cheerio.load(html);

    // Título y artista
    const title = $('h1.cnt-head_title').text().trim() ||
                  $('.lyric-title h1').text().trim();
    const artist = $('h2.cnt-head_subtitle').text().trim() ||
                   $('.lyric-artist h2').text().trim();

    // Letra
    let lyrics = '';

    // Intentar diferentes selectores
    const lyricsSelectors = [
      '.cnt-letra p',
      '.lyric-original p',
      'article.lyric p',
      '.letra-musica p'
    ];

    for (const selector of lyricsSelectors) {
      const paragraphs = $(selector);
      if (paragraphs.length > 0) {
        lyrics = paragraphs.map((i, el) => $(el).text().trim()).get().join('\n\n');
        break;
      }
    }

    if (!lyrics) {
      // Fallback: buscar cualquier div con clase que contenga 'letra' o 'lyric'
      $('[class*="letra"], [class*="lyric"]').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 100 && text.length > lyrics.length) {
          lyrics = text;
        }
      });
    }

    return {
      title,
      artist,
      lyrics,
      sourceUrl: url,
      sourceType: 'letras.com',
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Scrape de musica.com
   */
  scrapeMusicacom(html, url) {
    const $ = cheerio.load(html);

    // Título y artista
    const title = $('h1').first().text().trim();
    const artist = $('h2').first().text().trim() ||
                   $('.artist-name').text().trim();

    // Letra
    let lyrics = '';

    const lyricsSelectors = [
      '.letra-musica',
      '.lyrics',
      '#lyrics',
      'div[itemprop="lyrics"]'
    ];

    for (const selector of lyricsSelectors) {
      const lyricsDiv = $(selector).first();
      if (lyricsDiv.length > 0) {
        lyrics = lyricsDiv.text().trim();
        break;
      }
    }

    return {
      title,
      artist,
      lyrics,
      sourceUrl: url,
      sourceType: 'musica.com',
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Buscar letra por título y artista
   */
  async searchAndScrapeLyrics(title, artist) {
    console.log(`🔍 Buscando letra: "${title}" - ${artist}`);

    // Construir URL de letras.com
    const normalizedTitle = this.normalizeForUrl(title);
    const normalizedArtist = this.normalizeForUrl(artist);

    const letrasUrl = `https://www.letras.com/${normalizedArtist}/${normalizedTitle}/`;

    try {
      const result = await this.scrapeLyrics(letrasUrl);
      if (result && result.lyrics) {
        console.log(`   ✅ Letra encontrada en letras.com`);
        return result;
      }
    } catch (error) {
      console.log(`   ⚠️  No encontrada en letras.com, intentando musica.com...`);
    }

    // Fallback a musica.com
    const musicaUrl = `https://www.musica.com/${normalizedArtist}/${normalizedTitle}/`;
    try {
      const result = await this.scrapeLyrics(musicaUrl);
      if (result && result.lyrics) {
        console.log(`   ✅ Letra encontrada en musica.com`);
        return result;
      }
    } catch (error) {
      console.log(`   ❌ No encontrada en musica.com`);
    }

    return null;
  }

  /**
   * Normaliza texto para URL
   */
  normalizeForUrl(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

module.exports = LyricsScraper;

// Test directo si se ejecuta como script principal
if (require.main === module) {
  const scraper = new LyricsScraper();

  const testUrl = process.argv[2] || 'https://www.letras.com/oasis/wonderwall/';

  console.log(`\n🎵 Testeando Lyrics Scraper\n`);
  console.log(`URL: ${testUrl}\n`);

  scraper.scrapeLyrics(testUrl).then(result => {
    if (result) {
      console.log(`\n✅ Resultado:\n`);
      console.log(`Título: ${result.title}`);
      console.log(`Artista: ${result.artist}`);
      console.log(`Fuente: ${result.sourceType}`);
      console.log(`\nLetra (primeras 200 caracteres):\n${result.lyrics.substring(0, 200)}...\n`);
    } else {
      console.log('\n❌ No se pudo extraer la letra\n');
    }
  });
}
