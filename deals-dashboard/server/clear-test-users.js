const mysql = require('mysql2/promise');

async function clearTestUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'deals_db'
    });

    console.log('🗑️  Clearing test users...\n');

    const testEmails = [
      'superadmin3@test.com',
      'mote1@gmail.com',
      'admin@example.com',
      'john@example.com',
      'jane@example.com',
      'mike@example.com',
      'client@example.com',
      'lead@example.com'
    ];

    for (const email of testEmails) {
      const [result] = await connection.execute(
        'DELETE FROM users WHERE email = ?',
        [email]
      );
      if (result.affectedRows > 0) {
        console.log(`✓ Deleted user: ${email}`);
      }
    }

    const [remaining] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Remaining users in database: ${remaining[0].count}`);

    const [users] = await connection.execute('SELECT id, email, role_id FROM users LIMIT 10');
    if (users.length > 0) {
      console.log('\nRemaining users:');
      for (const user of users) {
        const [roleInfo] = await connection.execute('SELECT name FROM roles WHERE id = ?', [user.role_id]);
        console.log(`  ${user.id} → ${user.email} (role_id: ${user.role_id}, role: ${roleInfo[0]?.name || 'UNKNOWN'})`);
      }
    }

    console.log('\n✅ Cleanup complete!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

clearTestUsers();
