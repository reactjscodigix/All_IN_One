const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testInsert() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to database');
    
    const [result] = await conn.query(
      'INSERT INTO contacts (first_name, last_name, email, phone, position, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['Test', 'Contact', 'test.contact@example.com', '555-0000', 'Test Position', 'Active']
    );
    
    console.log('✓ Contact inserted successfully, ID:', result.insertId);
    
    const [rows] = await conn.query('SELECT * FROM contacts WHERE id = ?', [result.insertId]);
    console.log('Inserted contact:', rows[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

testInsert();
