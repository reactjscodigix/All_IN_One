const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.development') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function migrateDealsTable() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Checking and adding missing columns to deals table...');
    
    const columnsToAdd = [
      { name: 'pipeline', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS pipeline VARCHAR(100)' },
      { name: 'currency', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT "USD"' },
      { name: 'period', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS period VARCHAR(50)' },
      { name: 'period_value', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS period_value INT' },
      { name: 'project_id', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS project_id INT' },
      { name: 'due_date', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS due_date DATE' },
      { name: 'assignee_id', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS assignee_id INT' },
      { name: 'follow_up_date', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS follow_up_date DATE' },
      { name: 'source', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS source VARCHAR(100)' },
      { name: 'tags', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS tags TEXT' },
      { name: 'priority', query: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT "Medium"' },
    ];
    
    for (const column of columnsToAdd) {
      try {
        await connection.query(column.query);
        console.log(`✓ Column ${column.name} added or already exists`);
      } catch (err) {
        if (err.code !== 'ER_DUP_FIELDNAME') {
          throw err;
        }
        console.log(`✓ Column ${column.name} already exists`);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

migrateDealsTable();
