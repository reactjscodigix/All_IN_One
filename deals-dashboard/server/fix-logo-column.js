const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

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

async function fixLogoColumn() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Altering companies.logo column to LONGTEXT...');
    
    await connection.query(`
      ALTER TABLE companies MODIFY COLUMN logo LONGTEXT
    `);
    
    console.log('✓ Logo column successfully changed to LONGTEXT');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (connection) connection.release();
    process.exit(1);
  }
}

fixLogoColumn();
