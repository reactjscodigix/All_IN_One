const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function addAvatarColumn() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Checking if avatar column exists...');
    const [rows] = await conn.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='contacts' AND COLUMN_NAME='avatar'
    `);
    
    if (rows.length === 0) {
      console.log('Adding avatar column to contacts table...');
      await conn.query(`
        ALTER TABLE contacts ADD COLUMN avatar LONGTEXT
      `);
      console.log('✓ Avatar column added successfully');
    } else {
      console.log('✓ Avatar column already exists');
    }
    
    console.log('\nAdding notes table if not exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contact_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact_id INT NOT NULL,
        note_text TEXT NOT NULL,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        INDEX idx_contact_id (contact_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Contact notes table created/verified');
    
    console.log('\nAdding activities table if not exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contact_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact_id INT NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        activity_text TEXT,
        activity_icon VARCHAR(10),
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        INDEX idx_contact_id (contact_id),
        INDEX idx_created_at (created_at),
        INDEX idx_activity_type (activity_type)
      )
    `);
    console.log('✓ Contact activities table created/verified');
    
    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

addAvatarColumn();
