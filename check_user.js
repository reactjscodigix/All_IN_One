const mysql = require('mysql2');
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3307,
  user: 'all_in_one_user',
  password: 'C0digix$309',
  database: 'deals_db'
}).promise();

async function checkUser() {
  const [users] = await pool.query(
    'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = "rohityadav@gmail.com"'
  );
  console.log(JSON.stringify(users[0], null, 2));
  await pool.end();
}
checkUser().catch(console.error);