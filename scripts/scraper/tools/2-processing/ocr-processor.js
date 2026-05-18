/**
 * OCR Processor - Extrae texto de imágenes de tablaturas
 *
 * Requisitos:
 *   npm install tesseract.js
 *
 * Uso:
 *   node ocr-processor.js "./downloaded-tabs/y-lloro"
 *   node ocr-processor.js "./downloaded-tabs/y-lloro/lyrics/lyrics-1.png"
 */

const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

class OCRProcessor {
  constructor() {
    this.worker = null;
    this.outputDir = path.join(__dirname, 'ocr-results');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Initialize Tesseract worker
   */
  async initWorker() {
    if (this.worker) return;

    console.log('🔧 Inicializando Tesseract OCR...');
    this.worker = await createWorker('spa', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          process.stdout.write(`\r   Progreso: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    console.log('\n✅ Tesseract listo\n');
  }

  /**
   * Process single image with OCR
   */
  async processImage(imagePath) {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Imagen no encontrada: ${imagePath}`);
    }

    await this.initWorker();

    console.log(`📷 Procesando: ${path.basename(imagePath)}`);

    const { data } = await this.worker.recognize(imagePath);

    return {
      text: data.text,
      confidence: data.confidence,
      lines: data.lines.map(line => ({
        text: line.text,
        confidence: line.confidence
      }))
    };
  }

  /**
   * Process all images in a folder
   */
  async processFolder(folderPath) {
    console.log(`📁 Procesando carpeta: ${folderPath}\n`);

    const results = {
      metadata: {
        processedAt: new Date().toISOString(),
        sourceFolder: folderPath
      },
      requinto: [],
      chords: [],
      lyrics: []
    };

    // Load metadata if exists
    const metadataPath = path.join(folderPath, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      results.metadata = { ...results.metadata, ...metadata };
    }

    // Process requinto images
    const requintoFolder = path.join(folderPath, 'requinto');
    if (fs.existsSync(requintoFolder)) {
      const files = fs.readdirSync(requintoFolder)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .sort();

      console.log(`🎸 Requinto (${files.length} imágenes):`);
      for (const file of files) {
        const imagePath = path.join(requintoFolder, file);
        const ocrResult = await this.processImage(imagePath);
        results.requinto.push({
          filename: file,
          ...ocrResult
        });
        console.log(`   ✓ Confianza: ${Math.round(ocrResult.confidence)}%\n`);
      }
    }

    // Process chord diagrams (skip OCR, these are visual)
    const chordsFolder = path.join(folderPath, 'chords');
    if (fs.existsSync(chordsFolder)) {
      const files = fs.readdirSync(chordsFolder)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f));

      console.log(`🎵 Acordes (${files.length} diagramas - saltando OCR):`);
      results.chords = files.map(f => ({
        filename: f,
        note: 'Chord diagrams are visual - OCR not needed'
      }));
      console.log(`   ℹ️  Los diagramas de acordes se mantienen como imágenes\n`);
    }

    // Process lyrics images
    const lyricsFolder = path.join(folderPath, 'lyrics');
    if (fs.existsSync(lyricsFolder)) {
      const files = fs.readdirSync(lyricsFolder)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .sort();

      console.log(`📝 Letras (${files.length} imágenes):`);
      for (const file of files) {
        const imagePath = path.join(lyricsFolder, file);
        const ocrResult = await this.processImage(imagePath);
        results.lyrics.push({
          filename: file,
          ...ocrResult
        });
        console.log(`   ✓ Confianza: ${Math.round(ocrResult.confidence)}%\n`);
      }
    }

    // Save results
    const songName = path.basename(folderPath);
    const outputPath = path.join(this.outputDir, `${songName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n💾 Resultados guardados en:`);
    console.log(`   ${outputPath}\n`);

    // Generate readable text file
    const textOutputPath = path.join(this.outputDir, `${songName}.txt`);
    const readableText = this.generateReadableText(results);
    fs.writeFileSync(textOutputPath, readableText);

    console.log(`📄 Texto legible guardado en:`);
    console.log(`   ${textOutputPath}\n`);

    return results;
  }

  /**
   * Generate human-readable text from OCR results
   */
  generateReadableText(results) {
    let output = '';

    output += '═'.repeat(60) + '\n';
    output += `  ${results.metadata.title || 'Sin título'}\n`;
    if (results.metadata.artist) {
      output += `  ${results.metadata.artist}\n`;
    }
    output += '═'.repeat(60) + '\n\n';

    if (results.metadata.sourceUrl) {
      output += `Fuente: ${results.metadata.sourceUrl}\n`;
      output += `Extraído: ${results.metadata.processedAt}\n\n`;
    }

    // Requinto section
    if (results.requinto.length > 0) {
      output += '─'.repeat(60) + '\n';
      output += 'REQUINTO / PUNTEO\n';
      output += '─'.repeat(60) + '\n\n';

      results.requinto.forEach((item, idx) => {
        output += `[Requinto ${idx + 1}] (Confianza: ${Math.round(item.confidence)}%)\n\n`;
        output += item.text + '\n\n';
      });
    }

    // Lyrics section
    if (results.lyrics.length > 0) {
      output += '─'.repeat(60) + '\n';
      output += 'LETRA CON ACORDES\n';
      output += '─'.repeat(60) + '\n\n';

      results.lyrics.forEach((item, idx) => {
        output += item.text + '\n';
        if (idx < results.lyrics.length - 1) {
          output += '\n';
        }
      });
    }

    // Chords reference
    if (results.chords.length > 0) {
      output += '\n' + '─'.repeat(60) + '\n';
      output += 'ACORDES UTILIZADOS\n';
      output += '─'.repeat(60) + '\n';
      output += `(Ver diagramas en: ${results.metadata.sourceFolder}/chords/)\n\n`;

      results.chords.forEach(chord => {
        const chordName = chord.filename.replace(/\.(png|jpg|jpeg)$/i, '');
        output += `  - ${chordName}\n`;
      });
    }

    output += '\n' + '═'.repeat(60) + '\n';

    return output;
  }

  /**
   * Cleanup worker
   */
  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🔍 OCR Processor - Extrae texto de imágenes de tablaturas

Requisitos:
  npm install tesseract.js

Uso:
  node ocr-processor.js "./downloaded-tabs/nombre-cancion"
  node ocr-processor.js "./downloaded-tabs/nombre-cancion/lyrics/lyrics-1.png"

Salida:
  ./ocr-results/
    ├── nombre-cancion.json    (Datos estructurados)
    └── nombre-cancion.txt     (Texto legible)

Ejemplos:
  node ocr-processor.js "./downloaded-tabs/y-lloro"
  node ocr-processor.js "./downloaded-tabs/y-lloro/lyrics/lyrics-1.png"
    `);
    process.exit(0);
  }

  const processor = new OCRProcessor();

  try {
    const inputPath = args[0];

    // Check if it's a file or folder
    const stats = fs.statSync(inputPath);

    if (stats.isDirectory()) {
      await processor.processFolder(inputPath);
    } else if (stats.isFile()) {
      const result = await processor.processImage(inputPath);
      console.log(`\n📝 Texto extraído:\n`);
      console.log(result.text);
      console.log(`\nConfianza: ${Math.round(result.confidence)}%`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await processor.cleanup();
  }
}

main();
