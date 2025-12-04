const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM estimations LIMIT 1');
    console.log('Success! Table exists. Rows:', rows);
    connection.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

test();
