const pool = require('./config/database');

async function checkPlansTable() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [result] = await connection.query('DESCRIBE plans');
    console.log('✅ Plans table exists with columns:');
    result.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });
    
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error checking plans table:', err.message);
    if (connection) connection.release();
    process.exit(1);
  }
}

checkPlansTable();
