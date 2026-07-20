const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('=== INVOICE 4 FULL DETAILS ===');
    const [inv4] = await conn.query(
      'SELECT i.*, c.company_name, c.id as company_id FROM invoices i LEFT JOIN companies c ON i.client_id = c.id WHERE i.id = 4'
    );
    if (inv4.length) {
      console.log(JSON.stringify(inv4[0], null, 2));
    }
    
    console.log('\n=== COMPANY ID 6 ===');
    const [company6] = await conn.query('SELECT id, company_name FROM companies WHERE id = 6');
    if (company6.length) {
      console.log(company6[0]);
    } else {
      console.log('NOT FOUND');
    }
    
    console.log('\n=== ALL COMPANIES ===');
    const [allCompanies] = await conn.query('SELECT id, company_name FROM companies ORDER BY id');
    allCompanies.forEach(c => console.log(`ID ${c.id}: ${c.company_name}`));
    
    console.log('\n=== INVOICE 4 CLIENT_ID ===');
    const [inv4Simple] = await conn.query('SELECT id, invoice_number, client_id FROM invoices WHERE id = 4');
    console.log(inv4Simple[0]);
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
