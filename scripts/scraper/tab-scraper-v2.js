/**
 * Tab Scraper V2 - Con soporte para PDFs
 * Extrae tablaturas de:
 * - HTML (AcordesWeb, CifraClub, etc.)
 * - PDF (AcordesWeb PDFs, archivos locales)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class TabScraperV2 {
  constructor() {
    this.outputDir = path.join(__dirname, 'extracted-tabs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Descarga y procesa contenido desde URL
   */
  async fetchContent(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, (res) => {
        const chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          // Combina chunks en Buffer
          const buffer = Buffer.concat(chunks);

          // Detecta si es PDF o HTML
          const isPDF = buffer.toString('utf8', 0, 4) === '%PDF';

          if (isPDF) {
            resolve({ type: 'pdf', buffer });
          } else {
            resolve({ type: 'html', buffer: buffer.toString('utf8') });
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Extrae contenido de PDF
   */
  async extractFromPDF(buffer, url) {
    try {
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text;

      console.log('📄 PDF parseado correctamente');
      console.log(`   Páginas: ${pdfData.numpages}`);
      console.log(`   Caracteres: ${text.length}`);

      // Estructura el contenido extraído
      return this.parsePDFContent(text, url);

    } catch (error) {
      console.error('❌ Error al parsear PDF:', error.message);
      return null;
    }
  }

  /**
   * Parsea el texto extraído del PDF y lo estructura
   */
  parsePDFContent(text, url) {
    // Limpia el texto
    let clean = text
      .replace(/Primero en #\w+/g, '') // Elimina marcas de AcordesWeb
      .replace(/https?:\/\/[^\s]+/g, '') // Elimina URLs
      .replace(/\f/g, '\n\n') // Form feed → doble salto
      .trim();

    // Intenta detectar acordes
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g;
    const chords = [...new Set(clean.match(chordPattern) || [])];

    // Divide en secciones (Intro, Verso, Coro, etc.)
    const sections = this.detectSections(clean);

    return {
      rawText: clean,
      chords: chords,
      sections: sections,
      sourceType: 'pdf',
      sourceUrl: url
    };
  }

  /**
   * Detecta secciones en el texto (Intro, Verso, Coro, etc.)
   */
  detectSections(text) {
    const sectionKeywords = [
      'intro', 'verse', 'verso', 'chorus', 'coro', 'estribillo',
      'bridge', 'puente', 'outro', 'final', 'solo', 'pre-chorus', 'pre-coro'
    ];

    const lines = text.split('\n');
    const sections = [];
    let currentSection = { name: 'Intro', lines: [] };

    for (let line of lines) {
      const lowerLine = line.toLowerCase().trim();

      // Detecta inicio de nueva sección
      const matchedKeyword = sectionKeywords.find(kw =>
        lowerLine.includes(kw) && lowerLine.length < 30
      );

      if (matchedKeyword) {
        // Guarda sección anterior si tiene contenido
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }

        // Inicia nueva sección
        currentSection = {
          name: this.normalizeSectionName(line.trim()),
          lines: []
        };
      } else if (line.trim()) {
        // Agrega línea a la sección actual
        currentSection.lines.push(line.trim());
      }
    }

    // Agrega última sección
    if (currentSection.lines.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Normaliza nombres de secciones
   */
  normalizeSectionName(name) {
    const normalized = name
      .replace(/[:\-\[\]]/g, '')
      .trim();

    // Capitaliza primera letra
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  /**
   * Extrae contenido de HTML (método original)
   */
  extractFromHTML(html, siteName = 'generic') {
    const patterns = {
      cifraclub: /<pre class="[^"]*cifra[^"]*"[^>]*>(.*?)<\/pre>/gs,
      ultimateGuitar: /<pre[^>]*class="[^"]*js-tab-content[^"]*"[^>]*>(.*?)<\/pre>/gs,
      acordesweb: /<pre[^>]*>(.*?)<\/pre>/gs,
      generic: /<pre[^>]*>(.*?)<\/pre>/gs
    };

    const pattern = patterns[siteName] || patterns.generic;
    const matches = html.match(pattern);

    if (!matches || matches.length === 0) {
      return this.fallbackExtraction(html);
    }

    const content = this.cleanHTML(matches[0]);
    const chords = this.detectChords(content);

    return {
      rawText: content,
      chords: chords,
      sourceType: 'html'
    };
  }

  /**
   * Extracción alternativa para HTML
   */
  fallbackExtraction(html) {
    const divPatterns = [
      /<div[^>]*class="[^"]*tab[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<div[^>]*class="[^"]*chord[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<div[^>]*id="[^"]*tab[^"]*"[^>]*>(.*?)<\/div>/gs
    ];

    for (let pattern of divPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const content = this.cleanHTML(matches[0]);
        return {
          rawText: content,
          chords: this.detectChords(content),
          sourceType: 'html'
        };
      }
    }

    return null;
  }

  /**
   * Limpia HTML
   */
  cleanHTML(html) {
    let clean = html;
    clean = clean.replace(/<script[^>]*>.*?<\/script>/gs, '');
    clean = clean.replace(/<style[^>]*>.*?<\/style>/gs, '');
    clean = clean.replace(/\s*style="[^"]*"/g, '');
    clean = clean.replace(/<a[^>]*>([^<]+)<\/a>/g, '$1');
    clean = clean.replace(/<\/?div[^>]*>/g, '');
    clean = clean.replace(/\s*class="[^"]*"/g, '');
    clean = clean.replace(/<!--.*?-->/gs, '');
    clean = clean.replace(/Primero en #[^\n<]+/g, '');
    clean = clean.replace(/(<br\s*\/?>[\s]*){3,}/g, '<br/><br/>');
    clean = clean.replace(/[ \t]+/g, ' ');
    clean = clean.replace(/^\s+|\s+$/gm, '');

    return clean.trim();
  }

  /**
   * Detecta acordes
   */
  detectChords(content) {
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g;
    const chords = content.match(chordPattern) || [];
    return [...new Set(chords)];
  }

  /**
   * Extrae metadata desde URL o contenido
   */
  extractMetadata(content, url, type) {
    const metadata = {
      title: '',
      artist: '',
      sourceUrl: url,
      sourceType: type,
      extractedAt: new Date().toISOString()
    };

    if (type === 'html') {
      // Extrae de HTML title
      const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch) {
        let title = titleMatch[1];

        // Formato AcordesWeb: "▷ TITULO: (Artista)"
        const acordesWebMatch = title.match(/▷\s*([^:]+):\s*\(([^)]+)\)/);
        if (acordesWebMatch) {
          metadata.title = acordesWebMatch[1].trim();
          metadata.artist = acordesWebMatch[2].trim();
        } else {
          metadata.title = title.replace(/\s*-\s*.*$/, '').trim();
        }
      }
    } else if (type === 'pdf') {
      // Intenta extraer desde URL
      // Ejemplo: /natanael-cano/viejo-lobo-ft-luis-r-conriquez/
      const urlMatch = url.match(/\/([^\/]+)\/([^\/]+)\//);
      if (urlMatch) {
        metadata.artist = this.formatName(urlMatch[1]);
        metadata.title = this.formatName(urlMatch[2]);
      }
    }

    return metadata;
  }

  /**
   * Formatea nombres desde URLs (kebab-case → Title Case)
   */
  formatName(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/ Ft /gi, ' ft ')
      .replace(/ Y /gi, ' y ')
      .replace(/ De /gi, ' de ');
  }

  /**
   * Procesa una URL (HTML o PDF)
   */
  async scrapeTab(url, siteName = 'generic') {
    try {
      console.log(`\n🎵 Procesando: ${url}`);

      // Descarga contenido
      const content = await this.fetchContent(url);
      console.log(`   Tipo detectado: ${content.type.toUpperCase()}`);

      // Procesa según tipo
      let extracted;
      if (content.type === 'pdf') {
        extracted = await this.extractFromPDF(content.buffer, url);
      } else {
        extracted = this.extractFromHTML(content.buffer, siteName);
      }

      if (!extracted || !extracted.rawText) {
        console.log('❌ No se pudo extraer contenido');
        return null;
      }

      // Extrae metadata
      const metadata = this.extractMetadata(
        content.type === 'html' ? content.buffer : '',
        url,
        content.type
      );

      // Combina todo
      const result = {
        ...metadata,
        ...extracted,
        status: 'pending'
      };

      // Guarda JSON
      const safeTitle = (metadata.title || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 50);

      const filename = `${safeTitle}-${Date.now()}.json`;
      const filepath = path.join(this.outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(result, null, 2));

      console.log(`✅ Guardado: ${filepath}`);
      console.log(`📊 Acordes: ${result.chords.slice(0, 10).join(', ')}...`);
      if (result.sections) {
        console.log(`📑 Secciones: ${result.sections.map(s => s.name).join(', ')}`);
      }

      return result;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Procesa archivo local de PDF
   */
  async scrapePDFFile(filepath) {
    try {
      console.log(`\n📄 Procesando archivo local: ${filepath}`);

      const buffer = fs.readFileSync(filepath);
      const extracted = await this.extractFromPDF(buffer, `file://${filepath}`);

      if (!extracted) {
        console.log('❌ No se pudo extraer contenido');
        return null;
      }

      const filename = path.basename(filepath, '.pdf');
      const result = {
        title: this.formatName(filename),
        artist: 'Desconocido',
        ...extracted,
        status: 'pending'
      };

      // Guarda JSON
      const outputFile = `${filename}-${Date.now()}.json`;
      const outputPath = path.join(this.outputDir, outputFile);

      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

      console.log(`✅ Guardado: ${outputPath}`);

      return result;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Procesa múltiples URLs desde archivo
   */
  async scrapeBatch(urlsFile) {
    const urls = fs.readFileSync(urlsFile, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    console.log(`\n📋 Procesando ${urls.length} URLs...\n`);

    const results = [];
    for (const url of urls) {
      // Detecta si es archivo local
      if (fs.existsSync(url)) {
        const result = await this.scrapePDFFile(url);
        if (result) results.push(result);
      } else {
        const result = await this.scrapeTab(url);
        if (result) results.push(result);
      }

      // Pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Guarda resumen
    const summary = {
      totalProcessed: urls.length,
      successful: results.length,
      failed: urls.length - results.length,
      tabs: results.map(r => ({ title: r.title, artist: r.artist, chords: r.chords.length })),
      processedAt: new Date().toISOString()
    };

    const summaryPath = path.join(this.outputDir, 'batch-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\n📦 Resumen: ${summaryPath}`);
    console.log(`✅ Éxitosos: ${results.length}/${urls.length}`);

    return summary;
  }
}

module.exports = TabScraperV2;

// Ejecución directa
if (require.main === module) {
  const scraper = new TabScraperV2();

  const arg1 = process.argv[2];
  const arg2 = process.argv[3];

  if (!arg1) {
    console.log(`
🎸 Tab Scraper V2 - Con soporte para PDFs

📖 Uso:

  Una URL (HTML o PDF):
    node tab-scraper-v2.js "https://acordesweb.com/song.pdf"
    node tab-scraper-v2.js "https://cifraclub.com/song/"

  Archivo PDF local:
    node tab-scraper-v2.js "./mi-tab.pdf"

  Batch desde archivo de URLs:
    node tab-scraper-v2.js --batch urls.txt

✨ Features:
  - Detecta automáticamente HTML vs PDF
  - Extrae acordes y letra
  - Organiza en secciones (Intro, Verso, Coro...)
  - Genera JSON listo para importar
    `);
  } else if (arg1 === '--batch') {
    scraper.scrapeBatch(arg2 || 'urls.txt');
  } else if (fs.existsSync(arg1) && arg1.endsWith('.pdf')) {
    scraper.scrapePDFFile(arg1);
  } else {
    scraper.scrapeTab(arg1, arg2 || 'generic');
  }
}
