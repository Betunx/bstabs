/**
 * Script para limpiar canciones duplicadas de la base de datos
 *
 * Uso:
 *   node scripts/cleanup-duplicates.js --dry-run    (solo muestra qué se eliminará)
 *   node scripts/cleanup-duplicates.js --execute    (ejecuta la eliminación)
 */

const API_URL = 'https://blacksheep-api.bstabs.workers.dev';
const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

class DuplicateCleaner {
  constructor() {
    this.stats = {
      totalSongs: 0,
      duplicateGroups: 0,
      songsToDelete: 0,
      songsDeleted: 0,
      errors: 0
    };
  }

  async fetchAllSongs() {
    console.log('📥 Descargando todas las canciones...');
    const response = await fetch(`${API_URL}/songs`);
    const songs = await response.json();
    this.stats.totalSongs = songs.length;
    console.log(`   Total: ${songs.length} canciones\n`);
    return songs;
  }

  findDuplicates(songs) {
    console.log('🔍 Buscando duplicados...');
    const titleMap = {};

    // Agrupar por title + artist
    songs.forEach(song => {
      const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
      if (!titleMap[key]) titleMap[key] = [];
      titleMap[key].push(song);
    });

    // Filtrar solo grupos con duplicados
    const duplicates = Object.entries(titleMap)
      .filter(([_, group]) => group.length > 1)
      .map(([key, group]) => ({
        key,
        count: group.length,
        songs: group.sort((a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
        )
      }));

    this.stats.duplicateGroups = duplicates.length;
    this.stats.songsToDelete = duplicates.reduce((sum, g) => sum + (g.count - 1), 0);

    console.log(`   Grupos duplicados: ${duplicates.length}`);
    console.log(`   Canciones a eliminar: ${this.stats.songsToDelete}\n`);

    return duplicates;
  }

  async deleteSong(id) {
    const response = await fetch(`${API_URL}/songs/${id}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': process.env.API_KEY || 'your-api-key-here'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async cleanup(duplicates) {
    console.log('🧹 Iniciando limpieza...\n');

    for (const group of duplicates) {
      const [keep, ...toDelete] = group.songs;

      console.log(`\n📂 ${group.key}`);
      console.log(`   Mantener: ${keep.id} (${keep.created_at})`);
      console.log(`   Eliminar: ${toDelete.length} duplicado(s)`);

      for (const song of toDelete) {
        console.log(`      - ${song.id} (${song.created_at})`);

        if (!isDryRun) {
          try {
            await this.deleteSong(song.id);
            this.stats.songsDeleted++;
            console.log(`        ✅ Eliminado`);
          } catch (error) {
            this.stats.errors++;
            console.log(`        ❌ Error: ${error.message}`);
          }

          // Delay para no saturar la API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE FINAL');
    console.log('='.repeat(60));
    console.log(`Canciones totales:       ${this.stats.totalSongs}`);
    console.log(`Grupos duplicados:       ${this.stats.duplicateGroups}`);
    console.log(`Canciones para eliminar: ${this.stats.songsToDelete}`);

    if (!isDryRun) {
      console.log(`Canciones eliminadas:    ${this.stats.songsDeleted}`);
      console.log(`Errores:                 ${this.stats.errors}`);
    }

    console.log('='.repeat(60));

    if (isDryRun) {
      console.log('\n⚠️  MODO DRY-RUN: No se eliminó nada');
      console.log('💡 Usa --execute para ejecutar la limpieza');
    } else {
      console.log('\n✅ Limpieza completada');
    }
  }

  async run() {
    try {
      console.log('🚀 Limpiador de Duplicados - BS Tabs\n');
      console.log(`Modo: ${isDryRun ? 'DRY-RUN (simulación)' : 'EJECUCIÓN REAL'}\n`);

      const songs = await this.fetchAllSongs();
      const duplicates = this.findDuplicates(songs);

      if (duplicates.length === 0) {
        console.log('✨ No se encontraron duplicados. Base de datos limpia!');
        return;
      }

      await this.cleanup(duplicates);
      this.printReport();

    } catch (error) {
      console.error('\n❌ Error fatal:', error.message);
      process.exit(1);
    }
  }
}

// Ejecutar
const cleaner = new DuplicateCleaner();
cleaner.run();
