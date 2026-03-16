const mysql = require('mysql2/promise');

async function testConnections() {
  const configs = [
    { host: 'localhost', port: 3306, user: 'root', password: '' },
    { host: '127.0.0.1', port: 3306, user: 'root', password: '' },
    { host: 'localhost', port: 3307, user: 'root', password: '' },
    { host: '127.0.0.1', port: 3307, user: 'root', password: '' },
    { host: 'localhost', port: 3306, user: 'all_in_one_user', password: 'C0digix$309' },
    { host: '127.0.0.1', port: 3306, user: 'all_in_one_user', password: 'C0digix$309' },
    { host: 'localhost', port: 3307, user: 'all_in_one_user', password: 'C0digix$309' },
    { host: '127.0.0.1', port: 3307, user: 'all_in_one_user', password: 'C0digix$309' },
  ];

  for (const config of configs) {
    console.log(`Testing: ${config.host}:${config.port} as ${config.user}...`);
    try {
      const connection = await mysql.createConnection({
        ...config,
        database: 'deals_db'
      });
      console.log(`✓ SUCCESS: ${config.host}:${config.port} as ${config.user}`);
      
      const [rows] = await connection.query(
        'SELECT u.email, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
        ['rohityadav@gmail.com']
      );
      
      if (rows.length > 0) {
        console.log(`User ${rows[0].email} current role: ${rows[0].role_name}`);
        if (rows[0].role_name !== 'Super Admin') {
          console.log('Updating to Super Admin...');
          const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', ['Super Admin']);
          if (roles.length > 0) {
            await connection.query('UPDATE users SET role_id = ? WHERE email = ?', [roles[0].id, 'rohityadav@gmail.com']);
            console.log('✓ Update complete!');
          }
        }
      } else {
        console.log('User not found in this DB.');
      }
      
      await connection.end();
      process.exit(0);
    } catch (err) {
      console.log(`✗ FAILED: ${err.message}`);
    }
  }
  process.exit(1);
}

testConnections();
