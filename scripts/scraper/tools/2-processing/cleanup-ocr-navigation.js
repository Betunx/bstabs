/**
 * Cleanup OCR Navigation Pages
 *
 * Elimina archivos JSON/TXT de páginas de navegación del directorio ocr-results.
 *
 * Usage:
 *   node cleanup-ocr-navigation.js
 *   node cleanup-ocr-navigation.js --dry-run
 */

const fs = require('fs');
const path = require('path');

class OCRNavigationCleanup {
  constructor() {
    this.ocrDir = path.join(__dirname, '../../output/espirituguitarrista-catalog/ocr-results');

    // Lista de páginas de navegación a eliminar
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
      'wp-json'
    ];

    this.stats = {
      artistsProcessed: 0,
      filesDeleted: 0,
      filesKept: 0
    };
  }

  /**
   * Delete file
   */
  deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Clean navigation pages from OCR results
   */
  run(dryRun = false) {
    console.log('🧹 Limpieza de páginas de navegación (OCR Results)\n');
    console.log('━'.repeat(60) + '\n');

    if (dryRun) {
      console.log('⚠️  MODO DRY-RUN (no se eliminará nada)\n');
    }

    if (!fs.existsSync(this.ocrDir)) {
      console.error('❌ Directorio no encontrado:', this.ocrDir);
      process.exit(1);
    }

    // Procesar cada artista
    const artists = fs.readdirSync(this.ocrDir);

    for (const artist of artists) {
      const artistPath = path.join(this.ocrDir, artist);
      if (!fs.statSync(artistPath).isDirectory()) continue;

      console.log(`📂 ${artist}`);
      this.stats.artistsProcessed++;

      const files = fs.readdirSync(artistPath);
      let deletedCount = 0;
      let keptCount = 0;

      for (const file of files) {
        const filePath = path.join(artistPath, file);
        const basename = path.basename(file, path.extname(file));

        // Verificar si es página de navegación
        if (this.navigationPages.includes(basename.toLowerCase())) {
          console.log(`   ✗ Eliminando: ${file}`);

          if (!dryRun) {
            this.deleteFile(filePath);
          }

          deletedCount++;
          this.stats.filesDeleted++;
        } else {
          keptCount++;
          this.stats.filesKept++;
        }
      }

      console.log(`   Eliminados: ${deletedCount}, Conservados: ${keptCount}\n`);
    }

    // Resumen
    console.log('━'.repeat(60));
    console.log('✅ LIMPIEZA COMPLETADA\n');
    console.log(`📊 Estadísticas:`);
    console.log(`   Artistas procesados: ${this.stats.artistsProcessed}`);
    console.log(`   Archivos eliminados: ${this.stats.filesDeleted}`);
    console.log(`   Archivos conservados: ${this.stats.filesKept}`);

    if (dryRun) {
      console.log('\n⚠️  Esto fue un DRY-RUN. Ejecuta sin --dry-run para eliminar.');
    }

    console.log('━'.repeat(60) + '\n');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const cleanup = new OCRNavigationCleanup();
  cleanup.run(dryRun);
}

main();
