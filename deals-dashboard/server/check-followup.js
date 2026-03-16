const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [all] = await pool.query('SELECT id, subject FROM followups ORDER BY id DESC LIMIT 10');
    console.log('Last 10 followups:', JSON.stringify(all, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
