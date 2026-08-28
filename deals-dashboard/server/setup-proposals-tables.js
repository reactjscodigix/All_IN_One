const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

async function setupProposalsTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'deals_db',
    });

    console.log('✓ Connected to database');

    const queries = [
      {
        sql: `CREATE TABLE IF NOT EXISTS proposals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          proposal_number VARCHAR(50) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          description LONGTEXT,
          client_id INT NOT NULL,
          contact_id INT,
          deal_id INT,
          created_by INT,
          status ENUM('Draft', 'Submitted', 'Approved', 'Rejected', 'Sent', 'Accepted', 'Declined') DEFAULT 'Draft',
          proposal_date DATE,
          validity_date DATE,
          total_amount DECIMAL(15, 2),
          discount_amount DECIMAL(15, 2) DEFAULT 0,
          tax_amount DECIMAL(15, 2) DEFAULT 0,
          currency VARCHAR(10) DEFAULT 'USD',
          terms_conditions LONGTEXT,
          notes LONGTEXT,
          version INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_proposal_number (proposal_number),
          INDEX idx_client_id (client_id),
          INDEX idx_deal_id (deal_id),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at),
          FOREIGN KEY (client_id) REFERENCES companies(id) ON DELETE CASCADE,
          FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
          FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )`,
        desc: 'Create proposals table'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS proposal_line_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          proposal_id INT NOT NULL,
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
          INDEX idx_proposal_id (proposal_id),
          FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
        )`,
        desc: 'Create proposal_line_items table'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS proposal_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          proposal_id INT NOT NULL,
          action VARCHAR(100) NOT NULL,
          action_by INT,
          old_status VARCHAR(50),
          new_status VARCHAR(50),
          comments LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_proposal_id (proposal_id),
          INDEX idx_created_at (created_at),
          FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
          FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE SET NULL
        )`,
        desc: 'Create proposal_history table'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS proposal_attachments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          proposal_id INT NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(100),
          file_size INT,
          file_data LONGBLOB,
          uploaded_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_proposal_id (proposal_id),
          FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )`,
        desc: 'Create proposal_attachments table'
      }
    ];

    for (const query of queries) {
      try {
        await connection.query(query.sql);
        console.log(`✓ ${query.desc}`);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠ ${query.desc} - Already exists`);
        } else {
          console.log(`✗ ${query.desc} - Error: ${err.message}`);
        }
      }
    }

    console.log('\n✓ Proposal tables setup completed successfully');
    await connection.end();
  } catch (error) {
    console.error('✗ Error setting up tables:', error.message);
    process.exit(1);
  }
}

setupProposalsTables();
