const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });
  
  try {
    const conn = await pool.getConnection();
    
    console.log('Testing direct SQL query with JOIN:');
    const [rows] = await conn.query(`
      SELECT p.*, c.company_name 
      FROM projects p 
      LEFT JOIN companies c ON p.company_id = c.id 
      LIMIT 2
    `);
    
    console.log('Rows returned:', rows.length);
    if (rows.length > 0) {
      console.log('\nFirst row keys:', Object.keys(rows[0]));
      console.log('\nFirst row data:');
      console.log(JSON.stringify(rows[0], null, 2));
    }
    
    conn.release();
    pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

test();
