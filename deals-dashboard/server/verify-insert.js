const mysql = require('mysql2/promise');

async function verify() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query('SELECT * FROM companies WHERE id = 6');
    
    if (rows.length > 0) {
      console.log('✓ Company data stored successfully:\n');
      const company = rows[0];
      Object.keys(company).forEach(key => {
        console.log(`  ${key}: ${company[key]}`);
      });
    } else {
      console.log('No company found with ID 6');
    }
    
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

verify();
