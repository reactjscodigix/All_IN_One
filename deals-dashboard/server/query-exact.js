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
    
    // Test 1: Simple query
    console.log('\n=== Test 1: Simple SELECT ===');
    const [rows1] = await connection.query('SELECT id, company_name, currency, language FROM companies WHERE id = 7');
    console.log(rows1[0]);
    
    // Test 2: Query without JOIN
    console.log('\n=== Test 2: Full SELECT without JOIN ===');
    const [rows2] = await connection.query(`
      SELECT 
        id, company_name, industry, email, currency, language
      FROM companies WHERE id = 7
    `);
    console.log(rows2[0]);
    
    // Test 3: Full query WITH JOIN (like the API does)
    console.log('\n=== Test 3: Full SELECT with LEFT JOIN ===');
    const [rows3] = await connection.query(`
      SELECT 
        c.id, c.company_name, c.currency, c.language,
        cs.plan_name, cs.plan_type
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      WHERE c.id = 7
    `);
    console.log(rows3[0]);
    
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

test();
