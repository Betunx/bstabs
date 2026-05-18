/**
 * OCR Results Importer
 *
 * Importa resultados de OCR a la base de datos como DRAFT.
 * Permite revisión antes de publicar.
 *
 * Uso:
 *   node ocr-importer.js
 *   node ocr-importer.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class OCRImporter {
  constructor() {
    this.ocrDir = path.join(__dirname, '../../output/espirituguitarrista-catalog/ocr-results');
    this.apiUrl = 'https://blacksheep-api.bstabs.workers.dev';
    this.apiKey = process.env.ADMIN_API_KEY;

    this.stats = {
      total: 0,
      imported: 0,
      failed: 0,
      skipped: 0
    };

    if (!this.apiKey) {
      console.error('❌ Error: ADMIN_API_KEY no está definida');
      console.log('💡 Usa: set ADMIN_API_KEY=tu_key (Windows) o export ADMIN_API_KEY=tu_key (Linux/Mac)');
      process.exit(1);
    }
  }

  /**
   * Convert OCR JSON to Song format
   */
  ocrToSong(ocrData, jsonPath) {
    // Leer metadata del scraper
    const songFolder = path.dirname(path.dirname(jsonPath));
    const metadataPath = path.join(songFolder, 'metadata.json');

    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }

    // Extraer texto de lyrics
    const lyricsText = ocrData.lyrics
      .map(item => item.text)
      .join('\n\n');

    // Crear sección principal
    const sections = [];

    // Agregar requinto si existe
    if (ocrData.requinto && ocrData.requinto.length > 0) {
      sections.push({
        name: 'Requinto',
        type: 'tab',
        content: ocrData.requinto.map(item => item.text).join('\n\n')
      });
    }

    // Agregar letra con acordes
    if (lyricsText.trim()) {
      sections.push({
        name: 'Letra',
        type: 'chords_lyrics',
        content: lyricsText
      });
    }

    // Nota sobre diagramas de acordes
    if (ocrData.chords && ocrData.chords.length > 0) {
      sections.push({
        name: 'Nota',
        type: 'note',
        content: `Diagramas de acordes disponibles (${ocrData.chords.length} imágenes)`
      });
    }

    return {
      title: ocrData.song.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      artist: ocrData.artist.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      sections: sections,
      source_url: metadata.url || null,
      status: 'draft', // ← IMPORTANTE: Importar como borrador
      genre: this.guessGenre(ocrData.artist),
      story: `Extraído de Espíritu Guitarrista el ${new Date(ocrData.processedAt).toLocaleDateString('es-MX')}. OCR procesado automáticamente - requiere revisión.`
    };
  }

  /**
   * Guess genre based on artist
   */
  guessGenre(artistSlug) {
    const regionalMexicano = ['eslabon-armado', 'junior-h', 'natanael-cano', 'santa-fe-klan'];
    const rock = ['black-sabbath', 'rammstein', 'caifanes', 'fobia', 'el-tri', 'bon-jovi', 'kings-of-leon'];
    const pop = ['bratty', 'camilo', 'piso-21', 'ed-maverick', 'kevin-kaarl'];

    if (regionalMexicano.includes(artistSlug)) return 'Regional Mexicano';
    if (rock.includes(artistSlug)) return 'Rock';
    if (pop.includes(artistSlug)) return 'Pop';

    return null; // Sin género asignado
  }

  /**
   * Import song via API
   */
  async importSong(song, dryRun = false) {
    if (dryRun) {
      console.log(`   [DRY-RUN] Importaría: ${song.artist} - ${song.title}`);
      return true;
    }

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(song);

      const options = {
        hostname: 'blacksheep-api.bstabs.workers.dev',
        path: '/songs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'x-api-key': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(true);
          } else {
            console.error(`      ✗ Error HTTP ${res.statusCode}: ${data}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error(`      ✗ Error de red: ${error.message}`);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Find all OCR JSON files
   */
  findOCRFiles() {
    const files = [];

    if (!fs.existsSync(this.ocrDir)) {
      throw new Error(`Directorio OCR no encontrado: ${this.ocrDir}`);
    }

    const artists = fs.readdirSync(this.ocrDir);

    for (const artist of artists) {
      const artistPath = path.join(this.ocrDir, artist);
      if (!fs.statSync(artistPath).isDirectory()) continue;

      const songs = fs.readdirSync(artistPath).filter(f => f.endsWith('.json'));

      for (const songFile of songs) {
        files.push({
          artist,
          file: songFile,
          path: path.join(artistPath, songFile)
        });
      }
    }

    return files;
  }

  /**
   * Run import
   */
  async run(dryRun = false) {
    console.log('📥 OCR Importer - Espíritu Guitarrista\n');
    console.log('━'.repeat(60) + '\n');

    if (dryRun) {
      console.log('⚠️  MODO DRY-RUN (no se importará nada)\n');
    }

    console.log('🔍 Buscando archivos OCR...\n');

    const files = this.findOCRFiles();
    this.stats.total = files.length;

    console.log(`✅ Encontrados ${files.length} archivos JSON\n`);
    console.log(`📤 Estado de importación: DRAFT (borrador)`);
    console.log(`🔧 Requieren revisión en admin antes de publicar\n`);
    console.log('━'.repeat(60) + '\n');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      console.log(`[${i + 1}/${files.length}] ${file.artist} - ${file.file}`);

      try {
        // Leer JSON de OCR
        const ocrData = JSON.parse(fs.readFileSync(file.path, 'utf8'));

        // Convertir a formato Song
        const song = this.ocrToSong(ocrData, file.path);

        // Importar
        await this.importSong(song, dryRun);

        console.log(`   ✓ Importada como DRAFT (${song.sections.length} secciones, género: ${song.genre || 'sin asignar'})`);
        this.stats.imported++;

      } catch (error) {
        console.error(`   ✗ Error: ${error.message}`);
        this.stats.failed++;
      }

      // Esperar 500ms entre requests
      if (!dryRun && i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Resumen
    console.log('\n' + '━'.repeat(60));
    console.log('✅ IMPORTACIÓN COMPLETADA\n');
    console.log(`📊 Estadísticas:`);
    console.log(`   Total: ${this.stats.total}`);
    console.log(`   Importadas: ${this.stats.imported}`);
    console.log(`   Fallidas: ${this.stats.failed}`);
    console.log(`   Omitidas: ${this.stats.skipped}`);

    if (!dryRun) {
      console.log('\n💡 Próximos pasos:');
      console.log('   1. Revisa las canciones en https://bstabs.pages.dev/admin');
      console.log('   2. Edita/corrige según sea necesario');
      console.log('   3. Cambia el estado a "published" para hacerlas públicas');
    }

    console.log('━'.repeat(60) + '\n');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const importer = new OCRImporter();

  try {
    await importer.run(dryRun);
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
