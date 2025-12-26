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

function extractArtist(url) {
  const match = url ? url.match(/cifraclub\.com\.br\/([^\/]+)\//) : null;
  if (match) {
    return match[1].split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  }
  return 'Desconocido';
}

async function importTab(filepath) {
  const filename = path.basename(filepath);
  console.log(`📝 ${filename}`);

  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const artist = data.artist || extractArtist(data.sourceUrl);

    const query = `
      INSERT INTO songs (title, artist, sections, source_url, status, difficulty, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'pending', 'beginner', NOW(), NOW())
      RETURNING id, title, artist
    `;

    const sections = [{ name: 'Tab', lines: [{ chords: [], lyrics: data.rawText || '' }] }];

    const client = await pool.connect();
    try {
      const result = await client.query(query, [
        data.title || 'Sin título',
        artist,
        JSON.stringify(sections),
        data.sourceUrl || null
      ]);
      console.log(`   ✅ ${result.rows[0].title} - ${result.rows[0].artist}`);
      return { success: true };
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      console.log(`   ⏭️  Ya existe`);
      return { success: true, skipped: true };
    }
    console.error(`   ❌ ${error.message}`);
    return { success: false };
  }
}

async function main() {
  const tabsDir = path.join(__dirname, 'extracted-tabs');
  const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('.json')).map(f => path.join(tabsDir, f));

  console.log(`\n🎸 Importando ${files.length} tabs a Supabase...\n`);

  let success = 0, failed = 0, skipped = 0;

  for (const file of files) {
    const result = await importTab(file);
    if (result.success) {
      if (result.skipped) skipped++;
      else success++;
    } else {
      failed++;
    }
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n✅ Exitosos: ${success}  ⏭️  Duplicados: ${skipped}  ❌ Fallidos: ${failed}\n`);
  await pool.end();
}

main();
