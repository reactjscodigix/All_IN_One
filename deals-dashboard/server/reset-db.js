const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'mysql'
    });
    
    console.log('Dropping existing database...');
    await conn.query('DROP DATABASE IF EXISTS deals_db');
    
    console.log('Creating new database...');
    await conn.query('CREATE DATABASE deals_db');
    
    console.log('✓ Database reset complete');
    conn.end();
    process.exit(0);
  } catch (e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  }
})();
