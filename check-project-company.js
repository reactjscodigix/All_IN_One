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
    
    console.log('=== PROJECTS ===');
    const [projects] = await conn.query('SELECT id, name, company_id FROM projects LIMIT 5');
    console.log(projects);
    
    console.log('\n=== COMPANIES ===');
    const [companies] = await conn.query('SELECT id, name FROM companies LIMIT 5');
    console.log(companies);
    
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
