/**
 * Script para importar tablaturas extraídas a la base de datos
 * Lee los archivos JSON generados por el scraper y los envía al API
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class TabImporter {
  constructor(apiUrl = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
    this.tabsDir = path.join(__dirname, 'extracted-tabs');
  }

  /**
   * Envía datos a la API
   */
  async postToAPI(endpoint, data) {
    const url = new URL(endpoint, this.apiUrl);

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);

      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(responseData));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Importa un solo archivo JSON
   */
  async importSingleFile(filepath) {
    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      console.log(`📤 Importando: ${data.title || 'Sin título'}`);

      const result = await this.postToAPI('/api/songs', data);

      console.log(`✅ Importado: ${result.title} (ID: ${result.id})`);

      return result;

    } catch (error) {
      console.error(`❌ Error al importar ${filepath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Importa todos los archivos JSON del directorio
   */
  async importAll() {
    if (!fs.existsSync(this.tabsDir)) {
      console.log(`❌ Directorio no encontrado: ${this.tabsDir}`);
      console.log('   Primero ejecuta el scraper para extraer tabs');
      return;
    }

    const files = fs.readdirSync(this.tabsDir)
      .filter(f => f.endsWith('.json') && !f.includes('summary'));

    if (files.length === 0) {
      console.log('⚠️  No hay archivos JSON para importar');
      return;
    }

    console.log(`\n📦 Importando ${files.length} tablaturas...\n`);

    const results = [];
    for (const file of files) {
      const filepath = path.join(this.tabsDir, file);
      const result = await this.importSingleFile(filepath);

      if (result) {
        results.push(result);
      }

      // Pausa pequeña entre imports
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Resumen de importación:`);
    console.log(`   Total archivos: ${files.length}`);
    console.log(`   Importados: ${results.length}`);
    console.log(`   Fallidos: ${files.length - results.length}`);

    return results;
  }

  /**
   * Importa en batch (más eficiente)
   */
  async importBatch() {
    if (!fs.existsSync(this.tabsDir)) {
      console.log(`❌ Directorio no encontrado: ${this.tabsDir}`);
      return;
    }

    const files = fs.readdirSync(this.tabsDir)
      .filter(f => f.endsWith('.json') && !f.includes('summary'));

    if (files.length === 0) {
      console.log('⚠️  No hay archivos JSON para importar');
      return;
    }

    console.log(`\n📦 Importando ${files.length} tablaturas en batch...\n`);

    const songs = files.map(file => {
      const filepath = path.join(this.tabsDir, file);
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    });

    try {
      const result = await this.postToAPI('/api/songs/import/batch', { songs });

      console.log(`✅ Batch importado exitosamente:`);
      console.log(`   Importados: ${result.imported}`);
      console.log(`   Fallidos: ${result.failed}`);

      return result;

    } catch (error) {
      console.error(`❌ Error en batch import: ${error.message}`);
      return null;
    }
  }
}

// Exporta la clase
module.exports = TabImporter;

// Si se ejecuta directamente
if (require.main === module) {
  const apiUrl = process.argv[2] || 'http://localhost:3000';
  const mode = process.argv[3] || 'batch';

  const importer = new TabImporter(apiUrl);

  if (mode === 'batch') {
    importer.importBatch();
  } else {
    importer.importAll();
  }
}
