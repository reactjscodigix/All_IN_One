const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function truncateDeals() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔄 Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    
    console.log('🔄 Truncating deals table...');
    await connection.query('TRUNCATE TABLE deals');
    
    console.log('🔄 Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    
    console.log('✅ All deals cleared successfully!');
  } catch (error) {
    console.error('❌ Error truncating deals:', error.message);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

truncateDeals();
