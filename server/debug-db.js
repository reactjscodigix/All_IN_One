
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  const [rows] = await conn.execute('SELECT id, email, first_name, username FROM users LIMIT 10');
  console.log('=== USERS ===');
  console.log(JSON.stringify(rows, null, 2));

  const [frows] = await conn.execute('DESCRIBE followups');
  console.log('=== FOLLOWUPS SCHEMA ===');
  console.log(JSON.stringify(frows, null, 2));

  await conn.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
