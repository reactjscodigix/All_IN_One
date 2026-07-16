const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'all_in_one_user',
    password: 'C0digix$309',
    database: 'deals_db'
  });

  const [projects] = await connection.query('SELECT * FROM projects ORDER BY id DESC LIMIT 5');
  console.log('Latest projects:', projects);
  
  process.exit(0);
}

main().catch(console.error);
