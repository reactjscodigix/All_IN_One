const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'backend',
    database: 'deals_db'
  });

  let conn;
  try {
    conn = await pool.getConnection();

    // Test the exact query that the server is using
    const [rows] = await conn.query(`
      SELECT c.*, cs.plan_name, cs.plan_type, cs.currency, cs.language, cs.price, cs.registered_date, cs.expiring_on
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      ORDER BY c.created_at DESC
    `);

    console.log('Rows returned:', rows.length);
    console.log('First row stringified:', JSON.stringify(rows[0]));
    console.log('First row keys:', Object.keys(rows[0]));
    console.log('First row plan_name:', rows[0].plan_name);
    console.log('First row plan_type:', rows[0].plan_type);

    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    if (conn) conn.release();
    process.exit(1);
  }
}

test();
