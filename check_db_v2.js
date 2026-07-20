const pool = require('./server/config/database');

async function checkColumns() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [columns] = await connection.query('SHOW COLUMNS FROM estimations');
    console.log('Columns in estimations table:');
    const columnMap = {};
    columns.forEach(c => {
        columnMap[c.Field] = true;
        console.log(`- ${c.Field}`);
    });
    
    if (!columnMap['discount_amount']) {
        console.log('!!! MISSING discount_amount !!!');
    } else {
        console.log('✓ discount_amount exists');
    }
  } catch (err) {
    console.error('Error checking columns:', err.message);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

checkColumns();
