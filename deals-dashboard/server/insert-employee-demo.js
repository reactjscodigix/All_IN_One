const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function insertEmployeeData() {
  let connection;
  try {
    connection = await pool.getConnection();

    const [existingRoles] = await connection.query('SELECT COUNT(*) as count FROM roles WHERE name = "Employee"');
    if (existingRoles[0].count === 0) {
      await connection.query('INSERT INTO roles (name) VALUES (?)', ['Employee']);
      console.log('✓ Employee role inserted');
    } else {
      console.log('✓ Employee role already exists');
    }

    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', ['employee@example.com']);
    if (existingUser.length === 0) {
      const [employeeRole] = await connection.query('SELECT id FROM roles WHERE name = ?', ['Employee']);
      const roleId = employeeRole[0]?.id || 7;

      await connection.query(
        'INSERT INTO users (first_name, last_name, username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Employee', 'Demo', 'employee', 'employee@example.com', 'employee123', roleId, 'Active']
      );
      console.log('✓ Employee demo user created');
      console.log('  Email: employee@example.com');
      console.log('  Password: employee123');
    } else {
      console.log('✓ Employee demo user already exists');
    }

    console.log('\n✅ Employee role and demo user setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

insertEmployeeData();
