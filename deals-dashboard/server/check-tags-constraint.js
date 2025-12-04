const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Checking tags CHECK constraint:');
    const [constraint] = await conn.query(`
      SELECT CHECK_CLAUSE
      FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
      WHERE CONSTRAINT_NAME = 'tags' AND CONSTRAINT_SCHEMA = 'deals_db'
    `);
    console.log('Constraint definition:', constraint);
    
    console.log('\n\nAlternative query:');
    const [raw] = await conn.query(`
      SELECT * FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
      WHERE TABLE_SCHEMA = 'deals_db' AND CONSTRAINT_NAME = 'tags'
    `);
    console.log('Raw constraint:', raw);
    
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
