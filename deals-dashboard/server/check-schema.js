const mysql = require('mysql2/promise');

async function checkSchema() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'backend',
    database: 'deals_db'
  });

  let conn;
  try {
    conn = await pool.getConnection();

    console.log('=== Company Subscriptions Table Schema ===');
    const [cols] = await conn.query('DESCRIBE company_subscriptions');
    cols.forEach(col => {
      console.log(`${col.Field}: ${col.Type}`);
    });

    console.log('\n=== Data in Table ===');
    const [data] = await conn.query('SELECT * FROM company_subscriptions LIMIT 1');
    console.log(JSON.stringify(data[0], null, 2));

    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    if (conn) conn.release();
    process.exit(1);
  }
}

checkSchema();
