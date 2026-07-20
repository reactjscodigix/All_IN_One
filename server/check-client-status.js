const pool = require('./config/database');

async function checkClientStatus() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('--- Deal 8 Status ---');
    const [deals] = await connection.query('SELECT id, deal_name, company_id, status FROM deals WHERE id = 8');
    console.table(deals);

    console.log('--- Lead 10 Status ---');
    const [leads] = await connection.query('SELECT id, lead_name, company_id, lead_status, converted_deal_id FROM leads WHERE id = 10');
    console.table(leads);

    console.log('--- Company 1 Status ---');
    const [companies] = await connection.query('SELECT id, company_name, status FROM companies WHERE id = 1');
    console.table(companies);

    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkClientStatus();
