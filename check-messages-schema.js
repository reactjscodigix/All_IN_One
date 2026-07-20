const pool = require('./server/config/database');

async function checkSchema() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('DESCRIBE messages');
    console.log('Messages table schema:');
    rows.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
    if (connection) connection.release();
  }
  process.exit(0);
}

checkSchema();
