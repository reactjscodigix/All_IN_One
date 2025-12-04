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
    
    const estimation_number = `EST-${Date.now()}`;
    
    const [result] = await connection.query(`
      INSERT INTO estimations (
        client_id, estimation_number, amount, currency, status
      ) VALUES (?, ?, ?, ?, ?)
    `, [1, estimation_number, 5000, 'USD', 'Draft']);
    
    console.log('Insert successful! ID:', result.insertId);
    connection.release();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('SQL:', error.sql);
  } finally {
    await pool.end();
  }
}

test();
