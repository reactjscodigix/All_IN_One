const mysql = require('mysql2/promise');

async function verify() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM companies WHERE id = 7');
    
    if (rows.length > 0) {
      const company = rows[0];
      console.log('\n✓ COMPANY DATA VERIFIED:\n');
      console.log('  Basic Info:');
      console.log(`    - ID: ${company.id}`);
      console.log(`    - Name: ${company.company_name}`);
      console.log(`    - Email: ${company.email}`);
      console.log(`    - Email Opt Out: ${company.email_opt_out}`);
      console.log(`  \n  Contact Info:`);
      console.log(`    - Phone: ${company.phone}`);
      console.log(`    - Phone 2: ${company.phone2}`);
      console.log(`    - Fax: ${company.fax}`);
      console.log(`  \n  Company Details:`);
      console.log(`    - Industry: ${company.industry}`);
      console.log(`    - Website: ${company.website}`);
      console.log(`    - Address: ${company.address}`);
      console.log(`    - City: ${company.city}`);
      console.log(`    - State: ${company.state}`);
      console.log(`    - Country: ${company.country}`);
      console.log(`  \n  Additional Fields:`);
      console.log(`    - Reviews: ${company.reviews}`);
      console.log(`    - Owner: ${company.owner}`);
      console.log(`    - Tags: ${company.tags}`);
      console.log(`    - Source: ${company.source}`);
      console.log(`    - Currency: ${company.currency}`);
      console.log(`    - Language: ${company.language}`);
      console.log(`    - Description: ${company.description}`);
      console.log(`  \n  Status: ${company.status}`);
      console.log(`  Created: ${company.created_at}`);
    }
    
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

verify();
