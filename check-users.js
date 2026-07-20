const pool = require('./server/config/database');

async function checkUsers() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [users] = await connection.query('SELECT id, first_name, last_name, email FROM users LIMIT 10');
    console.log('Users in database:');
    if (users.length === 0) {
      console.log('  (No users found)');
    } else {
      users.forEach(u => {
        console.log(`  ID ${u.id}: ${u.first_name} ${u.last_name} (${u.email})`);
      });
    }
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
    if (connection) connection.release();
  }
  process.exit(0);
}

checkUsers();
