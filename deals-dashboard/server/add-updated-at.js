const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

async function addUpdatedAtColumn() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'deals_db',
    });

    console.log('✓ Connected to database');

    const query = `ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;

    await connection.query(query);
    console.log('✓ Added updated_at column to pipeline table');

    await connection.end();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

addUpdatedAtColumn();
