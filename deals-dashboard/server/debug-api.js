const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    
    const query = `
      SELECT e.*, c.company_name, p.name as project_name, u.first_name as creator_first_name
      FROM estimations e
      LEFT JOIN companies c ON e.client_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      LEFT JOIN users u ON e.estimate_by = u.id
      WHERE 1=1
      ORDER BY e.created_at DESC
    `;
    
    console.log('Executing query...');
    const [rows] = await connection.query(query, []);
    console.log('Success! Rows:', rows);
    
    connection.release();
  } catch (error) {
    console.error('SQL Error:', error.message);
    console.error('SQL Code:', error.code);
    console.error('SQL State:', error.sqlState);
  } finally {
    await pool.end();
  }
}

test();
