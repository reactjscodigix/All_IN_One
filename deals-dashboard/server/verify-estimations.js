const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('📊 Verifying Estimations Data...\n');
    
    const [estimations] = await connection.query(`
      SELECT 
        e.id,
        e.estimation_number,
        c.company_name,
        e.amount,
        e.currency,
        e.status,
        e.estimate_date
      FROM estimations e
      LEFT JOIN companies c ON e.client_id = c.id
      ORDER BY e.created_at DESC
      LIMIT 10
    `);
    
    console.log('✅ Latest 10 Estimations:\n');
    estimations.forEach((est, idx) => {
      console.log(`${idx + 1}. ${est.estimation_number}`);
      console.log(`   Company: ${est.company_name || 'N/A'}`);
      console.log(`   Amount: ${est.currency}${est.amount}`);
      console.log(`   Status: ${est.status}`);
      console.log(`   Date: ${est.estimate_date}`);
      console.log('');
    });
    
    console.log(`\n📈 Total Estimations in Database: ${estimations.length}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
})();
