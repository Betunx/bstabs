/**
 * Mass Publish Script - Publica todas las tabs pendientes
 *
 * Uso:
 *   node mass-publish.js [limit]
 *
 * Ejemplos:
 *   node mass-publish.js          # Publica todas las pendientes
 *   node mass-publish.js 100      # Publica solo las primeras 100
 */

const https = require('https');

// Configuración
const API_URL = 'https://blacksheep-api.bstabs.workers.dev';
const API_KEY = process.env.ADMIN_API_KEY || 'admin123';

class MassPublisher {
  constructor() {
    this.stats = {
      total: 0,
      published: 0,
      errors: 0,
      skipped: 0
    };
  }

  /**
   * Fetch helper
   */
  fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);

      const reqOptions = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          ...options.headers
        }
      };

      const req = https.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (error) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * Obtiene todas las tabs pendientes
   */
  async getPendingSongs() {
    console.log('📥 Obteniendo tabs pendientes...');

    const { data, status } = await this.fetch(`${API_URL}/admin/songs?status=pending`);

    if (status !== 200) {
      throw new Error(`Error al obtener tabs: ${status}`);
    }

    return data;
  }

  /**
   * Publica una canción
   */
  async publishSong(songId, title) {
    try {
      const { status, data } = await this.fetch(
        `${API_URL}/songs/${songId}/publish`,
        { method: 'POST', body: {} }
      );

      if (status === 200) {
        this.stats.published++;
        return { success: true };
      } else {
        console.log(`   ⚠️  Error: ${data.error || 'Unknown'}`);
        this.stats.errors++;
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Valida que una tab tenga contenido mínimo
   */
  isValidSong(song) {
    // Debe tener título, artista y al menos una sección con contenido
    if (!song.title || !song.artist) {
      return false;
    }

    if (!song.sections || song.sections.length === 0) {
      return false;
    }

    // Al menos una sección debe tener líneas
    const hasContent = song.sections.some(section =>
      section.lines && section.lines.length > 0
    );

    return hasContent;
  }

  /**
   * Ejecuta la publicación masiva
   */
  async run(limit = null) {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('📢 BLACK SHEEP - PUBLICACIÓN MASIVA');
    console.log('════════════════════════════════════════════════════════');
    console.log(`🌐 API: ${API_URL}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 6)}***`);
    console.log('════════════════════════════════════════════════════════\n');

    const startTime = Date.now();

    // Obtener tabs pendientes
    let songs = await this.getPendingSongs();
    this.stats.total = songs.length;

    console.log(`✅ Encontradas ${songs.length} tabs pendientes\n`);

    if (limit) {
      songs = songs.slice(0, limit);
      console.log(`⚠️  Limitando a ${limit} tabs\n`);
    }

    // Publicar cada tab
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const progress = `[${i + 1}/${songs.length}]`;

      process.stdout.write(`${progress} ♪ ${song.title} - ${song.artist}... `);

      // Validar contenido
      if (!this.isValidSong(song)) {
        console.log('⏭️  (sin contenido válido)');
        this.stats.skipped++;
        continue;
      }

      // Publicar
      const result = await this.publishSong(song.id, song.title);

      if (result.success) {
        console.log('✅');
      } else {
        console.log('❌');
      }

      // Pausa para no saturar el API (100ms entre requests)
      await this.sleep(100);
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);

    console.log('\n════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN FINAL');
    console.log('════════════════════════════════════════════════════════');
    console.log(`📝 Total pendientes: ${this.stats.total}`);
    console.log(`✅ Publicadas:       ${this.stats.published}`);
    console.log(`⏭️  Omitidas:         ${this.stats.skipped}`);
    console.log(`❌ Errores:          ${this.stats.errors}`);
    console.log(`⏱️  Tiempo:           ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
    console.log('════════════════════════════════════════════════════════\n');

    return this.stats;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecución
if (require.main === module) {
  const limit = process.argv[2] ? parseInt(process.argv[2]) : null;

  const publisher = new MassPublisher();
  publisher.run(limit).catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = MassPublisher;
