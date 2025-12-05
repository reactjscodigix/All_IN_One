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
    const [rows] = await conn.query('DESCRIBE invoices');
    console.log('Invoices table schema:');
    rows.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type}`);
    });
    
    const [companies] = await conn.query('DESCRIBE companies');
    console.log('\nCompanies table schema:');
    companies.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type}`);
    });
    
    conn.release();
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
