const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('=== PROJECTS TABLE SCHEMA ===');
    const [columns] = await conn.query('DESCRIBE projects');
    console.table(columns);
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
