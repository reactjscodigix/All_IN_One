const mysql = require('mysql2/promise');

async function debug() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        c.id, c.company_name, c.currency, c.language
      FROM companies c
      WHERE c.id = 7
    `);
    
    console.log('Direct query result:');
    console.log(rows[0]);
    
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

debug();
