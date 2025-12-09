const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db'
});

(async () => {
  try {
    const conn = await pool.getConnection();
    const [users] = await conn.query('SELECT id, first_name, last_name, email FROM users');
    console.log('Total users:', users.length);
    users.forEach(u => {
      console.log(`ID: ${u.id}, Name: ${u.first_name} ${u.last_name}, Email: ${u.email}`);
    });
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  pool.end();
})();
