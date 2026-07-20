const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('=== USERS TABLE SCHEMA ===');
    const [columns] = await conn.query('DESCRIBE users');
    console.log(columns);
    
    console.log('\n=== INVOICES TABLE SCHEMA ===');
    const [invColumns] = await conn.query('DESCRIBE invoices');
    console.log(invColumns);
    
    console.log('\n=== COMPANIES TABLE SCHEMA ===');
    const [compColumns] = await conn.query('DESCRIBE companies');
    console.log(compColumns);
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
