require('dotenv').config({ path: './.env.development' });
const mysql = require('mysql2/promise');

async function checkEstimations() {
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
    
    console.log('Checking estimations table...');
    const [tables] = await connection.query('SHOW TABLES LIKE "estimations"');
    console.log('Table exists:', tables.length > 0);

    if (tables.length > 0) {
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM estimations');
      console.log('Estimations count:', rows[0].count);

      if (rows[0].count > 0) {
        const [data] = await connection.query('SELECT * FROM estimations LIMIT 5');
        console.log('Sample data:', JSON.stringify(data, null, 2));
      } else {
        console.log('No estimations found');
      }
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkEstimations();
