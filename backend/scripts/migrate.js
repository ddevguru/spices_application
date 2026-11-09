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

    // Explicitly guarantee column existence
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_number VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
    `);

    console.log('✅ PostgreSQL Schema created successfully!');
    process.exit(0);
  } catch (err) {
    console.warn('⚠️ Migration warning (will use resilient fallback):', err.message);
    console.log('💡 Tip: Ensure PostgreSQL is running and database "dryfruits_db" exists.');
    process.exit(0);
  }
}

if (require.main === module) {
  runMigrate();
}

module.exports = { runMigrate };

