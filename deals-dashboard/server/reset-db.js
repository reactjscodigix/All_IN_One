const mysql = require('mysql2/promise');

async function resetDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'deals_db'
    });

    console.log('🔄 Resetting roles table...\n');

    await connection.execute('SET FOREIGN_KEY_CHECKS=0');
    await connection.execute('DROP TABLE IF EXISTS roles');
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');
    console.log('✓ Dropped old roles table');

    await connection.execute(`
      CREATE TABLE roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created new roles table');

    const defaultRoles = [
      { name: 'Super Admin', description: 'Full system access - can manage everything' },
      { name: 'Admin', description: 'Company-wide management - cannot change system settings' },
      { name: 'Deal Manager', description: 'Focus on deals, leads, and pipelines' },
      { name: 'Project Manager', description: 'Focus on projects and team management' },
      { name: 'Employee', description: 'Limited access - only assigned items' }
    ];

    for (const role of defaultRoles) {
      const [result] = await connection.execute(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [role.name, role.description]
      );
      console.log(`✓ Created role: ${role.name} (ID: ${result.insertId})`);
    }

    const [allRoles] = await connection.execute('SELECT id, name FROM roles ORDER BY id');
    console.log('\n📋 Final roles in database:');
    allRoles.forEach(r => console.log(`   ${r.id} → ${r.name}`));

    console.log('\n✅ Database reset complete!');
    await connection.end();
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

resetDatabase();
