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
    
    const estimationsExists = tables.some(t => Object.values(t)[0] === 'estimations');
    if (estimationsExists) {
      console.log('\nEstimations table schema:');
      const [schema] = await conn.query("DESCRIBE estimations");
      schema.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    }
    
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
