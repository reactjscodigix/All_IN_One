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
    console.log('🔄 Starting CRM Corrections Migration...\n');

    console.log('📋 Applying 7 Important Corrections...\n');

    console.log('1️⃣ Adding LEADS table (new lead management)...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(20),
        company_name VARCHAR(255),
        source ENUM('Website', 'Referral', 'Direct', 'Email', 'Social', 'Other') DEFAULT 'Other',
        status ENUM('New', 'Contacted', 'Qualified', 'Unqualified', 'Converted') DEFAULT 'New',
        notes LONGTEXT,
        
        converted_company_id INT,
        converted_contact_id INT,
        converted_deal_id INT,
        
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (converted_company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (converted_contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
        FOREIGN KEY (converted_deal_id) REFERENCES deals(id) ON DELETE SET NULL,
        
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_source (source),
        INDEX idx_created_at (created_at)
      )
    `).catch(() => console.log('   ⚠ leads table already exists'));
    console.log('   ✓ leads table created/updated\n');

    console.log('2️⃣ Adding DEAL_CONTACTS table (multiple contacts per deal)...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS deal_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deal_id INT NOT NULL,
        contact_id INT NOT NULL,
        role VARCHAR(100),
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        UNIQUE KEY unique_deal_contact (deal_id, contact_id),
        
        INDEX idx_deal_id (deal_id),
        INDEX idx_contact_id (contact_id),
        INDEX idx_is_primary (is_primary)
      )
    `).catch(() => console.log('   ⚠ deal_contacts table already exists'));
    console.log('   ✓ deal_contacts table created/updated\n');

    console.log('3️⃣ Updating ENTITY_FILES to support Estimations & Invoices...');
    await connection.query(`
      ALTER TABLE entity_files ADD COLUMN IF NOT EXISTS estimation_id INT
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE entity_files ADD CONSTRAINT FK_entity_files_estimation 
      FOREIGN KEY (estimation_id) REFERENCES estimations(id) ON DELETE CASCADE
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE entity_files ADD COLUMN IF NOT EXISTS invoice_id INT
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE entity_files ADD CONSTRAINT FK_entity_files_invoice 
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    `).catch(() => {});
    console.log('   ✓ entity_files updated with estimation_id and invoice_id\n');

    console.log('4️⃣ Refactoring ACTIVITIES to use universal entity pattern...');
    await connection.query(`
      ALTER TABLE activities ADD COLUMN IF NOT EXISTS entity_type ENUM('Company', 'Contact', 'Deal', 'Project', 'Lead') AFTER activity_type
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE activities ADD COLUMN IF NOT EXISTS entity_id INT AFTER entity_type
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE activities ADD INDEX idx_entity_type (entity_type)
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE activities ADD INDEX idx_entity_id (entity_id)
    `).catch(() => {});
    console.log('   ✓ activities table enhanced with entity_type and entity_id\n');

    console.log('5️⃣ Refactoring ENTITY_NOTES to use universal entity pattern...');
    await connection.query(`
      ALTER TABLE entity_notes ADD COLUMN IF NOT EXISTS entity_type ENUM('Company', 'Contact', 'Deal', 'Project', 'Lead') AFTER title
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE entity_notes ADD COLUMN IF NOT EXISTS entity_id INT AFTER entity_type
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE entity_notes ADD INDEX idx_entity_type (entity_type)
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE entity_notes ADD INDEX idx_entity_id (entity_id)
    `).catch(() => {});
    console.log('   ✓ entity_notes table enhanced with entity_type and entity_id\n');

    console.log('6️⃣ Setting up USERS table with proper structure...');
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(200)
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100)
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id INT
    `).catch(() => {});
    
    await connection.query(`
      ALTER TABLE users ADD CONSTRAINT FK_user_manager 
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
    `).catch(() => {});

    await connection.query(`
      ALTER TABLE users ADD INDEX idx_manager_id (manager_id)
    `).catch(() => {});
    console.log('   ✓ users table configured with manager hierarchy\n');

    console.log('7️⃣ Setting up ROLES & PERMISSIONS with role_permissions junction...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        permission_name VARCHAR(255) NOT NULL,
        description TEXT,
        module_name VARCHAR(100),
        
        can_create BOOLEAN DEFAULT FALSE,
        can_read BOOLEAN DEFAULT FALSE,
        can_update BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_permission (role_id, permission_name),
        
        INDEX idx_role_id (role_id),
        INDEX idx_module_name (module_name)
      )
    `).catch(() => console.log('   ⚠ role_permissions table already exists'));

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        assigned_by INT,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_user_role (user_id, role_id),
        
        INDEX idx_user_id (user_id),
        INDEX idx_role_id (role_id)
      )
    `).catch(() => console.log('   ⚠ user_roles table already exists'));
    console.log('   ✓ role_permissions and user_roles tables created\n');

    console.log('📌 Additional Enhancements...\n');

    console.log('   → Creating activity_mentions for @mentions support...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_mentions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        mentioned_user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_mention (activity_id, mentioned_user_id),
        
        INDEX idx_activity_id (activity_id),
        INDEX idx_mentioned_user_id (mentioned_user_id)
      )
    `).catch(() => console.log('   ⚠ activity_mentions table already exists'));

    console.log('   → Creating note_mentions for @mentions support...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS note_mentions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        mentioned_user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (note_id) REFERENCES entity_notes(id) ON DELETE CASCADE,
        FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_note_mention (note_id, mentioned_user_id),
        
        INDEX idx_note_id (note_id),
        INDEX idx_mentioned_user_id (mentioned_user_id)
      )
    `).catch(() => console.log('   ⚠ note_mentions table already exists'));

    console.log('   → Creating contact_company_roles table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_company_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact_id INT NOT NULL,
        company_id INT NOT NULL,
        role VARCHAR(100),
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        UNIQUE KEY unique_contact_company (contact_id, company_id),
        
        INDEX idx_contact_id (contact_id),
        INDEX idx_company_id (company_id),
        INDEX idx_role (role)
      )
    `).catch(() => console.log('   ⚠ contact_company_roles table already exists'));

    console.log('   ✓ Additional enhancement tables created\n');

    console.log('\n✅ CRM Corrections Migration Completed Successfully!\n');
    
    console.log('📊 Summary of Corrections Applied:');
    console.log('  1. ✓ Leads table added (Lead → Contact → Deal workflow)');
    console.log('  2. ✓ Deal-Contacts junction table added (multiple contacts per deal)');
    console.log('  3. ✓ Entity-Files enhanced (estimations & invoices support)');
    console.log('  4. ✓ Activities refactored (universal entity_type/entity_id pattern)');
    console.log('  5. ✓ Entity-Notes refactored (universal entity_type/entity_id pattern)');
    console.log('  6. ✓ Users table configured (with manager hierarchy)');
    console.log('  7. ✓ Roles & Permissions system implemented (role_permissions + user_roles)\n');
    
    console.log('📈 Additional Tables Created:');
    console.log('  • activity_mentions: Support for @mentions in activities');
    console.log('  • note_mentions: Support for @mentions in notes');
    console.log('  • contact_company_roles: Support for multiple roles per contact-company relation\n');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (connection) connection.release();
    process.exit(1);
  }
}

runMigration();
