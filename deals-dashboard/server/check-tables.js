const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db'
});

async function checkTables() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Checking DEALS table...');
    try {
      const [deals] = await connection.query('DESCRIBE deals');
      console.log('✓ Deals table columns:', deals.map(d => d.Field).join(', '));
    } catch (e) {
      console.log('✗ Deals table does not exist');
    }
    
    console.log('\nChecking COMPANIES table...');
    try {
      const [companies] = await connection.query('DESCRIBE companies');
      console.log('✓ Companies table columns:', companies.map(c => c.Field).join(', '));
    } catch (e) {
      console.log('✗ Companies table does not exist');
    }
    
    console.log('\nChecking PROJECTS table...');
    try {
      const [projects] = await connection.query('DESCRIBE projects');
      console.log('✓ Projects table columns:', projects.map(p => p.Field).join(', '));
    } catch (e) {
      console.log('✗ Projects table does not exist');
    }
    
    console.log('\nAll tables:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log('  -', tableName);
    });
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
