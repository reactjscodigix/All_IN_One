const mysql = require('mysql2/promise');

async function check() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT id, company_name, currency, language FROM companies WHERE id = 7');
    console.log('Stored values:');
    console.log(JSON.stringify(rows[0], null, 2));
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

check();
