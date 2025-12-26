/**
 * Import extracted tabs directly to PostgreSQL (matching actual schema)
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

function parseRawTextToSections(rawText, title) {
  // Simple parser: split by section markers like [Intro], [Verse], etc.
  const sections = [];
  const sectionRegex = /\[([^\]]+)\]/g;

  let lastIndex = 0;
  let match;
  let currentSection = null;

  while ((match = sectionRegex.exec(rawText)) !== null) {
    // Save previous section
    if (currentSection) {
      const sectionText = rawText.substring(lastIndex, match.index).trim();
      if (sectionText) {
        currentSection.lines = parseLines(sectionText);
        sections.push(currentSection);
      }
    }

    // Start new section
    currentSection = {
      name: match[1],
      lines: []
    };
    lastIndex = sectionRegex.lastIndex;
  }

  // Add last section
  if (currentSection) {
    const sectionText = rawText.substring(lastIndex).trim();
    if (sectionText) {
      currentSection.lines = parseLines(sectionText);
      sections.push(currentSection);
    }
  }

  // If no sections found, create a single "Tab" section
  if (sections.length === 0) {
    sections.push({
      name: 'Tab',
      lines: parseLines(rawText)
    });
  }

  return sections;
}

function parseLines(text) {
  // Split into lines and pair chords with lyrics
  const lines = text.split('\n').filter(l => l.trim());
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract chords from <b> tags
    const chordMatches = [...line.matchAll(/<b>([^<]+)<\/b>/g)];

    if (chordMatches.length > 0) {
      // Line has chords
      let lyrics = line.replace(/<[^>]+>/g, '').trim();

      const chords = chordMatches.map((match, idx) => ({
        chord: match[1],
        position: idx * 5 // Approximate position
      }));

      result.push({ chords, lyrics });
    } else {
      // Line is just lyrics
      result.push({
        chords: [],
        lyrics: line.replace(/<[^>]+>/g, '').trim()
      });
    }
  }

  return result;
}

function extractArtistFromUrl(url) {
  const match = url.match(/cifraclub\.com\.br\/([^\/]+)\//);
  if (match) {
    return match[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return 'Desconocido';
}

async function importTab(filepath) {
  const filename = path.basename(filepath);
  console.log(`\n📝 Importando: ${filename}`);

  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    const artist = data.artist || extractArtistFromUrl(data.sourceUrl || '');
    const sections = parseRawTextToSections(data.rawText || '', data.title);

    const query = `
      INSERT INTO songs (
        title, artist, sections, source_url, status,
        difficulty, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT 
    `;

    const values = [
      data.title || 'Sin título',
      artist,
      JSON.stringify(sections),
      data.sourceUrl || null,
      'pending',
      'beginner' // Default difficulty
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

  console.log(`\n🎸 IMPORTACIÓN DE TABS EXTRAÍDOS A SUPABASE\n`);
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
  const errors = [];

  for (const file of files) {
    const result = await importTab(file);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
      errors.push({ file: path.basename(file), error: result.error });
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`📊 RESUMEN DE IMPORTACIÓN`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`✅ Exitosos:     ${successCount}/${files.length}`);
  console.log(`❌ Fallidos:     ${errorCount}/${files.length}`);

  if (errors.length > 0 && errors.length <= 10) {
    console.log(`\n⚠️  Errores:`);
    errors.forEach(e => console.log(`   ${e.file}: ${e.error}`));
  }

  console.log(`\n✨ Importación completada!\n`);

  await pool.end();
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
