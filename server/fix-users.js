const mysql = require('mysql2/promise');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
}

async function fixUsers() {
  try {
    const pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3307,
      user: 'all_in_one_user',
      password: 'C0digix$309',
      database: 'deals_db'
    });

    const usersToEnsure = [
      { first_name: 'Rohit', last_name: 'Yadav', email: 'rohityadav@gmail.com', password: 'admin123', role_id: 1, department: 'Admin' },
      { first_name: 'Leads', last_name: 'Manager', email: 'leads@gmail.com', password: '123456', role_id: 3, department: 'Leads Management' },
      { first_name: 'Sales', last_name: 'Manager', email: 'sales@gmail.com', password: '123456', role_id: 5, department: 'Sales Department' },
      { first_name: 'Lead', last_name: 'User', email: 'lead@gmail.com', password: '123456', role_id: 10, department: 'Marketing' },
      { first_name: 'Sale', last_name: 'User', email: 'sale@gmail.com', password: '123456', role_id: 9, department: 'Sales' },
    ];

    for (const user of usersToEnsure) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);
      const hashedPassword = hashPassword(user.password);
      const username = user.email.split('@')[0];

      if (existing.length > 0) {
        console.log(`Updating user: ${user.email}`);
        await pool.query(
          'UPDATE users SET password = ?, role_id = ?, first_name = ?, last_name = ?, department = ? WHERE id = ?',
          [hashedPassword, user.role_id, user.first_name, user.last_name, user.department, existing[0].id]
        );
      } else {
        console.log(`Creating user: ${user.email}`);
        await pool.query(
          'INSERT INTO users (first_name, last_name, username, email, password, role_id, status, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [user.first_name, user.last_name, username, user.email, hashedPassword, user.role_id, 'Active', user.department]
        );
      }
    }

    console.log('✓ Users ensured successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixUsers();
