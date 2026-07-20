const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM departments');
    console.table(rows);
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
