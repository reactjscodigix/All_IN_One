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
        client_id, contact_id, project_id, estimation_number, bill_to, ship_to, 
        amount, currency, estimate_date, expiry_date, status, tags, description, estimate_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1, null, null, estimation_number, null, null, 
      5000, 'USD', null, null, 'Draft', null, '', null
    ]);
    
    console.log('Insert successful! ID:', result.insertId);
    connection.release();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

test();
