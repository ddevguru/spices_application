const fs = require('fs');
const path = require('path');
const { getPool } = require('../config/db');

async function runMigrate() {
  const pool = getPool();
  console.log('🔄 Running PostgreSQL migrations...');

  try {
    const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(sql);
    console.log('✅ PostgreSQL Schema created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('💡 Tip: Ensure PostgreSQL is running and database "dryfruits_db" exists.');
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrate();
}

module.exports = { runMigrate };

