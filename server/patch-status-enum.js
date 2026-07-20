const mysql = require('mysql2/promise');
require('dotenv').config();

async function patchEnum() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'all_in_one_user',
      password: 'C0digix$309',
      database: 'deals_db'
    });

    console.log('Connected to database.');

    await connection.query(`
      ALTER TABLE test_cases 
      MODIFY COLUMN status ENUM('Active', 'Obsolete', 'Draft', 'Approved', 'In Review', 'Ready for Test', 'Rejected') DEFAULT 'Draft';
    `);

    console.log('test_cases table altered successfully.');
    await connection.end();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

patchEnum();
