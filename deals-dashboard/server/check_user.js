const mysql = require('mysql2/promise');

async function checkUser() {
  try {
    const pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3306,
      user: 'all_in_one_user',
      password: 'C0digix$309',
      database: 'deals_db'
    });

    const [rows] = await pool.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
      ['rohityadav@gmail.com']
    );

    if (rows.length === 0) {
      console.log('User not found.');
    } else {
      const user = rows[0];
      console.log('User details:');
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role ID: ${user.role_id}`);
      console.log(`Role Name: ${user.role_name}`);

      if (user.role_name !== 'Super Admin') {
        console.log('\nUpdating user to Super Admin role...');
        const [roles] = await pool.query('SELECT id FROM roles WHERE name = ?', ['Super Admin']);
        if (roles.length > 0) {
          const superAdminRoleId = roles[0].id;
          await pool.query('UPDATE users SET role_id = ? WHERE id = ?', [superAdminRoleId, user.id]);
          console.log(`User ${user.email} role updated to Super Admin (Role ID: ${superAdminRoleId}).`);
        } else {
          console.error('Super Admin role not found in roles table.');
        }
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUser();
