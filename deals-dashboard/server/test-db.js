const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'backend',
  database: 'deals_db'
});

(async () => {
  try {
    const conn = await pool.getConnection();
    
    const [deals] = await conn.query('SELECT COUNT(*) as count FROM deals');
    console.log('Deals in DB:', deals[0].count);
    
    const [dealData] = await conn.query('SELECT * FROM deals LIMIT 3');
    console.log('Sample deals:', dealData);
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Database Error:', err.message);
    process.exit(1);
  }
})();
