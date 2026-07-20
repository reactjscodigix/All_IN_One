const mysql = require('mysql2/promise');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
}

async function listUsers() {
  try {
    const pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3307,
      user: 'all_in_one_user',
      password: 'C0digix$309',
      database: 'deals_db'
    });

    const [rows] = await pool.query('SELECT id, email, password FROM users');
    console.log('Users in database:');
    rows.forEach(user => {
      console.log(`Email: [${user.email}], Password Length: ${user.password.length}, Hashed Password: [${user.password}]`);
    });

    const testPasswords = ['password123', 'password', '123456', 'admin', 'admin123', 'allinone', 'pass123'];
    testPasswords.forEach(pw => {
      console.log(`Hash for '${pw}': ${hashPassword(pw)}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listUsers();
