const mysql = require('mysql2/promise');

async function check() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'deals_db',
  });

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'deals_db' AND TABLE_NAME = 'companies'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('All columns in companies table:');
    rows.forEach(r => {
      console.log(`  ${r.COLUMN_NAME}: ${r.COLUMN_TYPE} (NULL: ${r.IS_NULLABLE})`);
    });
    
    connection.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await pool.end();
}

check();
