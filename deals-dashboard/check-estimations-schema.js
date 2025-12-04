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

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [tables] = await conn.query("SHOW TABLES");
    console.log('Tables in database:');
    tables.forEach(t => console.log('-', Object.values(t)[0]));
    
    // Check if estimations table exists
    const estimationsExists = tables.some(t => Object.values(t)[0] === 'estimations');
    if (estimationsExists) {
      console.log('\nEstimations table schema:');
      const [schema] = await conn.query("DESCRIBE estimations");
      schema.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
      
      console.log('\nChecking constraints:');
      const [constraints] = await conn.query(`
        SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = 'estimations' AND TABLE_SCHEMA = 'deals_db'
      `);
      constraints.forEach(c => {
        console.log(`- ${c.CONSTRAINT_NAME}: ${c.COLUMN_NAME}${c.REFERENCED_TABLE_NAME ? ` -> ${c.REFERENCED_TABLE_NAME}.${c.REFERENCED_COLUMN_NAME}` : ''}`);
      });
    } else {
      console.log('\nEstimations table does not exist!');
    }
    
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
