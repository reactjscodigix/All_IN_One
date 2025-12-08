const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'deals_db'
    });
    
    const conn = await pool.getConnection();
    
    const [roles] = await conn.query('SELECT * FROM roles');
    console.log('\n✓ Roles:');
    roles.forEach(r => console.log(`  - ${r.id}: ${r.name}`));
    
    const [users] = await conn.query('SELECT id, first_name, last_name, email, role_id FROM users');
    console.log('\n✓ Users:');
    users.forEach(u => console.log(`  - ${u.email} (${u.first_name} ${u.last_name})`));
    
    conn.release();
    pool.end();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
