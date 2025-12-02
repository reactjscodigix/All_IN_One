const mysql = require('mysql2/promise');

async function addColumn() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    
    try {
      await connection.query('ALTER TABLE companies ADD COLUMN email_opt_out BOOLEAN DEFAULT FALSE');
      console.log('✓ Added email_opt_out column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ email_opt_out column already exists');
      } else {
        throw err;
      }
    }
    
    const [rows] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'deals_db' AND TABLE_NAME = 'companies'
      AND COLUMN_NAME = 'email_opt_out'
    `);
    
    if (rows.length > 0) {
      console.log('✓ Verified email_opt_out column exists');
    }
    
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

addColumn();
