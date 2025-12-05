require('dotenv').config({ path: './.env.development' });
const mysql = require('mysql2/promise');

async function checkUsersSchema() {
  let connection;
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    connection = await pool.getConnection();
    
    console.log('Checking users table schema...');
    const [columns] = await connection.query('DESCRIBE users');
    console.log('Users table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsersSchema();
