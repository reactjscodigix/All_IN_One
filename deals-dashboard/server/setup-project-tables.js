const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

async function setupProjectTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'deals_db',
    });

    console.log('✓ Connected to database');

    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        project_id VARCHAR(50) UNIQUE NOT NULL,
        project_type VARCHAR(100),
        client VARCHAR(255),
        category VARCHAR(100),
        project_timing VARCHAR(100),
        price DECIMAL(15, 2),
        responsible_persons LONGTEXT,
        team_leader VARCHAR(255),
        start_date DATE,
        due_date DATE,
        priority VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Planning',
        description LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_created_at (created_at)
      )
    `;

    await connection.query(createProjectsTable);
    console.log('✓ Projects table created successfully');

    await connection.end();
  } catch (error) {
    console.error('Error setting up project tables:', error.message);
    process.exit(1);
  }
}

setupProjectTables();
