/**
 * Script para extraer tablaturas de sitios web
 * Extrae SOLO el contenido musical (letra + acordes)
 * Guarda en formato JSON para importar a la base de datos
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class TabScraper {
  constructor() {
    this.outputDir = path.join(__dirname, 'extracted-tabs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Extrae HTML de una URL
   */
  async fetchHTML(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, (res) => {
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
   * Extrae solo el contenido de acordes y letra
   * Elimina scripts, estilos, ads
   */
  extractTabContent(html, siteName = 'generic') {
    // Patrones comunes para diferentes sitios
    const patterns = {
      cifraclub: /<pre class="[^"]*cifra[^"]*"[^>]*>(.*?)<\/pre>/gs,
      ultimateGuitar: /<pre[^>]*class="[^"]*js-tab-content[^"]*"[^>]*>(.*?)<\/pre>/gs,
      acordesweb: /<pre[^>]*>(.*?)<\/pre>/gs,
      generic: /<pre[^>]*>(.*?)<\/pre>/gs
    };

    const pattern = patterns[siteName] || patterns.generic;
    const matches = html.match(pattern);

    if (!matches || matches.length === 0) {
      console.log('⚠️  No se encontró contenido de tablatura con el patrón estándar');
      return this.fallbackExtraction(html);
    }

    // Limpia el HTML extraído
    let content = matches[0];
    content = this.cleanHTML(content);

    return content;
  }

  /**
   * Método alternativo si no encuentra pre tags
   */
  fallbackExtraction(html) {
    // Busca divs comunes que contengan tablaturas
    const divPatterns = [
      /<div[^>]*class="[^"]*tab[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<div[^>]*class="[^"]*chord[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<div[^>]*id="[^"]*tab[^"]*"[^>]*>(.*?)<\/div>/gs
    ];

    for (let pattern of divPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        return this.cleanHTML(matches[0]);
      }
    }

    return null;
  }

  /**
   * Limpia HTML: elimina scripts, estilos, ads
   */
  cleanHTML(html) {
    let clean = html;

    // Elimina scripts
    clean = clean.replace(/<script[^>]*>.*?<\/script>/gs, '');

    // Elimina estilos inline
    clean = clean.replace(/<style[^>]*>.*?<\/style>/gs, '');

    // Elimina atributos style
    clean = clean.replace(/\s*style="[^"]*"/g, '');

    // Elimina atributos rel
    clean = clean.replace(/\s*rel="[^"]*"/g, '');

    // Convierte tags <a> a solo su contenido (para acordes)
    clean = clean.replace(/<a[^>]*>([^<]+)<\/a>/g, '$1');

    // Elimina divs pero mantiene contenido
    clean = clean.replace(/<\/?div[^>]*>/g, '');

    // Elimina clases (opcional, puedes comentar si necesitas las clases)
    clean = clean.replace(/\s*class="[^"]*"/g, '');

    // Elimina IDs
    clean = clean.replace(/\s*id="[^"]*"/g, '');

    // Elimina comentarios HTML
    clean = clean.replace(/<!--.*?-->/gs, '');

    // Elimina líneas de crédito (AcordesWeb, etc)
    clean = clean.replace(/Primero en #[^\n<]+/g, '');

    // Limpia múltiples <br/> seguidos
    clean = clean.replace(/(<br\s*\/?>[\s]*){3,}/g, '<br/><br/>');

    // Normaliza espacios pero mantiene saltos de línea
    clean = clean.replace(/[ \t]+/g, ' ');
    clean = clean.replace(/^\s+|\s+$/gm, '');

    return clean.trim();
  }

  /**
   * Detecta acordes en el texto
   */
  detectChords(content) {
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g;
    const chords = content.match(chordPattern) || [];

    // Elimina duplicados
    return [...new Set(chords)];
  }

  /**
   * Extrae metadata de la canción
   */
  extractMetadata(html, url) {
    const metadata = {
      title: '',
      artist: '',
      sourceUrl: url,
      extractedAt: new Date().toISOString()
    };

    // Intenta extraer título
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      let title = titleMatch[1];

      // Limpiar formato de AcordesWeb: "▷ TITULO: (Artista) Acordes..."
      const acordesWebMatch = title.match(/▷\s*([^:]+):\s*\(([^)]+)\)/);
      if (acordesWebMatch) {
        metadata.title = acordesWebMatch[1].trim();
        metadata.artist = acordesWebMatch[2].trim();
      } else {
        // Formato genérico
        metadata.title = title.replace(/\s*-\s*.*$/, '').trim();
      }
    }

    // Intenta extraer meta tags si no encontró artista
    if (!metadata.artist) {
      const artistMatch = html.match(/<meta[^>]*name="artist"[^>]*content="([^"]*)"[^>]*>/i);
      if (artistMatch) {
        metadata.artist = artistMatch[1];
      }
    }

    // Limpia caracteres HTML entities
    metadata.title = this.decodeHTMLEntities(metadata.title);
    metadata.artist = this.decodeHTMLEntities(metadata.artist);

    return metadata;
  }

  /**
   * Decodifica HTML entities
   */
  decodeHTMLEntities(text) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'"
    };

    return text.replace(/&[^;]+;/g, match => entities[match] || match);
  }

  /**
   * Procesa una URL y guarda el resultado
   */
  async scrapeTab(url, siteName = 'generic') {
    try {
      console.log(`\n🎵 Extrayendo: ${url}`);

      const html = await this.fetchHTML(url);
      const tabContent = this.extractTabContent(html, siteName);

      if (!tabContent) {
        console.log('❌ No se pudo extraer contenido de tablatura');
        return null;
      }

      const metadata = this.extractMetadata(html, url);
      const chords = this.detectChords(tabContent);

      const result = {
        ...metadata,
        content: tabContent,
        chords: chords,
        status: 'pending'
      };

      // Guarda en archivo JSON
      const filename = `tab-${Date.now()}.json`;
      const filepath = path.join(this.outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(result, null, 2));

      console.log(`✅ Guardado en: ${filepath}`);
      console.log(`📊 Acordes detectados: ${chords.join(', ')}`);

      return result;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Procesa múltiples URLs desde un archivo
   */
  async scrapeBatch(urlsFile) {
    const urls = fs.readFileSync(urlsFile, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    console.log(`\n📋 Procesando ${urls.length} URLs...\n`);

    const results = [];
    for (const url of urls) {
      const result = await this.scrapeTab(url);
      if (result) {
        results.push(result);
      }

      // Pausa entre requests para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Guarda resumen
    const summary = {
      totalProcessed: urls.length,
      successful: results.length,
      failed: urls.length - results.length,
      tabs: results,
      processedAt: new Date().toISOString()
    };

    const summaryPath = path.join(this.outputDir, 'batch-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\n📦 Resumen guardado en: ${summaryPath}`);
    console.log(`✅ Éxitosos: ${results.length}/${urls.length}`);

    return summary;
  }
}

// Exporta la clase
module.exports = TabScraper;

// Si se ejecuta directamente
if (require.main === module) {
  const scraper = new TabScraper();

  // Ejemplo de uso con una sola URL
  const testUrl = process.argv[2];
  const siteName = process.argv[3] || 'generic';

  if (testUrl) {
    scraper.scrapeTab(testUrl, siteName);
  } else {
    console.log(`
📖 Uso:

  Una URL:
  node tab-scraper.js "https://example.com/tab" [siteName]

  Batch (desde archivo):
  node tab-scraper.js --batch urls.txt

  Sitios soportados: cifraclub, ultimateGuitar, generic
    `);
  }
}
