const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db'
});

async function testDealsQuery() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Testing DEALS query...');
    const [deals] = await connection.query('SELECT d.*, c.name as company_name FROM deals d LEFT JOIN companies c ON d.company_id = c.id LIMIT 1');
    console.log('✓ Deals query works');
    console.log('Deals result:', deals.length, 'records');
    
    console.log('\nTesting PROJECTS query...');
    const [projects] = await connection.query('SELECT p.*, c.name as company_name FROM projects p LEFT JOIN companies c ON p.company_id = c.id LIMIT 1');
    console.log('✓ Projects query works');
    console.log('Projects result:', projects.length, 'records');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('Table does not exist. Need to initialize database.');
    }
    process.exit(1);
  }
}

testDealsQuery();
