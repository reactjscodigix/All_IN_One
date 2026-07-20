const mysql = require('mysql2/promise');

async function fixDatabase() {
  let conn;
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'backend',
      database: 'deals_db'
    });

    conn = await pool.getConnection();

    console.log('Clearing old data...');
    await conn.query('DELETE FROM company_subscriptions');
    await conn.query('DELETE FROM companies');
    
    console.log('Inserting corrected sample companies with account URLs...');
    const [result] = await conn.query(`
      INSERT INTO companies (company_name, email, phone, website, address, account_url, status) VALUES
      ('NovaWave LLC', 'nova@llc.com', '+1-234-567-8900', 'www.novawave.com', '123 Tech St, San Francisco, CA', 'https://nw.nova.com', 'Active'),
      ('BlueSky Industries', 'bluesky@ind.com', '+1-234-567-8901', 'www.bluesky.com', '456 Business Ave, New York, NY', 'https://bl.blue.com', 'Inactive'),
      ('Silver Hawk', 'silver@hawk.com', '+1-234-567-8902', 'www.silverhawk.com', '789 Software Dr, Austin, TX', 'https://sh.silver.com', 'Active'),
      ('Summit Peak', 'summit@peak.com', '+1-234-567-8903', 'www.summitpeak.com', '321 Factory Ln, Detroit, MI', 'https://sp.summit.com', 'Active'),
      ('RiverStone Venture', 'stone@river.com', '+1-234-567-8904', 'www.riverstone.com', '654 Startup Way, Seattle, WA', 'https://rs.river.com', 'Active')
    `);

    console.log('Inserting company subscriptions...');
    await conn.query(`
      INSERT INTO company_subscriptions (company_id, plan_name, plan_type, currency, language, price, registered_date, expiring_on, status) VALUES
      (1, 'Advanced', 'Monthly', 'USD', 'English', 199.99, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Active'),
      (2, 'Enterprise', 'Monthly', 'USD', 'English', 499.99, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Active'),
      (3, 'Advanced', 'Monthly', 'USD', 'English', 199.99, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Active'),
      (4, 'Advanced', 'Monthly', 'USD', 'English', 199.99, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Active'),
      (5, 'Basic', 'Monthly', 'USD', 'English', 29.99, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Active')
    `);

    console.log('✓ Database fixed successfully!');
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    if (conn) conn.release();
    process.exit(1);
  }
}

fixDatabase();
