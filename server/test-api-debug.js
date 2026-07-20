const pool = require('./config/database');

async function testQuery() {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT 
        i.*,
        c.company_name AS client_name,
        c.email AS company_email,
        c.phone AS company_phone
      FROM invoices i 
      LEFT JOIN companies c ON i.client_id = c.id 
      LIMIT 1
    `);
    
    if (rows.length > 0) {
      console.log('Query Result Keys:', Object.keys(rows[0]));
      console.log('\nFull Object:');
      console.log(JSON.stringify(rows[0], null, 2));
    } else {
      console.log('No invoices found');
    }
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testQuery();
