
const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugLeads() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'all_in_one_user',
      password: process.env.DB_PASSWORD || 'C0digix$309',
      database: process.env.DB_NAME || 'deals_db'
    });

    console.log('Connected to database.');

    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM leads');
    console.log('Leads count:', rows[0].count);

    const [companies] = await connection.execute('SELECT COUNT(*) as count FROM companies');
    console.log('Companies count:', companies[0].count);

    const [leads] = await connection.execute('SELECT * FROM leads LIMIT 10');
    console.log('Sample leads:', JSON.stringify(leads, null, 2));

    const [dealsSchema] = await connection.execute('DESCRIBE deals');
    console.table(dealsSchema);

    const [users] = await connection.execute('SELECT id, first_name FROM users');
    console.log('Users:', users);

    const [contacts] = await connection.execute('SELECT COUNT(*) as count FROM contacts');
    console.log('Contacts count:', contacts[0].count);

    await connection.end();
  } catch (err) {
    console.error('Error debugging leads:', err);
  }
}

debugLeads();
