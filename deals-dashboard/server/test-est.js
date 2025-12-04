const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SHOW TABLES LIKE "estimations"');
    console.log('Table check:', rows);
    
    if (rows.length > 0) {
      const [data] = await connection.query('SELECT * FROM estimations');
      console.log('Data:', data);
    }
    
    connection.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

test();
