const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function addCompanyOwner() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔄 Adding owner field to companies table...\n');

    await connection.query(`
      ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_id INT
    `).catch(() => {});

    await connection.query(`
      ALTER TABLE companies ADD CONSTRAINT FK_company_owner 
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    `).catch(() => {});

    await connection.query(`
      ALTER TABLE companies ADD INDEX IF NOT EXISTS idx_owner_id (owner_id)
    `).catch(() => {});

    console.log('✓ Added owner_id column to companies table');
    console.log('✓ Added foreign key constraint to users table');
    console.log('✓ Added index on owner_id for performance\n');

    console.log('✅ Migration completed successfully!\n');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (connection) connection.release();
    process.exit(1);
  }
}

addCompanyOwner();
