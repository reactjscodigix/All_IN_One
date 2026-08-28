const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

async function setupCampaignTables() {
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
        sql: `CREATE TABLE IF NOT EXISTS campaigns (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          campaign_type VARCHAR(100),
          deal_value DECIMAL(15, 2),
          currency VARCHAR(10) DEFAULT 'USD',
          period VARCHAR(50),
          period_value VARCHAR(100),
          target_audience VARCHAR(500),
          description TEXT,
          attachment_data LONGBLOB,
          attachment_name VARCHAR(255),
          attachment_size INT,
          status ENUM('Draft', 'Running', 'Paused', 'Completed', 'Archived') DEFAULT 'Draft',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        )`,
        desc: 'Create campaigns table'
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

    console.log('\n✓ Campaign tables setup completed successfully');
    await connection.end();
  } catch (error) {
    console.error('✗ Error setting up tables:', error.message);
    process.exit(1);
  }
}

setupCampaignTables();
