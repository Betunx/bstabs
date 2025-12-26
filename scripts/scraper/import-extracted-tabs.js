/**
 * Import extracted tabs directly to PostgreSQL
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'db.alqpufucjekmonetoaih.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '#x!2Kc/%6TZyccY',
  ssl: { rejectUnauthorized: false }
});

async function importTab(filepath) {
  const filename = path.basename(filepath);
  console.log(`\n📝 Importando: ${filename}`);

  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    // Extract artist from source URL
    let artist = data.artist || '';
    if (!artist && data.sourceUrl) {
      const match = data.sourceUrl.match(/cifraclub\.com\.br\/([^\/]+)\//);
      if (match) {
        artist = match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    const query = `
      INSERT INTO songs (title, artist, content, chords, status, "sourceUrl", notes, views, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT ("sourceUrl")
      DO UPDATE SET
        title = EXCLUDED.title,
        artist = EXCLUDED.artist,
        content = EXCLUDED.content,
        chords = EXCLUDED.chords,
        "updatedAt" = NOW()
      RETURNING id, title, artist
    `;

    const values = [
      data.title || 'Sin título',
      artist || 'Desconocido',
      data.rawText || '',
      JSON.stringify(data.chords || []),
      'pending',
      data.sourceUrl,
      `Scrapeado automáticamente. Fuente: ${data.sourceType || 'html'}`,
      0
    ];

    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      console.log(`   ✅ ${result.rows[0].title} - ${result.rows[0].artist} (${result.rows[0].id})`);
      return { success: true, data: result.rows[0] };
    } finally {
      client.release();
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  const tabsDir = path.join(__dirname, 'extracted-tabs');

  console.log(`\n🎸 IMPORTACIÓN DE TABS EXTRAÍDOS\n`);
  console.log(`📁 Directorio: ${tabsDir}\n`);

  if (!fs.existsSync(tabsDir)) {
    console.error(`❌ Directorio no encontrado: ${tabsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(tabsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(tabsDir, f));

  if (files.length === 0) {
    console.log('⚠️  No hay archivos JSON para importar');
    process.exit(0);
  }

  console.log(`📊 Total de archivos: ${files.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const result = await importTab(file);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }

    // Small delay between imports
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`📊 RESUMEN DE IMPORTACIÓN`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`✅ Exitosos:     ${successCount}/${files.length}`);
  console.log(`❌ Fallidos:     ${errorCount}/${files.length}`);
  console.log(`\n✨ Importación completada!\n`);

  await pool.end();
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
