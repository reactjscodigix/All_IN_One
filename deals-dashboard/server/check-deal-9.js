const pool = require('./config/database');

async function checkDeal9() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('--- Deal 9 Status ---');
    const [deals] = await connection.query('SELECT id, deal_name, company_id, status FROM deals WHERE id = 9');
    console.table(deals);

    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDeal9();
