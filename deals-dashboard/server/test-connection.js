const mysql = require('mysql2/promise');

async function testConnections() {
  const credentials = [
    { user: 'root', password: 'backend', name: 'backend' },
    { user: 'root', password: '', name: 'empty' },
    { user: 'root', password: 'root', name: 'root' },
    { user: 'root', password: 'password', name: 'password' },
    { user: 'root', password: '123456', name: '123456' },
  ];

  console.log('Testing MySQL connections...\n');

  for (const cred of credentials) {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: cred.user,
        password: cred.password,
      });

      const [rows] = await connection.query('SHOW DATABASES');
      console.log(`✓ SUCCESS with password: "${cred.password}"`);
      console.log(`  Databases found: ${rows.length}`);
      await connection.end();
      break;
    } catch (err) {
      console.log(`✗ Failed with password: "${cred.password}" - ${err.code}`);
    }
  }
}

testConnections();
