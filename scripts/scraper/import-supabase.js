/**
 * Import Supabase - Importa tabs scrapeados a Supabase
 *
 * Uso:
 *   node import-supabase.js [archivo-json]
 *
 * Ejemplo:
 *   node import-supabase.js queue-results/database-import.json
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase desde variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Faltan credenciales de Supabase');
  console.log('\n📖 Configura las variables de entorno:');
  console.log('   set SUPABASE_URL=https://xxx.supabase.co');
  console.log('   set SUPABASE_KEY=tu_anon_key\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Importa un lote de tabs a Supabase
 */
async function importBatch(batch, batchNumber, totalBatches) {
  console.log(`\n📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} tabs)...`);

  try {
    // Mapear datos al schema de Supabase
    const records = batch.map(tab => ({
      title: tab.title || 'Sin título',
      artist: tab.artist || 'Desconocido',
      content: JSON.stringify({
        rawText: tab.rawText,
        sections: tab.sections
      }),
      chords: tab.chords || [],
      status: 'pending', // Requiere revisión antes de publicar
      source_url: tab.sourceUrl,
      genre: tab.genre || null,
      notes: `Scrapeado automáticamente. Fuente: ${tab.sourceType || 'unknown'}`,
      views: 0
    }));

    // Insertar en Supabase (upsert para evitar duplicados por source_url)
    const { data, error } = await supabase
      .from('songs')
      .upsert(records, {
        onConflict: 'source_url',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error(`   ❌ Error en lote ${batchNumber}:`, error.message);
      return { success: false, count: 0, error };
    }

    console.log(`   ✅ Importados ${data.length} tabs exitosamente`);
    return { success: true, count: data.length, data };

  } catch (error) {
    console.error(`   ❌ Excepción en lote ${batchNumber}:`, error.message);
    return { success: false, count: 0, error };
  }
}

/**
 * Importa archivo completo en lotes
 */
async function importFile(filepath, batchSize = 50) {
  console.log(`\n🎸 IMPORTACIÓN A SUPABASE\n`);
  console.log(`📁 Archivo: ${filepath}`);
  console.log(`⚙️  Tamaño de lote: ${batchSize}\n`);

  // Leer archivo JSON
  if (!fs.existsSync(filepath)) {
    console.error(`❌ Archivo no encontrado: ${filepath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

  if (!Array.isArray(data) || data.length === 0) {
    console.error('❌ El archivo no contiene datos válidos');
    process.exit(1);
  }

  console.log(`📊 Total de tabs a importar: ${data.length}\n`);

  // Dividir en lotes
  const batches = [];
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }

  const totalBatches = batches.length;
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Procesar cada lote
  for (let i = 0; i < batches.length; i++) {
    const result = await importBatch(batches[i], i + 1, totalBatches);

    if (result.success) {
      successCount += result.count;
    } else {
      errorCount += batches[i].length;
      errors.push({ batch: i + 1, error: result.error });
    }

    // Pausa entre lotes para no saturar
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Resumen final
  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`📊 RESUMEN DE IMPORTACIÓN`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`✅ Exitosos:     ${successCount}/${data.length}`);
  console.log(`❌ Fallidos:     ${errorCount}/${data.length}`);
  console.log(`📦 Lotes:        ${totalBatches}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Errores encontrados en ${errors.length} lotes:`);
    errors.forEach(e => {
      console.log(`   Lote ${e.batch}: ${e.error?.message || 'Error desconocido'}`);
    });
  }

  console.log(`\n✨ Importación completada!\n`);

  return {
    total: data.length,
    success: successCount,
    failed: errorCount,
    errors
  };
}

/**
 * Verifica conexión a Supabase
 */
async function testConnection() {
  console.log('🔌 Probando conexión a Supabase...');

  try {
    const { data, error } = await supabase
      .from('songs')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }

    console.log('✅ Conexión exitosa\n');
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar:', error.message);
    return false;
  }
}

// Ejecución principal
if (require.main === module) {
  const filepath = process.argv[2] || 'queue-results/database-import.json';
  const batchSize = parseInt(process.argv[3]) || 50;

  (async () => {
    // Verificar conexión primero
    const connected = await testConnection();
    if (!connected) {
      console.log('\n💡 Verifica tus credenciales de Supabase');
      process.exit(1);
    }

    // Ejecutar importación
    await importFile(filepath, batchSize);
  })();
}

module.exports = { importFile, importBatch };
