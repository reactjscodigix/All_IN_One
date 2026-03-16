const pool = require('./config/database');

async function checkSchema() {
  try {
    const [rows] = await pool.query('DESCRIBE leads');
    console.log('Leads Table Schema:');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('Error describing leads table:', err);
    process.exit(1);
  }
}

checkSchema();
