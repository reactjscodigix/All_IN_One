const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function seedData() {
  const connection = await pool.getConnection();
  try {
    console.log('🌱 Starting to seed database...\n');

    console.log('🧹 Clearing existing data...');
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    await connection.query('TRUNCATE TABLE deals');
    await connection.query('TRUNCATE TABLE contacts');
    await connection.query('TRUNCATE TABLE companies');
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    console.log('✅ Data cleared\n');

    await connection.beginTransaction();

    console.log('📝 Inserting companies...');
    const companies = [
      ['Acme Corp', 'Technology', 'contact@acme.com', '+1-555-0001', 'www.acme.com', '123 Tech Street', 'San Francisco', 'CA', 'USA', 150, '10000000'],
      ['Tech Solutions Inc', 'Technology', 'info@techsol.com', '+1-555-0002', 'www.techsol.com', '456 Innovation Blvd', 'New York', 'NY', 'USA', 200, '25000000'],
      ['Global Marketing Ltd', 'Marketing', 'contact@globalmark.com', '+1-555-0003', 'www.globalmark.com', '789 Market Lane', 'Los Angeles', 'CA', 'USA', 85, '5000000'],
      ['Finance Pro Services', 'Finance', 'support@financepro.com', '+1-555-0004', 'www.financepro.com', '321 Wall Street', 'New York', 'NY', 'USA', 120, '15000000'],
      ['Creative Digital Agency', 'Marketing', 'hello@creativedigital.com', '+1-555-0005', 'www.creativedigital.com', '654 Design Way', 'Austin', 'TX', 'USA', 45, '2000000']
    ];

    for (const company of companies) {
      await connection.query(
        `INSERT INTO companies (company_name, industry, email, phone, website, address, city, state, country, employee_count, annual_revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        company
      );
    }
    console.log('✅ Companies inserted\n');

    console.log('📝 Inserting contacts...');
    const contacts = [
      ['John', 'Smith', 'john.smith@acme.com', '+1-555-1001', 1],
      ['Sarah', 'Johnson', 'sarah.johnson@acme.com', '+1-555-1002', 1],
      ['Mike', 'Davis', 'mike.davis@techsol.com', '+1-555-1003', 2],
      ['Emily', 'Wilson', 'emily.wilson@globalmark.com', '+1-555-1004', 3],
      ['Robert', 'Brown', 'robert.brown@financepro.com', '+1-555-1005', 4],
      ['Jessica', 'Miller', 'jessica.miller@creativedigital.com', '+1-555-1006', 5],
      ['David', 'Taylor', 'david.taylor@techsol.com', '+1-555-1007', 2],
      ['Lisa', 'Anderson', 'lisa.anderson@acme.com', '+1-555-1008', 1]
    ];

    for (const contact of contacts) {
      await connection.query(
        `INSERT INTO contacts (first_name, last_name, email, phone, company_id) VALUES (?, ?, ?, ?, ?)`,
        contact
      );
    }
    console.log('✅ Contacts inserted\n');

    console.log('📝 Inserting deals...');
    const deals = [
      ['Enterprise Software License - Acme', 1, 1, 50000, 'USD', 'Negotiation', 'In Progress', 'Enterprise software licensing deal for Acme Corp'],
      ['Cloud Migration Project - TechSol', 2, 3, 75000, 'USD', 'Proposal', 'In Progress', 'AWS cloud infrastructure migration'],
      ['Digital Marketing Campaign - GlobalMark', 3, 4, 25000, 'USD', 'Proposal', 'In Progress', 'Q1 2024 digital marketing campaign'],
      ['Financial Advisory Services', 4, 3, 40000, 'USD', 'Discovery', 'Negotiation', 'Annual financial planning and advisory'],
      ['Website Redesign - Creative Digital', 5, 6, 35000, 'USD', 'Proposal', 'In Progress', 'Complete website redesign and optimization'],
      ['Data Analytics Platform - Acme', 1, 1, 100000, 'USD', 'Negotiation', 'Negotiation', 'Advanced data analytics and reporting platform'],
      ['E-commerce Integration - TechSol', 2, 7, 45000, 'USD', 'Proposal', 'In Progress', 'E-commerce platform integration services']
    ];

    for (const deal of deals) {
      await connection.query(
        `INSERT INTO deals (deal_name, company_id, contact_id, deal_value, currency, pipeline, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        deal
      );
    }
    console.log('✅ Deals inserted\n');



    await connection.commit();
    console.log('✨ Database seeding completed successfully!');

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error seeding database:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seedData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
