const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.alqpufucjekmonetoaih.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '#x!2Kc/%6TZyccY',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'songs'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Songs table schema:\n');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name.padEnd(20)} ${row.data_type.padEnd(25)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();
