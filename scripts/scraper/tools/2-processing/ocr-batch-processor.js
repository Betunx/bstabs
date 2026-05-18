/**
 * OCR Batch Processor - Espíritu Guitarrista
 *
 * Procesa TODAS las carpetas de canciones con OCR en batch.
 *
 * Uso:
 *   node ocr-batch-processor.js
 *   node ocr-batch-processor.js --resume
 */

const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

class OCRBatchProcessor {
  constructor() {
    this.inputDir = path.join(__dirname, '../../output/espirituguitarrista-catalog/images');
    this.outputDir = path.join(__dirname, '../../output/espirituguitarrista-catalog/ocr-results');
    this.progressFile = path.join(this.outputDir, 'progress.json');

    this.stats = {
      total: 0,
      processed: 0,
      failed: 0,
      totalImages: 0
    };

    this.progress = {
      processedFolders: []
    };

    // Crear carpeta output
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Cargar progreso
    if (fs.existsSync(this.progressFile)) {
      this.progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
    }

    this.worker = null;
  }

  /**
   * Initialize Tesseract worker
   */
  async initWorker() {
    if (this.worker) return;

    console.log('🔧 Inicializando Tesseract OCR...');
    this.worker = await createWorker('spa', 1, {
      logger: () => {} // Silenciar logs
    });
    console.log('✅ Tesseract listo\n');
  }

  /**
   * Find all song folders
   */
  findSongFolders() {
    const folders = [];

    if (!fs.existsSync(this.inputDir)) {
      throw new Error(`Directorio no encontrado: ${this.inputDir}`);
    }

    // Recorrer artistas
    const artists = fs.readdirSync(this.inputDir);

    for (const artist of artists) {
      const artistPath = path.join(this.inputDir, artist);
      if (!fs.statSync(artistPath).isDirectory()) continue;

      // Recorrer canciones
      const songs = fs.readdirSync(artistPath);

      for (const song of songs) {
        const songPath = path.join(artistPath, song);
        if (!fs.statSync(songPath).isDirectory()) continue;

        folders.push({
          artist,
          song,
          path: songPath
        });
      }
    }

    return folders;
  }

  /**
   * Process single image with OCR
   */
  async processImage(imagePath) {
    const { data } = await this.worker.recognize(imagePath);
    return {
      text: data.text,
      confidence: data.confidence
    };
  }

  /**
   * Process single song folder
   */
  async processSongFolder(folder) {
    const { artist, song, path: songPath } = folder;

    console.log(`📷 ${artist} - ${song}`);

    try {
      const result = {
        artist,
        song,
        processedAt: new Date().toISOString(),
        lyrics: [],
        requinto: [],
        chords: []
      };

      let totalImages = 0;
      let totalConfidence = 0;

      // Procesar lyrics
      const lyricsDir = path.join(songPath, 'lyrics');
      if (fs.existsSync(lyricsDir)) {
        const files = fs.readdirSync(lyricsDir)
          .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
          .sort();

        for (const file of files) {
          const imagePath = path.join(lyricsDir, file);
          const ocrResult = await this.processImage(imagePath);

          result.lyrics.push({
            filename: file,
            text: ocrResult.text,
            confidence: ocrResult.confidence
          });

          totalImages++;
          totalConfidence += ocrResult.confidence;
        }
      }

      // Procesar requinto
      const requintoDir = path.join(songPath, 'requinto');
      if (fs.existsSync(requintoDir)) {
        const files = fs.readdirSync(requintoDir)
          .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
          .sort();

        for (const file of files) {
          const imagePath = path.join(requintoDir, file);
          const ocrResult = await this.processImage(imagePath);

          result.requinto.push({
            filename: file,
            text: ocrResult.text,
            confidence: ocrResult.confidence
          });

          totalImages++;
          totalConfidence += ocrResult.confidence;
        }
      }

      // Chords (no procesar con OCR, son diagramas visuales)
      const chordsDir = path.join(songPath, 'chords');
      if (fs.existsSync(chordsDir)) {
        const files = fs.readdirSync(chordsDir)
          .filter(f => /\.(png|jpg|jpeg)$/i.test(f));

        result.chords = files.map(f => ({
          filename: f,
          note: 'Chord diagram (visual)'
        }));
      }

      const avgConfidence = totalImages > 0 ? totalConfidence / totalImages : 0;

      // Guardar JSON
      const artistOutputDir = path.join(this.outputDir, artist);
      if (!fs.existsSync(artistOutputDir)) {
        fs.mkdirSync(artistOutputDir, { recursive: true });
      }

      const outputPath = path.join(artistOutputDir, `${song}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

      // Guardar TXT legible
      const textOutput = this.generateReadableText(result, avgConfidence);
      const txtPath = path.join(artistOutputDir, `${song}.txt`);
      fs.writeFileSync(txtPath, textOutput);

      console.log(`   ✓ ${totalImages} imágenes procesadas (${Math.round(avgConfidence)}% confianza)\n`);

      this.stats.processed++;
      this.stats.totalImages += totalImages;

      return true;

    } catch (error) {
      console.error(`   ✗ Error: ${error.message}\n`);
      this.stats.failed++;
      return false;
    }
  }

  /**
   * Generate readable text
   */
  generateReadableText(result, avgConfidence) {
    let output = '';

    output += '═'.repeat(60) + '\n';
    output += `  ${result.song.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n`;
    output += `  ${result.artist.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n`;
    output += '═'.repeat(60) + '\n\n';

    output += `Extraído: ${result.processedAt}\n`;
    output += `Confianza promedio: ${Math.round(avgConfidence)}%\n\n`;

    // Requinto
    if (result.requinto.length > 0) {
      output += '─'.repeat(60) + '\n';
      output += 'REQUINTO / PUNTEO\n';
      output += '─'.repeat(60) + '\n\n';

      result.requinto.forEach((item, idx) => {
        output += `[Requinto ${idx + 1}]\n\n`;
        output += item.text + '\n\n';
      });
    }

    // Lyrics
    if (result.lyrics.length > 0) {
      output += '─'.repeat(60) + '\n';
      output += 'LETRA CON ACORDES\n';
      output += '─'.repeat(60) + '\n\n';

      result.lyrics.forEach((item) => {
        output += item.text + '\n';
      });
    }

    // Chords
    if (result.chords.length > 0) {
      output += '\n' + '─'.repeat(60) + '\n';
      output += 'ACORDES (Diagramas visuales)\n';
      output += '─'.repeat(60) + '\n';
      result.chords.forEach(chord => {
        output += `  - ${chord.filename}\n`;
      });
    }

    output += '\n' + '═'.repeat(60) + '\n';

    return output;
  }

  /**
   * Save progress
   */
  saveProgress() {
    fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
  }

  /**
   * Run batch processing
   */
  async run(resume = false) {
    console.log('🔍 OCR Batch Processor - Espíritu Guitarrista\n');
    console.log('━'.repeat(60) + '\n');

    // Find all song folders
    console.log('📂 Escaneando carpetas...\n');
    let folders = this.findSongFolders();

    console.log(`✅ Encontradas ${folders.length} canciones\n`);
    this.stats.total = folders.length;

    // Filter if resuming
    if (resume) {
      folders = folders.filter(f =>
        !this.progress.processedFolders.includes(`${f.artist}/${f.song}`)
      );
      console.log(`⏭️  Saltando ${this.stats.total - folders.length} ya procesadas\n`);
    }

    if (folders.length === 0) {
      console.log('✅ Todas las canciones ya fueron procesadas\n');
      return;
    }

    // Initialize OCR
    await this.initWorker();

    console.log('━'.repeat(60) + '\n');
    console.log('🔄 Procesando canciones...\n');

    const startTime = Date.now();

    // Process each folder
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];

      console.log(`[${i + 1}/${folders.length}]`);

      const success = await this.processSongFolder(folder);

      if (success) {
        this.progress.processedFolders.push(`${folder.artist}/${folder.song}`);
        this.saveProgress();
      }

      // Mostrar progreso cada 10 canciones
      if ((i + 1) % 10 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        const rate = (i + 1) / elapsed;
        const remaining = (folders.length - i - 1) / rate;

        console.log(`📊 Progreso: ${i + 1}/${folders.length} (${Math.round((i + 1) / folders.length * 100)}%)`);
        console.log(`⏱️  Tiempo: ${elapsed}min transcurridos, ~${remaining.toFixed(1)}min restantes\n`);
      }
    }

    // Cleanup
    if (this.worker) {
      await this.worker.terminate();
    }

    // Summary
    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log('\n' + '━'.repeat(60));
    console.log('✅ PROCESAMIENTO COMPLETADO\n');
    console.log(`📊 Estadísticas:`);
    console.log(`   Total: ${this.stats.total} canciones`);
    console.log(`   Procesadas: ${this.stats.processed}`);
    console.log(`   Fallidas: ${this.stats.failed}`);
    console.log(`   Imágenes procesadas: ${this.stats.totalImages}`);
    console.log(`   Tiempo total: ${totalTime} minutos`);
    console.log('\n📁 Output: ' + this.outputDir);
    console.log('━'.repeat(60) + '\n');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const resume = args.includes('--resume');

  const processor = new OCRBatchProcessor();

  try {
    await processor.run(resume);
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
