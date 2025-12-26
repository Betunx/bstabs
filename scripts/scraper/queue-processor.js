/**
 * Queue Processor - Sistema de cola para procesar tabs eficientemente
 *
 * Features:
 * - Procesa URLs en paralelo (configurable)
 * - Retry automático en caso de error
 * - Priorización de fuentes
 * - Rate limiting para evitar bloqueos
 * - Guarda progreso para reanudar
 * - Integración directa con Supabase
 */

const fs = require('fs');
const path = require('path');
const TabScraperV2 = require('./tab-scraper-v2');

class QueueProcessor {
  constructor(options = {}) {
    this.scraper = new TabScraperV2();
    this.concurrency = options.concurrency || 3; // Procesa 3 tabs en paralelo
    this.retryAttempts = options.retryAttempts || 2;
    this.rateLimit = options.rateLimit || 3000; // 3 segundos entre requests
    this.prioritySources = options.prioritySources || ['cifraclub', 'acordesweb'];

    this.queue = [];
    this.processing = [];
    this.completed = [];
    this.failed = [];

    this.stateFile = path.join(__dirname, 'queue-state.json');
  }

  /**
   * Carga URLs desde archivo o array
   */
  loadQueue(source) {
    let urls = [];

    if (typeof source === 'string') {
      // Es un archivo
      if (fs.existsSync(source)) {
        const content = fs.readFileSync(source, 'utf-8');
        urls = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'));
      } else {
        console.error(`❌ Archivo no encontrado: ${source}`);
        return;
      }
    } else if (Array.isArray(source)) {
      urls = source;
    }

    // Agrega a la cola con metadata
    for (const url of urls) {
      this.queue.push({
        url: url,
        attempts: 0,
        priority: this.calculatePriority(url),
        status: 'pending',
        addedAt: new Date().toISOString()
      });
    }

    // Ordena por prioridad
    this.queue.sort((a, b) => b.priority - a.priority);

    console.log(`📋 ${this.queue.length} URLs agregadas a la cola`);
  }

  /**
   * Calcula prioridad basada en fuente
   */
  calculatePriority(url) {
    for (let i = 0; i < this.prioritySources.length; i++) {
      if (url.includes(this.prioritySources[i])) {
        return 100 - (i * 10); // CifraClub=100, AcordesWeb=90, etc.
      }
    }
    return 50; // Prioridad por defecto
  }

  /**
   * Procesa la cola
   */
  async processQueue() {
    console.log('\n🎼 INICIANDO PROCESAMIENTO DE COLA\n');
    console.log(`⚙️  Configuración:`);
    console.log(`   Concurrencia: ${this.concurrency}`);
    console.log(`   Rate limit: ${this.rateLimit}ms`);
    console.log(`   Reintentos: ${this.retryAttempts}`);
    console.log(`   Total items: ${this.queue.length}\n`);

    const startTime = Date.now();

    while (this.queue.length > 0 || this.processing.length > 0) {
      // Inicia nuevos workers si hay espacio
      while (this.processing.length < this.concurrency && this.queue.length > 0) {
        const item = this.queue.shift();
        this.processItem(item);
        await this.sleep(this.rateLimit / this.concurrency);
      }

      // Espera un poco antes de revisar de nuevo
      await this.sleep(500);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   ✅ Exitosos: ${this.completed.length}`);
    console.log(`   ❌ Fallidos: ${this.failed.length}`);
    console.log(`   ⏱️  Tiempo total: ${duration}s`);
    console.log(`   📈 Promedio: ${(this.completed.length / (duration / 60)).toFixed(1)} tabs/min`);

    // Guarda resultados
    this.saveResults();
  }

  /**
   * Procesa un item individual
   */
  async processItem(item) {
    this.processing.push(item);

    try {
      console.log(`\n⏳ [${this.processing.length}/${this.concurrency}] Procesando: ${item.url}`);

      // Detecta tipo de fuente
      const siteName = this.detectSiteName(item.url);

      // Scraping
      const result = await this.scraper.scrapeTab(item.url, siteName);

      if (result) {
        item.status = 'completed';
        item.result = result;
        this.completed.push(item);
        console.log(`   ✅ Completado (${this.completed.length}/${this.queue.length + this.completed.length + this.failed.length})`);
      } else {
        throw new Error('No se pudo extraer contenido');
      }

    } catch (error) {
      item.attempts++;

      if (item.attempts < this.retryAttempts) {
        // Reintenta
        console.log(`   🔄 Reintentando (${item.attempts}/${this.retryAttempts})`);
        item.status = 'retry';
        this.queue.push(item); // Vuelve a la cola
      } else {
        // Falla definitivamente
        console.log(`   ❌ Fallido definitivamente: ${error.message}`);
        item.status = 'failed';
        item.error = error.message;
        this.failed.push(item);
      }
    } finally {
      // Remueve de processing
      const index = this.processing.indexOf(item);
      if (index > -1) {
        this.processing.splice(index, 1);
      }

      // Guarda estado periódicamente
      if ((this.completed.length + this.failed.length) % 10 === 0) {
        this.saveState();
      }
    }
  }

  /**
   * Detecta nombre del sitio desde URL
   */
  detectSiteName(url) {
    if (url.includes('cifraclub')) return 'cifraclub';
    if (url.includes('acordesweb')) return 'acordesweb';
    if (url.includes('ultimate-guitar')) return 'ultimateGuitar';
    return 'generic';
  }

  /**
   * Guarda estado para reanudar después
   */
  saveState() {
    const state = {
      queue: this.queue,
      processing: this.processing,
      completed: this.completed.map(i => ({ url: i.url, status: i.status })),
      failed: this.failed,
      savedAt: new Date().toISOString()
    };

    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
  }

  /**
   * Restaura estado anterior
   */
  loadState() {
    if (fs.existsSync(this.stateFile)) {
      const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf-8'));
      this.queue = state.queue || [];
      this.failed = state.failed || [];

      console.log(`📂 Estado restaurado:`);
      console.log(`   Pendientes: ${this.queue.length}`);
      console.log(`   Completados: ${state.completed.length}`);
      console.log(`   Fallidos: ${this.failed.length}`);

      return true;
    }
    return false;
  }

  /**
   * Guarda resultados finales
   */
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, 'queue-results');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Guarda exitosos
    const successFile = path.join(outputDir, `completed-${timestamp}.json`);
    const successData = this.completed.map(item => ({
      url: item.url,
      title: item.result?.title,
      artist: item.result?.artist,
      chords: item.result?.chords,
      sections: item.result?.sections?.length
    }));
    fs.writeFileSync(successFile, JSON.stringify(successData, null, 2));

    // Guarda fallidos
    if (this.failed.length > 0) {
      const failedFile = path.join(outputDir, `failed-${timestamp}.json`);
      fs.writeFileSync(failedFile, JSON.stringify(this.failed, null, 2));

      // Genera archivo de URLs para reintentar
      const retryFile = path.join(outputDir, `retry-${timestamp}.txt`);
      const retryUrls = this.failed.map(item => item.url).join('\n');
      fs.writeFileSync(retryFile, retryUrls);
    }

    console.log(`\n📁 Resultados guardados en: ${outputDir}`);
  }

  /**
   * Exporta a formato para importar a Supabase
   */
  exportForDatabase() {
    const dbRecords = this.completed.map(item => {
      const result = item.result;

      return {
        title: result.title,
        artist: result.artist,
        key: this.detectKey(result.chords),
        difficulty: this.estimateDifficulty(result.chords),
        source_url: result.sourceUrl,
        source_type: result.sourceType,
        chords: result.chords,
        sections: result.sections,
        raw_text: result.rawText,
        status: 'pending_review',
        created_at: new Date().toISOString()
      };
    });

    const dbFile = path.join(__dirname, 'queue-results', 'database-import.json');
    fs.writeFileSync(dbFile, JSON.stringify(dbRecords, null, 2));

    console.log(`\n💾 Exportado para DB: ${dbFile}`);
    console.log(`📊 ${dbRecords.length} registros listos para importar`);

    return dbRecords;
  }

  /**
   * Detecta tonalidad principal
   */
  detectKey(chords) {
    if (!chords || chords.length === 0) return null;

    // Cuenta frecuencia de cada acorde
    const frequency = {};
    for (const chord of chords) {
      const root = chord.match(/^[A-G][#b]?/)?.[0];
      if (root) {
        frequency[root] = (frequency[root] || 0) + 1;
      }
    }

    // Retorna el más frecuente
    const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  }

  /**
   * Estima dificultad basada en acordes
   */
  estimateDifficulty(chords) {
    if (!chords) return 'beginner';

    const complexChords = chords.filter(c =>
      c.includes('maj') || c.includes('sus') || c.includes('add') ||
      c.includes('dim') || c.includes('aug') || c.includes('/')
    );

    const ratio = complexChords.length / chords.length;

    if (ratio > 0.4) return 'advanced';
    if (ratio > 0.2) return 'intermediate';
    return 'beginner';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = QueueProcessor;

// Ejecución directa
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];

  if (!command) {
    console.log(`
🎸 Queue Processor - Procesamiento masivo de tabs

📖 Comandos:

  Procesar archivo de URLs:
    node queue-processor.js process urls.txt

  Reanudar procesamiento anterior:
    node queue-processor.js resume

  Procesar con concurrencia personalizada:
    node queue-processor.js process urls.txt --concurrency 5

⚙️  Opciones:
  --concurrency N    Procesa N tabs en paralelo (default: 3)
  --rate-limit MS    Espera MS milisegundos entre requests (default: 3000)
  --retry N          Reintentos en caso de error (default: 2)

💡 Ejemplos:
  node queue-processor.js process catalog-output/cifraclub-urls.txt
  node queue-processor.js process spotify-output/spotify-cifraclub-urls.txt --concurrency 5
    `);
    process.exit(0);
  }

  const processor = new QueueProcessor({
    concurrency: process.argv.includes('--concurrency')
      ? parseInt(process.argv[process.argv.indexOf('--concurrency') + 1])
      : 3,
    rateLimit: process.argv.includes('--rate-limit')
      ? parseInt(process.argv[process.argv.indexOf('--rate-limit') + 1])
      : 3000
  });

  if (command === 'process') {
    if (!arg) {
      console.error('❌ Debes especificar un archivo de URLs');
      process.exit(1);
    }

    processor.loadQueue(arg);
    processor.processQueue()
      .then(() => {
        processor.exportForDatabase();
        console.log('\n🎉 Procesamiento completado!');
      })
      .catch((error) => {
        console.error('\n❌ Error:', error.message);
        processor.saveState();
        process.exit(1);
      });

  } else if (command === 'resume') {
    if (processor.loadState()) {
      processor.processQueue()
        .then(() => {
          processor.exportForDatabase();
          console.log('\n🎉 Procesamiento completado!');
        })
        .catch((error) => {
          console.error('\n❌ Error:', error.message);
          processor.saveState();
          process.exit(1);
        });
    } else {
      console.error('❌ No hay estado previo para reanudar');
      process.exit(1);
    }
  } else {
    console.error(`❌ Comando desconocido: ${command}`);
    process.exit(1);
  }
}
