const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'all_in_one_user',
      password: 'C0digix$309',
      database: 'deals_db'
    });

    console.log('Connected to MySQL database.');

    // Add steps and attachments column
    await connection.query(`
      ALTER TABLE bugs 
      ADD COLUMN steps JSON AFTER description,
      ADD COLUMN attachments JSON AFTER steps;
    `);

    console.log('Successfully added steps and attachments columns to bugs table.');

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
}

migrate();
