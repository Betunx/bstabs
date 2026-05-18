/**
 * Cleanup Navigation Pages
 *
 * Elimina las carpetas de páginas de navegación que fueron extraídas por error.
 *
 * Usage:
 *   node cleanup-navigation-pages.js
 *   node cleanup-navigation-pages.js --dry-run
 */

const fs = require('fs');
const path = require('path');

class NavigationPagesCleanup {
  constructor() {
    this.imagesDir = path.join(__dirname, '../../output/espirituguitarrista-catalog/images');

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
      'ultimos-tutoriales'
    ];

    this.stats = {
      artistsProcessed: 0,
      foldersDeleted: 0,
      foldersKept: 0
    };
  }

  /**
   * Delete folder recursively
   */
  deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach(file => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath);
    }
  }

  /**
   * Clean navigation pages
   */
  run(dryRun = false) {
    console.log('🧹 Limpieza de páginas de navegación\n');
    console.log('━'.repeat(60) + '\n');

    if (dryRun) {
      console.log('⚠️  MODO DRY-RUN (no se eliminará nada)\n');
    }

    if (!fs.existsSync(this.imagesDir)) {
      console.error('❌ Directorio no encontrado:', this.imagesDir);
      process.exit(1);
    }

    // Procesar cada artista
    const artists = fs.readdirSync(this.imagesDir);

    for (const artist of artists) {
      const artistPath = path.join(this.imagesDir, artist);
      if (!fs.statSync(artistPath).isDirectory()) continue;

      console.log(`📂 ${artist}`);
      this.stats.artistsProcessed++;

      const songs = fs.readdirSync(artistPath);
      let deletedCount = 0;
      let keptCount = 0;

      for (const song of songs) {
        const songPath = path.join(artistPath, song);
        if (!fs.statSync(songPath).isDirectory()) continue;

        // Verificar si es página de navegación
        if (this.navigationPages.includes(song.toLowerCase())) {
          console.log(`   ✗ Eliminando: ${song}`);

          if (!dryRun) {
            this.deleteFolderRecursive(songPath);
          }

          deletedCount++;
          this.stats.foldersDeleted++;
        } else {
          keptCount++;
          this.stats.foldersKept++;
        }
      }

      console.log(`   Eliminadas: ${deletedCount}, Conservadas: ${keptCount}\n`);
    }

    // Resumen
    console.log('━'.repeat(60));
    console.log('✅ LIMPIEZA COMPLETADA\n');
    console.log(`📊 Estadísticas:`);
    console.log(`   Artistas procesados: ${this.stats.artistsProcessed}`);
    console.log(`   Carpetas eliminadas: ${this.stats.foldersDeleted}`);
    console.log(`   Canciones conservadas: ${this.stats.foldersKept}`);

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

  const cleanup = new NavigationPagesCleanup();
  cleanup.run(dryRun);
}

main();