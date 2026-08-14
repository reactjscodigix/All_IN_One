const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'all_in_one_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'deals_db'
  });

  const [projects] = await connection.query('SELECT * FROM projects ORDER BY id DESC LIMIT 5');
  console.log('Latest projects:', projects);
  
  process.exit(0);
}

main().catch(console.error);
