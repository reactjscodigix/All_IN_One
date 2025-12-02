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

async function verifySchema() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Verifying deals table schema...\n');
    
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'deals' AND TABLE_SCHEMA = ?
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'deals_db']);
    
    console.log('Current columns in deals table:');
    console.log('-'.repeat(80));
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(25)} | ${col.COLUMN_TYPE.padEnd(20)} | Nullable: ${col.IS_NULLABLE}`);
    });
    
    console.log('\n✅ Deals table schema verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema verification error:', err.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

verifySchema();
