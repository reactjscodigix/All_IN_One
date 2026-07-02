const pool = require('./config/database');

async function checkContacts() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('--- Contacts for Company 1 ---');
    const [contacts] = await connection.query('SELECT * FROM contacts WHERE company_id = 1');
    console.table(contacts);

    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkContacts();
