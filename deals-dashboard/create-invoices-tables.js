const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, 'server', envFile) });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deals_db',
});

async function createTables() {
  const connection = await pool.getConnection();
  try {
    console.log('Creating invoices table...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        client_id INT NOT NULL,
        bill_to VARCHAR(500),
        ship_to VARCHAR(500),
        project_id INT,
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        invoice_date DATE,
        open_till DATE,
        payment_method VARCHAR(100),
        status ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Partially Paid', 'Unpaid') DEFAULT 'Draft',
        description LONGTEXT,
        subtotal DECIMAL(15, 2) DEFAULT 0,
        discount_percentage DECIMAL(5, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        extra_discount_percentage DECIMAL(5, 2) DEFAULT 0,
        extra_discount_amount DECIMAL(15, 2) DEFAULT 0,
        tax_percentage DECIMAL(5, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        total DECIMAL(15, 2) NOT NULL,
        notes LONGTEXT,
        terms_conditions LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_invoice_number (invoice_number),
        INDEX idx_status (status),
        INDEX idx_client_id (client_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (client_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES companies(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ invoices table created');

    console.log('Creating invoice_items table...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2),
        price DECIMAL(15, 2),
        discount_percentage DECIMAL(5, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        amount DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_invoice_id (invoice_id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ invoice_items table created');

    console.log('✓ All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    pool.end();
  }
}

createTables();
