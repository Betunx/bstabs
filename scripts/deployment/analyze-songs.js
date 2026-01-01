const fs = require('fs');

// Leer de archivo o stdin
let songs;
const filePath = 'C:\\Users\\Humbe\\Documents\\Programacion\\blackSheep\\temp-songs.json';
if (fs.existsSync(filePath)) {
  songs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
} else {
  // Leer de stdin
  const input = fs.readFileSync(0, 'utf-8');
  songs = JSON.parse(input);
}

// Analizar duplicados
const titleMap = {};
songs.forEach(song => {
  const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
  if (!titleMap[key]) titleMap[key] = [];
  titleMap[key].push({
    id: song.id,
    title: song.title,
    artist: song.artist,
    source: song.source_url,
    sections: song.sections
  });
});

const duplicates = Object.entries(titleMap).filter(([_, arr]) => arr.length > 1);

console.log('='.repeat(80));
console.log('ANÁLISIS DE CANCIONES CON PROBLEMAS');
console.log('='.repeat(80));

// Analizar las 4 canciones con problemas
const problematicIds = [
  'd1861472-d352-4895-b590-01e791df2566', // Nothing Else Matters
  '185fec3d-9afb-44eb-a2e1-673ae08104ab', // 5
  'd80005e8-5cbe-42cc-a528-bfb08b9b9829', // Californication
  'f1ac67ae-242c-41f1-a182-8d2db5da5c83'  // Don't Stop Me Now
];

console.log('\n1. CANCIONES CON ERRORES EN TÍTULO/DISPLAY:\n');
problematicIds.forEach(id => {
  const song = songs.find(s => s.id === id);
  if (song) {
    console.log(`\nID: ${song.id}`);
    console.log(`Título: "${song.title}"`);
    console.log(`Artista: "${song.artist}"`);
    console.log(`Source: ${song.source_url}`);

    // Analizar contenido de sections
    if (song.sections && song.sections[0]) {
      const firstLine = song.sections[0].lines[0]?.lyrics || '';
      const preview = firstLine.substring(0, 200);
      console.log(`Preview del contenido: ${preview}...`);

      // Detectar si contiene HTML de navegación/header
      if (firstLine.includes('Notificações') ||
          firstLine.includes('espirituguitarrista.com') ||
          firstLine.includes('<img') ||
          firstLine.includes('aria-label')) {
        console.log('⚠️  PROBLEMA: Contiene HTML de navegación/header del sitio');
      }

      // Detectar si el título tiene HTML entities
      if (song.title.includes('&#')) {
        console.log('⚠️  PROBLEMA: Título contiene HTML entities sin decodificar');
      }
    }
  }
});

console.log('\n\n2. CANCIONES DUPLICADAS:\n');
console.log(`Total de grupos duplicados: ${duplicates.length}\n`);

duplicates.slice(0, 15).forEach(([key, songs]) => {
  console.log(`\n"${key}" - ${songs.length} copias:`);
  songs.forEach(s => {
    const domain = s.source ? new URL(s.source).hostname : 'sin source';
    console.log(`  - ${s.id} (${domain})`);
  });
});

console.log('\n\n3. ESTADÍSTICAS POR FUENTE:\n');
const sourceCounts = {};
songs.forEach(s => {
  if (s.source_url) {
    try {
      const domain = new URL(s.source_url).hostname;
      sourceCounts[domain] = (sourceCounts[domain] || 0) + 1;
    } catch (e) {
      sourceCounts['invalid-url'] = (sourceCounts['invalid-url'] || 0) + 1;
    }
  } else {
    sourceCounts['sin-source'] = (sourceCounts['sin-source'] || 0) + 1;
  }
});

Object.entries(sourceCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([domain, count]) => {
    console.log(`${domain}: ${count} canciones`);
  });

console.log('\n\n4. RECOMENDACIONES:\n');
console.log('📋 PROBLEMAS IDENTIFICADOS:');
console.log('   1. Scraping captura HTML de navegación/headers del sitio');
console.log('   2. HTML entities en títulos no se decodifican (&#39; en vez de \')');
console.log('   3. Canciones duplicadas de múltiples fuentes');
console.log('\n✅ SOLUCIONES PROPUESTAS:');
console.log('   1. Mejorar selectores CSS para evitar elementos de navegación');
console.log('   2. Agregar decodificación de HTML entities en títulos');
console.log('   3. Validar duplicados antes de importar (title + artist)');
console.log('   4. Limpiar/sanitizar HTML antes de guardar');
