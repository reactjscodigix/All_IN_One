const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({host: 'localhost', user: 'root', password: '', database: 'deals_db'});
  const conn = await pool.getConnection();
  const [tables] = await conn.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='deals_db' ORDER BY TABLE_NAME");
  console.log('Tables in database:');
  tables.forEach(t => console.log(' -', t.TABLE_NAME));
  conn.release();
  pool.end();
})();
