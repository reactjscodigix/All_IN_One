const mysql = require('mysql2/promise');

async function checkSchema() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('DESCRIBE companies');
    console.log('Current companies table columns:');
    rows.forEach(r => console.log(`  - ${r.Field}: ${r.Type}`));
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

checkSchema();
