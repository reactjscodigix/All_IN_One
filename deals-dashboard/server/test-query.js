const mysql = require('mysql2/promise');

async function testQuery() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'backend',
    database: 'deals_db'
  });

  let conn;
  try {
    conn = await pool.getConnection();

    console.log('\nExecuting the EXACT query from server.js:');
    const query = `
      SELECT c.*, cs.plan_name, cs.plan_type, cs.currency, cs.language, cs.price, cs.registered_date, cs.expiring_on
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      ORDER BY c.created_at DESC
    `;
    console.log('Query:', query.trim());

    const [rows] = await conn.query(query);
    
    console.log('\n=== Result set count:', rows.length, '===');
    console.log('\n=== First company object (raw):');
    const firstRow = rows[0];
    console.log('Keys in first row:', Object.keys(firstRow).sort());
    console.log('\nFull first row:');
    console.log(JSON.stringify(firstRow, null, 2));

    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    if (conn) conn.release();
    process.exit(1);
  }
}

testQuery();
