/**
 * Importa tabs directamente a PostgreSQL
 * Sin pasar por la API REST
 * Útil para importación masiva inicial
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

class DirectDBImporter {
  constructor(config = {}) {
    this.client = new Client({
      host: config.host || 'localhost',
      port: config.port || 5432,
      database: config.database || 'blacksheep',
      user: config.user || 'postgres',
      password: config.password || 'admin123',
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });

    this.tabsDir = path.join(__dirname, 'extracted-tabs');
    this.connected = false;
  }

  /**
   * Conecta a la base de datos
   */
  async connect() {
    try {
      await this.client.connect();
      console.log('✅ Conectado a PostgreSQL');
      this.connected = true;

      // Verifica que la tabla existe
      const result = await this.client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'songs'
        );
      `);

      if (!result.rows[0].exists) {
        console.log('⚠️  Tabla "songs" no existe. Ejecuta el backend primero para crear el esquema.');
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Error al conectar a PostgreSQL:', error.message);
      console.log('\n💡 Verifica:');
      console.log('   1. PostgreSQL está corriendo');
      console.log('   2. Base de datos "blacksheep" existe');
      console.log('   3. Usuario y password son correctos');
      process.exit(1);
    }
  }

  /**
   * Convierte JSON del scraper al formato de la BD
   */
  transformScraperData(scraperData) {
    // Estructura de sections compatible con TypeORM
    const sections = scraperData.sections?.map(section => ({
      name: section.name,
      lines: section.lines.map(line => ({
        lyrics: typeof line === 'string' ? line : line.lyrics || '',
        chords: this.extractChordsFromLine(line)
      }))
    })) || [];

    return {
      title: scraperData.title || 'Sin título',
      artist: scraperData.artist || 'Desconocido',
      key: this.guessKey(scraperData.chords),
      tempo: 0, // Por defecto
      timeSignature: '4/4',
      tuning: 'Standard (EADGBE)',
      difficulty: 'intermediate',
      story: scraperData.sourceUrl
        ? `Extraído de: ${scraperData.sourceUrl}`
        : null,
      sections: JSON.stringify(sections),
      status: 'pending',
      sourceUrl: scraperData.sourceUrl,
      sourceType: scraperData.sourceType || 'unknown',
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Extrae acordes de una línea de texto
   */
  extractChordsFromLine(line) {
    const text = typeof line === 'string' ? line : line.lyrics || '';
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g;
    const matches = text.match(chordPattern) || [];

    return matches.map((chord, index) => ({
      chord: chord,
      position: text.indexOf(chord) + (index * 2) // Estimación
    }));
  }

  /**
   * Intenta adivinar el tono principal
   */
  guessKey(chords = []) {
    if (!chords || chords.length === 0) return 'C';

    // El primer acorde suele ser el tono
    const firstChord = chords[0];

    // Limpia sufijos (Am → A, Gmaj7 → G)
    return firstChord.replace(/[^A-G#b]/g, '') || 'C';
  }

  /**
   * Inserta una canción en la BD
   */
  async insertSong(data) {
    const query = `
      INSERT INTO songs (
        title, artist, key, tempo, "timeSignature", tuning,
        difficulty, story, sections, status, "sourceUrl",
        views, likes, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, title, artist;
    `;

    const values = [
      data.title,
      data.artist,
      data.key,
      data.tempo,
      data.timeSignature,
      data.tuning,
      data.difficulty,
      data.story,
      data.sections,
      data.status,
      data.sourceUrl,
      data.views,
      data.likes,
      data.createdAt,
      data.updatedAt
    ];

    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al insertar: ${error.message}`);
    }
  }

  /**
   * Importa un archivo JSON
   */
  async importFile(filepath) {
    try {
      const raw = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      console.log(`📤 Importando: ${raw.title || path.basename(filepath)}`);

      // Transforma datos
      const songData = this.transformScraperData(raw);

      // Inserta en BD
      const result = await this.insertSong(songData);

      console.log(`✅ Importado: ${result.title} (ID: ${result.id})`);

      return result;

    } catch (error) {
      console.error(`❌ Error al importar ${filepath}:`, error.message);
      return null;
    }
  }

  /**
   * Importa todos los JSONs del directorio
   */
  async importAll() {
    if (!fs.existsSync(this.tabsDir)) {
      console.log(`❌ Directorio no encontrado: ${this.tabsDir}`);
      console.log('   Primero ejecuta el scraper para extraer tabs');
      return;
    }

    const files = fs.readdirSync(this.tabsDir)
      .filter(f => f.endsWith('.json') && !f.includes('summary'))
      .map(f => path.join(this.tabsDir, f));

    if (files.length === 0) {
      console.log('⚠️  No hay archivos JSON para importar');
      return;
    }

    console.log(`\n📦 Importando ${files.length} canciones...\n`);

    const results = [];
    for (const file of files) {
      const result = await this.importFile(file);
      if (result) {
        results.push(result);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   Total archivos: ${files.length}`);
    console.log(`   Importados: ${results.length}`);
    console.log(`   Fallidos: ${files.length - results.length}`);

    // Muestra estadísticas
    await this.showStats();

    return results;
  }

  /**
   * Muestra estadísticas de la BD
   */
  async showStats() {
    const stats = await this.client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'draft') as draft
      FROM songs;
    `);

    console.log(`\n📊 Estado de la base de datos:`);
    console.log(`   Total canciones: ${stats.rows[0].total}`);
    console.log(`   Pending: ${stats.rows[0].pending}`);
    console.log(`   Published: ${stats.rows[0].published}`);
    console.log(`   Draft: ${stats.rows[0].draft}`);
  }

  /**
   * Cierra conexión
   */
  async disconnect() {
    if (this.connected) {
      await this.client.end();
      console.log('\n✅ Desconectado de PostgreSQL');
    }
  }
}

// Exporta
module.exports = DirectDBImporter;

// Ejecución directa
if (require.main === module) {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'blacksheep',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin123',
    ssl: process.env.DB_SSL === 'true', // true para Supabase, false para local
  };

  const importer = new DirectDBImporter(config);

  (async () => {
    try {
      await importer.connect();
      await importer.importAll();
    } catch (error) {
      console.error('❌ Error fatal:', error.message);
    } finally {
      await importer.disconnect();
    }
  })();
}
