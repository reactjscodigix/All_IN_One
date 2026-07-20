const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const conn = await pool.getConnection();
    const [roles] = await conn.query('SELECT id, name FROM roles ORDER BY id');
    console.log('=== ROLES TABLE ===');
    roles.forEach(r => console.log(`  ${r.id}: ${r.name}`));
    
    const [user] = await conn.query('SELECT id, email, role_id FROM users WHERE email = ?', ['superadmin3@test.com']);
    if (user.length > 0) {
      console.log('\n=== USER: superadmin3@test.com ===');
      console.log(`  ID: ${user[0].id}`);
      console.log(`  role_id: ${user[0].role_id}`);
      
      const [roleInfo] = await conn.query('SELECT id, name FROM roles WHERE id = ?', [user[0].role_id]);
      console.log(`  role_name: ${roleInfo[0]?.name || 'NOT FOUND'}`);
    }
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
