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
    
    console.log('Checking table constraints:');
    const [constraints] = await conn.query(`
      SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'estimations' AND TABLE_SCHEMA = 'deals_db'
    `);
    console.log('Constraints:', constraints);
    
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
