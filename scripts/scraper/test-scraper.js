/**
 * Test del scraper mejorado - Solo Caifanes
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Importar el scraper
const EspirituGuitarristaFullCatalog = require('./tools/1-extraction/espirituguitarrista-full-catalog.js');

// Crear clase extendida para testing
class EspirituGuitarristaTest extends require('./tools/1-extraction/espirituguitarrista-full-catalog.js').constructor {
  constructor() {
    super();
  }
}

async function test() {
  console.log('🧪 TEST: Scraper Mejorado (Solo Caifanes)\n');
  console.log('━'.repeat(60) + '\n');

  const scraper = new (require('./tools/1-extraction/espirituguitarrista-full-catalog.js'))();

  try {
    // Filtrar solo Caifanes
    await scraper.run(false, false, ['caifanes']);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

test();
