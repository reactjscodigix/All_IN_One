const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, 'server', envFile) });

async function setupPipelineTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'deals_db',
    });

    console.log('Connected to database');

    const queries = [
      `ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Inactive') DEFAULT 'Active'`,
      `ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS created_by INT`,
      `CREATE TABLE IF NOT EXISTS pipeline_stages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pipeline_id INT NOT NULL,
        stage_name VARCHAR(255) NOT NULL,
        stage_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE CASCADE,
        INDEX idx_pipeline_id (pipeline_id),
        UNIQUE KEY unique_pipeline_stage (pipeline_id, stage_name)
      )`,
      `CREATE TABLE IF NOT EXISTS pipeline_access (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pipeline_id INT NOT NULL,
        access_type ENUM('All', 'Selected') DEFAULT 'All',
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE CASCADE,
        INDEX idx_pipeline_id (pipeline_id),
        INDEX idx_user_id (user_id)
      )`
    ];

    for (const query of queries) {
      try {
        await connection.query(query);
        console.log('✓ Query executed successfully');
      } catch (err) {
        console.log('Query result:', err.message);
      }
    }

    console.log('✓ Pipeline tables setup completed successfully');
    await connection.end();
  } catch (error) {
    console.error('✗ Error setting up tables:', error.message);
    process.exit(1);
  }
}

setupPipelineTables();
