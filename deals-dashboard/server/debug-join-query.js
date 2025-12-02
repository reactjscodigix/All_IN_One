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
        c.id, c.company_name, c.currency, c.language,
        cs.plan_name, cs.plan_type, cs.currency as cs_currency, cs.language as cs_language
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      WHERE c.id = 7
    `);
    
    console.log('Query with JOIN result:');
    console.log(rows[0]);
    
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

debug();
