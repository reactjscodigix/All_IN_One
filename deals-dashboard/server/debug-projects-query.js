const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db'
});

(async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('Testing direct SQL query...\n');
    const [rows] = await conn.query(
      `SELECT p.*, c.company_name 
       FROM projects p 
       LEFT JOIN companies c ON p.company_id = c.id 
       LIMIT 3`
    );
    
    console.log('Query results:');
    rows.forEach((row, idx) => {
      console.log(`\nProject ${idx + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Name: ${row.name}`);
      console.log(`  Company ID: ${row.company_id}`);
      console.log(`  Company Name: ${row.company_name}`);
    });
    
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
