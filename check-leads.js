const pool = require('./deals-dashboard/server/config/database');
async function check() {
  try {
    console.log('--- Table Structure ---');
    const [result] = await pool.query('SHOW CREATE TABLE leads');
    console.log(result[0]['Create Table']);
    
    console.log('\n--- Leads in DB ---');
    const [leads] = await pool.query('SELECT id, lead_name FROM leads');
    console.log('Leads count:', leads.length);
    console.log(JSON.stringify(leads, null, 2));

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
check();
