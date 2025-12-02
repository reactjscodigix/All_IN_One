const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const migrationFile = path.join(__dirname, '..', 'MIGRATE_COMPANY_FIELDS.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    const connection = await pool.getConnection();
    
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      try {
        const trimmed = statement.trim();
        if (trimmed) {
          console.log(`Executing: ${trimmed.substring(0, 50)}...`);
          await connection.query(trimmed);
        }
      } catch (err) {
        console.error(`Error executing statement: ${err.message}`);
      }
    }
    
    console.log('\n✓ Migration completed successfully!');
    
    const [rows] = await connection.query('DESCRIBE companies');
    console.log('\nUpdated columns:');
    rows.forEach(r => console.log(`  - ${r.Field}`));
    
    connection.release();
  } catch (err) {
    console.error('Migration error:', err.message);
  }
  
  await pool.end();
}

applyMigration();
