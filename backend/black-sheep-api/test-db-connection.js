/**
 * Test de conexión a Supabase PostgreSQL
 * Para verificar que la password es correcta
 */

const { Client } = require('pg');

// Password actual en .env
const password1 = '#x!2Kc/%6TZyccY';

// Intenta con diferentes formatos
const configs = [
  {
    name: 'Usuario: postgres (directo)',
    config: {
      host: 'db.alqpufucjekmonetoaih.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: password1,
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Usuario: postgres.alqpufucjekmonetoaih (con project ref)',
    config: {
      host: 'db.alqpufucjekmonetoaih.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres.alqpufucjekmonetoaih',
      password: password1,
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Usuario: postgres (password URL encoded)',
    config: {
      host: 'db.alqpufucjekmonetoaih.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: encodeURIComponent(password1),
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Puerto 6543 (pooler) con postgres',
    config: {
      host: 'db.alqpufucjekmonetoaih.supabase.co',
      port: 6543,
      database: 'postgres',
      user: 'postgres.alqpufucjekmonetoaih',
      password: password1,
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function testConnection(name, config) {
  const client = new Client(config);

  try {
    console.log(`\n🔍 Probando: ${name}`);
    console.log(`   Password usada: ${config.password}`);

    await client.connect();
    console.log('✅ CONEXIÓN EXITOSA!');

    // Prueba query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query test:', result.rows[0].now);

    await client.end();
    return true;

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

(async () => {
  console.log('🔐 Test de Conexión a Supabase PostgreSQL\n');
  console.log('Host: db.alqpufucjekmonetoaih.supabase.co');
  console.log('User: postgres');
  console.log('Database: postgres');

  for (const { name, config } of configs) {
    const success = await testConnection(name, config);
    if (success) {
      console.log('\n🎉 Encontramos la configuración correcta!');
      console.log(`   Usa esta password en .env: ${config.password}`);
      process.exit(0);
    }
  }

  console.log('\n❌ Ninguna configuración funcionó.');
  console.log('\n💡 Soluciones:');
  console.log('   1. Ve a Supabase Dashboard → Settings → Database');
  console.log('   2. Busca "Connection string" → Tab "URI"');
  console.log('   3. Copia la password EXACTA de ahí');
  console.log('   4. O resetea la password en "Reset Database Password"');

})();
