const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('=== PROJECT_TEAM TABLE SCHEMA ===');
    const [columns] = await conn.query('DESCRIBE project_team');
    console.table(columns);
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
