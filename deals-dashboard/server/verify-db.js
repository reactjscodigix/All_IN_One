const mysql = require('mysql2/promise');

async function verifyDatabase() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'backend',
    database: 'deals_db'
  });

  let conn;
  try {
    conn = await pool.getConnection();

    console.log('\n=== Companies Table ===');
    const [companies] = await conn.query('SELECT id, company_name, account_url, status FROM companies');
    console.table(companies);

    console.log('\n=== Company Subscriptions Table ===');
    const [subs] = await conn.query('SELECT company_id, plan_name, plan_type, status FROM company_subscriptions');
    console.table(subs);

    console.log('\n=== API Query Test ===');
    const [result] = await conn.query(`
      SELECT c.id, c.company_name, c.account_url, c.status, cs.plan_name, cs.plan_type, cs.status as sub_status
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      ORDER BY c.id
    `);
    console.table(result);

    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    if (conn) conn.release();
    process.exit(1);
  }
}

verifyDatabase();
