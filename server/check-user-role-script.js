const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkUser() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'deals_db',
    port: process.env.DB_PORT || 3306,
  });

  try {
    const [rows] = await pool.query(`
      SELECT u.email, u.first_name, u.last_name, u.username, u.department, u.role_id, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = 'sonalicodigix@gmail.com'
    `);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}

checkUser();
