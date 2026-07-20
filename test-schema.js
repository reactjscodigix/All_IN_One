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
    console.log(JSON.stringify(rows, null, 2));
    
    const [companies] = await conn.query('DESCRIBE companies');
    console.log('\nCompanies table schema:');
    console.log(JSON.stringify(companies, null, 2));
    
    conn.release();
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
