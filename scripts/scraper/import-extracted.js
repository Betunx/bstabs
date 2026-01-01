/**
 * Import Extracted Tabs - Importa tabs desde extracted-tabs/ al API
 *
 * Uso:
 *   node import-extracted.js [limit]
 *
 * Ejemplos:
 *   node import-extracted.js          # Importa todas las tabs en extracted-tabs/
 *   node import-extracted.js 10       # Importa solo las primeras 10
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuración
const API_URL = 'https://blacksheep-api.bstabs.workers.dev';
const API_KEY = process.env.ADMIN_API_KEY || 'admin123';
const EXTRACTED_DIR = path.join(__dirname, 'extracted-tabs');

class ExtractedImporter {
  constructor() {
    this.stats = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: 0,
      duplicates: 0
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
   * Lee todos los archivos JSON de extracted-tabs/
   */
  getExtractedTabs() {
    if (!fs.existsSync(EXTRACTED_DIR)) {
      throw new Error(`Directorio no encontrado: ${EXTRACTED_DIR}`);
    }

    const files = fs.readdirSync(EXTRACTED_DIR)
      .filter(f => f.endsWith('.json') && f !== 'batch-summary.json')
      .map(f => path.join(EXTRACTED_DIR, f));

    return files;
  }

  /**
   * Lee y parsea una tab desde JSON
   */
  readTabFile(filepath) {
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const tab = JSON.parse(content);
      return tab;
    } catch (error) {
      console.error(`   ❌ Error leyendo ${path.basename(filepath)}: ${error.message}`);
      return null;
    }
  }

  /**
   * Valida que una tab tenga el formato correcto para el API
   */
  validateTab(tab) {
    if (!tab.title || !tab.artist) {
      return { valid: false, reason: 'Falta título o artista' };
    }

    if (!tab.sections || tab.sections.length === 0) {
      return { valid: false, reason: 'Sin secciones' };
    }

    // Verificar que al menos una sección tenga contenido
    const hasContent = tab.sections.some(s =>
      s.lines && s.lines.length > 0
    );

    if (!hasContent) {
      return { valid: false, reason: 'Sin contenido en secciones' };
    }

    return { valid: true };
  }

  /**
   * Formatea una tab al formato del API
   */
  formatForApi(tab) {
    return {
      title: tab.title,
      artist: tab.artist,
      key: tab.key || null,
      tempo: tab.tempo || null,
      time_signature: tab.time_signature || '4/4',
      tuning: tab.tuning || 'Standard (EADGBE)',
      difficulty: tab.difficulty || 'intermediate',
      story: tab.story || null,
      sections: tab.sections,
      spotify_url: tab.spotify_url || null,
      youtube_url: tab.youtube_url || null,
      source_url: tab.source_url || tab.sourceUrl || null,
      status: 'pending'
    };
  }

  /**
   * Sube una tab al API
   */
  async uploadTab(tab) {
    try {
      const { data, status } = await this.fetch(`${API_URL}/songs`, {
        method: 'POST',
        body: tab
      });

      if (status === 201 || status === 200) {
        this.stats.imported++;
        return { success: true, id: data.id };
      } else if (data.error?.toLowerCase().includes('duplicate') ||
                 data.error?.toLowerCase().includes('already exists') ||
                 data.error?.toLowerCase().includes('unique')) {
        this.stats.duplicates++;
        return { success: false, duplicate: true };
      } else {
        console.log(`      Error: ${data.error || 'Unknown'}`);
        this.stats.errors++;
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.log(`      Error: ${error.message}`);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Ejecuta la importación
   */
  async run(limit = null) {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('📥 BLACK SHEEP - IMPORTAR TABS EXTRAÍDAS');
    console.log('════════════════════════════════════════════════════════');
    console.log(`📁 Directorio: ${EXTRACTED_DIR}`);
    console.log(`🌐 API: ${API_URL}`);
    console.log('════════════════════════════════════════════════════════\n');

    const startTime = Date.now();

    // Leer archivos
    let files = this.getExtractedTabs();
    this.stats.total = files.length;

    console.log(`✅ Encontrados ${files.length} archivos JSON\n`);

    if (limit) {
      files = files.slice(0, limit);
      console.log(`⚠️  Limitando a ${limit} tabs\n`);
    }

    // Importar cada tab
    for (let i = 0; i < files.length; i++) {
      const filepath = files[i];
      const filename = path.basename(filepath);
      const progress = `[${i + 1}/${files.length}]`;

      process.stdout.write(`${progress} 📄 ${filename}... `);

      // Leer archivo
      const tab = this.readTabFile(filepath);
      if (!tab) {
        console.log('❌ (error leyendo)');
        this.stats.errors++;
        continue;
      }

      // Validar
      const validation = this.validateTab(tab);
      if (!validation.valid) {
        console.log(`⏭️  (${validation.reason})`);
        this.stats.skipped++;
        continue;
      }

      // Formatear
      const formatted = this.formatForApi(tab);

      process.stdout.write(`\n      ♪ ${formatted.title} - ${formatted.artist}... `);

      // Subir
      const result = await this.uploadTab(formatted);

      if (result.success) {
        console.log('✅');
      } else if (result.duplicate) {
        console.log('⏭️  (duplicado)');
      } else {
        console.log('❌');
      }

      // Pausa para no saturar (100ms)
      await this.sleep(100);
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);

    console.log('\n════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN FINAL');
    console.log('════════════════════════════════════════════════════════');
    console.log(`📝 Archivos procesados: ${this.stats.total}`);
    console.log(`✅ Importadas:          ${this.stats.imported}`);
    console.log(`⏭️  Duplicados:          ${this.stats.duplicates}`);
    console.log(`⏭️  Omitidas:            ${this.stats.skipped}`);
    console.log(`❌ Errores:             ${this.stats.errors}`);
    console.log(`⏱️  Tiempo:              ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
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

  const importer = new ExtractedImporter();
  importer.run(limit).catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = ExtractedImporter;
