/**
 * Import usando PostgreSQL directamente
 */
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'db.alqpufucjekmonetoaih.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '#x!2Kc/%6TZyccY',
  ssl: { rejectUnauthorized: false }
});

async function importBatch(batch, batchNumber, totalBatches) {
  console.log(`\n📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} tabs)...`);

  const client = await pool.connect();
  try {
    let successCount = 0;

    for (const tab of batch) {
      const query = `
        INSERT INTO songs (title, artist, content, chords, status, source_url, genre, notes, views, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (source_url)
        DO UPDATE SET
          title = EXCLUDED.title,
          artist = EXCLUDED.artist,
          content = EXCLUDED.content,
          chords = EXCLUDED.chords,
          updated_at = NOW()
      `;

      const sourceType = tab.sourceType || 'unknown';
      const values = [
        tab.title || 'Sin título',
        tab.artist || 'Desconocido',
        JSON.stringify({
          rawText: tab.rawText,
          sections: tab.sections
        }),
        JSON.stringify(tab.chords || []),
        'pending',
        tab.sourceUrl,
        tab.genre || null,
        `Scrapeado automáticamente. Fuente: ${sourceType}`,
        0
      ];

      try {
        await client.query(query, values);
        successCount++;
      } catch (err) {
        console.error(`   ❌ Error importando "${tab.title}":`, err.message);
      }
    }

    console.log(`   ✅ Importados ${successCount}/${batch.length} tabs`);
    return { success: true, count: successCount };

  } catch (error) {
    console.error(`   ❌ Error en lote ${batchNumber}:`, error.message);
    return { success: false, count: 0, error };
  } finally {
    client.release();
  }
}

async function importFile(filepath, batchSize = 50) {
  console.log(`\n🎸 IMPORTACIÓN A SUPABASE (PostgreSQL)\n`);
  console.log(`📁 Archivo: ${filepath}`);
  console.log(`⚙️  Tamaño de lote: ${batchSize}\n`);

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

  // Procesar cada lote
  for (let i = 0; i < batches.length; i++) {
    const result = await importBatch(batches[i], i + 1, totalBatches);

    if (result.success) {
      successCount += result.count;
    } else {
      errorCount += batches[i].length;
    }

    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`📊 RESUMEN DE IMPORTACIÓN`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`✅ Exitosos:     ${successCount}/${data.length}`);
  console.log(`❌ Fallidos:     ${errorCount}/${data.length}`);
  console.log(`📦 Lotes:        ${totalBatches}`);
  console.log(`\n✨ Importación completada!\n`);

  await pool.end();
}

// Ejecución
if (require.main === module) {
  const filepath = process.argv[2] || 'queue-results/database-import.json';
  importFile(filepath).catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
  });
}
