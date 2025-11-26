const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'backend',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function setupDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Creating database...');
    await conn.query('CREATE DATABASE IF NOT EXISTS deals_db');
    console.log('✓ Database created');
    
    await conn.query('USE deals_db');
    
    console.log('Creating tables...');
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(20),
        website VARCHAR(255),
        address VARCHAR(500),
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        employee_count INT,
        annual_revenue DECIMAL(15, 2),
        status ENUM('Active', 'Inactive', 'Prospect') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Companies table created');
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE,
        phone VARCHAR(20),
        company_id INT,
        position VARCHAR(100),
        status ENUM('Active', 'Inactive', 'Lead') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Contacts table created');
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deal_name VARCHAR(255) NOT NULL,
        company_id INT,
        contact_id INT,
        stage VARCHAR(100) NOT NULL,
        deal_value DECIMAL(12, 2) NOT NULL,
        status ENUM('Won', 'Lost', 'Pending') NOT NULL DEFAULT 'Pending',
        expected_close_date DATE,
        probability INT DEFAULT 50,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_stage (stage),
        INDEX idx_status (status),
        INDEX idx_company_id (company_id),
        INDEX idx_contact_id (contact_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Deals table created');
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_name VARCHAR(255) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(20),
        company VARCHAR(255),
        lead_source VARCHAR(100),
        lead_status ENUM('New', 'Qualified', 'Unqualified', 'Contacted') DEFAULT 'New',
        rating INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lead_status (lead_status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Leads table created');
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS pipeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        total_deals INT DEFAULT 0,
        total_value DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Pipeline table created');
    
    console.log('\nInserting sample data...');
    
    const [compResult] = await conn.query(`
      INSERT INTO companies (company_name, industry, email, phone, website, employee_count, status) VALUES
      ('SkyHigh Solutions', 'Technology', 'hello@skyhigh.com', '+1-234-567-8900', 'www.skyhigh.com', 250, 'Active'),
      ('Enterprise Corp', 'Finance', 'info@enterprisecorp.com', '+1-234-567-8901', 'www.enterprisecorp.com', 500, 'Active'),
      ('Tech Innovations Ltd', 'Software', 'contact@techinnovations.com', '+1-234-567-8902', 'www.techinnovations.com', 150, 'Active'),
      ('Global Industries', 'Manufacturing', 'sales@globalindustries.com', '+1-234-567-8903', 'www.globalindustries.com', 1000, 'Active'),
      ('StartUp Ventures', 'Startup', 'info@startupventures.com', '+1-234-567-8904', 'www.startupventures.com', 50, 'Prospect')
    `);
    console.log('✓ Inserted 5 companies');
    
    await conn.query(`
      INSERT INTO contacts (first_name, last_name, email, phone, company_id, position, status) VALUES
      ('John', 'Anderson', 'john.anderson@skyhigh.com', '+1-234-567-8900', 1, 'CEO', 'Active'),
      ('Sarah', 'Williams', 'sarah.williams@enterprise.com', '+1-234-567-8901', 2, 'Sales Manager', 'Active'),
      ('Michael', 'Johnson', 'michael.johnson@techinnovations.com', '+1-234-567-8902', 3, 'Product Manager', 'Active'),
      ('Emily', 'Brown', 'emily.brown@globalindustries.com', '+1-234-567-8903', 4, 'Director', 'Active'),
      ('David', 'Miller', 'david.miller@startupventures.com', '+1-234-567-8904', 5, 'Founder', 'Lead')
    `);
    console.log('✓ Inserted 5 contacts');
    
    await conn.query(`
      INSERT INTO deals (deal_name, company_id, contact_id, stage, deal_value, status, probability) VALUES
      ('SkyHigh Annual Booking', 1, 1, 'Appointment', 5451000, 'Won', 100),
      ('CRM Onboarding Package', 2, 2, 'Contact Made', 7214078, 'Lost', 0),
      ('Enterprise Plan Upgrade', 3, 3, 'Presentation', 414800, 'Won', 100),
      ('CRM Migration Project', 4, 4, 'Proposal Made', 1611400, 'Won', 100),
      ('Sales Pipeline Optimization', 5, 5, 'Qualify To Buy', 905947, 'Won', 100),
      ('Tech Solutions Integration', 1, 1, 'Inpipeline', 2150000, 'Pending', 75),
      ('Cloud Services Migration', 2, 2, 'Follow Up', 1850000, 'Lost', 0),
      ('Digital Transformation Package', 3, 3, 'Conversation', 3200000, 'Won', 100),
      ('API Integration Suite', 4, 4, 'Inpipeline', 1250000, 'Won', 100),
      ('Marketing Automation System', 5, 5, 'Conversation', 1800000, 'Pending', 50),
      ('Enterprise Solution Deal', 1, 1, 'Follow Up', 2500000, 'Won', 100),
      ('Startup Growth Package', 2, 2, 'Inpipeline', 1200000, 'Lost', 0),
      ('Advanced Analytics Suite', 3, 3, 'Conversation', 1800000, 'Won', 100),
      ('Business Intelligence Tool', 4, 4, 'Follow Up', 950000, 'Lost', 0),
      ('Cloud Infrastructure Setup', 5, 5, 'Presentation', 3500000, 'Won', 100)
    `);
    console.log('✓ Inserted 15 deals');
    
    await conn.query(`
      INSERT INTO leads (lead_name, email, phone, company, lead_source, lead_status, rating) VALUES
      ('Robert Taylor', 'robert.taylor@example.com', '+1-234-567-9000', 'Tech Solutions Inc', 'Website', 'New', 8),
      ('Jennifer Lee', 'jennifer.lee@example.com', '+1-234-567-9001', 'Digital Agency', 'Referral', 'Qualified', 9),
      ('Thomas Davis', 'thomas.davis@example.com', '+1-234-567-9002', 'Marketing Group', 'Cold Call', 'Contacted', 6),
      ('Patricia Wilson', 'patricia.wilson@example.com', '+1-234-567-9003', 'Business Solutions', 'Email', 'Unqualified', 4),
      ('James Martinez', 'james.martinez@example.com', '+1-234-567-9004', 'Innovation Labs', 'Event', 'New', 7)
    `);
    console.log('✓ Inserted 5 leads');
    
    await conn.query(`
      INSERT INTO pipeline (name, description, total_deals, total_value) VALUES
      ('Sales Pipeline', 'Main sales pipeline for B2B customers', 5, 15000000),
      ('Marketing Pipeline', 'Marketing-generated leads and campaigns', 3, 8000000),
      ('Email Pipeline', 'Email marketing pipeline', 2, 3000000),
      ('Partnership Pipeline', 'Partnership and strategic alliances', 2, 5000000)
    `);
    console.log('✓ Inserted 4 pipelines');
    
    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Setup Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

setupDatabase();
