require('dotenv').config({ path: './.env.development' });
const mysql = require('mysql2/promise');

async function testAPI() {
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
    
    console.log('Testing the exact query from the endpoint...');
    
    const query = `
      SELECT e.*, c.company_name, c.logo, p.name as project_name, u.first_name as creator_first_name, u.avatar
      FROM estimations e
      LEFT JOIN companies c ON e.client_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      LEFT JOIN users u ON e.estimate_by = u.id
      WHERE 1=1
      ORDER BY e.created_at DESC
    `;

    const [rows] = await connection.query(query);
    console.log('Query result count:', rows.length);
    if (rows.length > 0) {
      console.log('First row:', JSON.stringify(rows[0], null, 2));
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testAPI();
