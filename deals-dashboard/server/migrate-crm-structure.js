const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function runMigration() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔄 Starting CRM Structure Migration...\n');

    console.log('📋 Creating/Updating Tables...\n');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS pipeline_stages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        pipeline_id INT,
        position INT DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_pipeline_id (pipeline_id)
      )
    `);
    console.log('✓ pipeline_stages table created/updated');

    await connection.query(`
      ALTER TABLE deals ADD COLUMN IF NOT EXISTS pipeline_stage_id INT
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE deals ADD CONSTRAINT FK_deal_pipeline_stage 
      FOREIGN KEY (pipeline_stage_id) REFERENCES pipeline_stages(id) ON DELETE SET NULL
    `).catch(() => {});
    console.log('✓ deals table updated with pipeline_stage_id');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_type ENUM('Call', 'Email', 'Meeting', 'Note', 'Follow-up', 'Task') DEFAULT 'Note',
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        
        contact_id INT,
        deal_id INT,
        project_id INT,
        company_id INT,
        
        assigned_to INT,
        created_by INT,
        
        scheduled_date DATETIME,
        completed_date DATETIME,
        duration_minutes INT,
        
        meeting_link VARCHAR(500),
        notes LONGTEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_activity_type (activity_type),
        INDEX idx_contact_id (contact_id),
        INDEX idx_deal_id (deal_id),
        INDEX idx_project_id (project_id),
        INDEX idx_company_id (company_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `).catch(() => console.log('⚠ activities table already exists'));
    console.log('✓ activities table created/updated');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS entity_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT NOT NULL,
        
        contact_id INT,
        company_id INT,
        deal_id INT,
        project_id INT,
        
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        is_important BOOLEAN DEFAULT FALSE,
        
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_contact_id (contact_id),
        INDEX idx_company_id (company_id),
        INDEX idx_deal_id (deal_id),
        INDEX idx_project_id (project_id),
        INDEX idx_priority (priority),
        INDEX idx_created_at (created_at)
      )
    `).catch(() => console.log('⚠ entity_notes table already exists'));
    console.log('✓ entity_notes table created/updated');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS entity_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_id INT NOT NULL,
        
        company_id INT,
        deal_id INT,
        contact_id INT,
        project_id INT,
        
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_file_id (file_id),
        INDEX idx_company_id (company_id),
        INDEX idx_deal_id (deal_id),
        INDEX idx_contact_id (contact_id),
        INDEX idx_project_id (project_id)
      )
    `).catch(() => console.log('⚠ entity_files table already exists'));
    console.log('✓ entity_files table created/updated');

    await connection.query(`
      ALTER TABLE estimations ADD COLUMN IF NOT EXISTS deal_id INT
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE estimations ADD CONSTRAINT FK_estimation_deal 
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL
    `).catch(() => {});
    console.log('✓ estimations table updated with deal_id');

    await connection.query(`
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS estimate_id INT
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE invoices ADD CONSTRAINT FK_invoice_estimate 
      FOREIGN KEY (estimate_id) REFERENCES estimations(id) ON DELETE SET NULL
    `).catch(() => {});
    console.log('✓ invoices table updated with estimate_id');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        project_id INT NOT NULL,
        
        status ENUM('Open', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Open',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        
        assigned_to INT,
        created_by INT,
        
        start_date DATE,
        due_date DATE,
        completed_date DATETIME,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_project_id (project_id),
        INDEX idx_status (status),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_due_date (due_date)
      )
    `).catch(() => console.log('⚠ project_tasks table already exists'));
    console.log('✓ project_tasks table created/updated');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_team (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100),
        allocation_percentage INT DEFAULT 100,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_user (project_id, user_id),
        
        INDEX idx_project_id (project_id),
        INDEX idx_user_id (user_id)
      )
    `).catch(() => console.log('⚠ project_team table already exists'));
    console.log('✓ project_team table created/updated');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_timesheets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        work_date DATE NOT NULL,
        
        hours_worked DECIMAL(5, 2) NOT NULL,
        description LONGTEXT,
        
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_project_id (project_id),
        INDEX idx_user_id (user_id),
        INDEX idx_work_date (work_date)
      )
    `).catch(() => console.log('⚠ project_timesheets table already exists'));
    console.log('✓ project_timesheets table created/updated');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS estimation_line_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estimation_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        description LONGTEXT,
        quantity DECIMAL(10, 2) NOT NULL,
        rate DECIMAL(15, 2) NOT NULL,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        tax_percent DECIMAL(5, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        subtotal DECIMAL(15, 2),
        total DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_estimation_id (estimation_id),
        FOREIGN KEY (estimation_id) REFERENCES estimations(id) ON DELETE CASCADE
      )
    `).catch(() => console.log('⚠ estimation_line_items table already exists'));
    console.log('✓ estimation_line_items table created/updated');

    await connection.query(`
      ALTER TABLE estimations ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15, 2) DEFAULT 0
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE estimations ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) DEFAULT 0
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE estimations ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 0
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE estimations ADD COLUMN IF NOT EXISTS total DECIMAL(15, 2)
    `).catch(() => {});
    
    console.log('✓ estimations table enhanced with financial fields');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        contact_id INT NOT NULL,
        
        status ENUM('Open', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Open',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        
        assigned_to INT,
        created_by INT,
        
        due_date DATE,
        completed_date DATETIME,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_contact_id (contact_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date)
      )
    `).catch(() => console.log('⚠ contact_tasks table already exists'));
    console.log('✓ contact_tasks table created/updated');

    console.log('\n✅ Migration completed successfully!\n');
    
    console.log('📊 CRM Structure Summary:');
    console.log('  ├─ Companies');
    console.log('  │  ├─ Contacts');
    console.log('  │  ├─ Deals');
    console.log('  │  │  ├─ Pipeline Stages');
    console.log('  │  │  ├─ Estimations');
    console.log('  │  │  │  └─ Estimation Line Items');
    console.log('  │  │  ├─ Invoices (from Estimates)');
    console.log('  │  │  │  └─ Invoice Items');
    console.log('  │  │  ├─ Projects');
    console.log('  │  │  │  ├─ Project Tasks');
    console.log('  │  │  │  ├─ Project Team');
    console.log('  │  │  │  └─ Project Timesheets');
    console.log('  │  │  ├─ Activities');
    console.log('  │  │  └─ Notes');
    console.log('  │  ├─ Files');
    console.log('  │  ├─ Activities');
    console.log('  │  └─ Notes');
    console.log('  ├─ Contact Activities');
    console.log('  ├─ Contact Tasks');
    console.log('  ├─ Contact Notes');
    console.log('  └─ Contact Files');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (connection) connection.release();
    process.exit(1);
  }
}

runMigration();
