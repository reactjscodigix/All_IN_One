const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

async function setupProjectWorkflowTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'deals_db',
    });

    console.log('✓ Connected to database');

    const alterProjectsTable = `
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS deal_id INT,
      ADD COLUMN IF NOT EXISTS created_by INT,
      ADD COLUMN IF NOT EXISTS assigned_to INT,
      ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Public',
      ADD FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
      ADD INDEX idx_deal_id (deal_id),
      ADD INDEX idx_visibility (visibility)
    `;

    await connection.query(alterProjectsTable);
    console.log('✓ Projects table updated');

    const createProjectTasksTable = `
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        status ENUM('Todo', 'In Progress', 'In Review', 'Completed', 'On Hold') DEFAULT 'Todo',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        assigned_to INT,
        assigned_by INT,
        due_date DATE,
        start_date DATE,
        estimated_hours DECIMAL(10, 2),
        actual_hours DECIMAL(10, 2),
        progress INT DEFAULT 0,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_project_id (project_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_due_date (due_date)
      )
    `;

    await connection.query(createProjectTasksTable);
    console.log('✓ Project tasks table created');

    const createProjectFilesTable = `
      CREATE TABLE IF NOT EXISTS project_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        task_id INT,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT,
        file_type VARCHAR(50),
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_project_id (project_id),
        INDEX idx_task_id (task_id)
      )
    `;

    await connection.query(createProjectFilesTable);
    console.log('✓ Project files table created');

    const createProjectCommentsTable = `
      CREATE TABLE IF NOT EXISTS project_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        task_id INT,
        user_id INT NOT NULL,
        comment_text LONGTEXT NOT NULL,
        file_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (file_id) REFERENCES project_files(id) ON DELETE SET NULL,
        INDEX idx_project_id (project_id),
        INDEX idx_task_id (task_id),
        INDEX idx_user_id (user_id)
      )
    `;

    await connection.query(createProjectCommentsTable);
    console.log('✓ Project comments table created');

    const createProjectActivityTable = `
      CREATE TABLE IF NOT EXISTS project_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        description TEXT,
        user_id INT NOT NULL,
        old_value LONGTEXT,
        new_value LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_project_id (project_id),
        INDEX idx_activity_type (activity_type),
        INDEX idx_created_at (created_at)
      )
    `;

    await connection.query(createProjectActivityTable);
    console.log('✓ Project activity table created');

    const createProjectTeamTable = `
      CREATE TABLE IF NOT EXISTS project_team (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100) DEFAULT 'Member',
        added_by INT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_project_user (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_project_id (project_id),
        INDEX idx_user_id (user_id)
      )
    `;

    await connection.query(createProjectTeamTable);
    console.log('✓ Project team table created');

    await connection.end();
    console.log('✓ All project workflow tables set up successfully!');
  } catch (error) {
    console.error('Error setting up project workflow tables:', error.message);
    process.exit(1);
  }
}

setupProjectWorkflowTables();
