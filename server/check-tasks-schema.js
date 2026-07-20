const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('=== GENERAL_TASKS TABLE SCHEMA ===');
    const [columns] = await conn.query('DESCRIBE general_tasks');
    console.table(columns);
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
