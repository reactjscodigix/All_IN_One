const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testInsert() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Testing direct SQL insert with stage...\n');
    
    const [result] = await connection.query(`
      INSERT INTO deals (
        deal_name, stage, pipeline, status, deal_value, currency, period, period_value,
        contact_id, project_id, due_date, expected_close_date, assignee_id,
        follow_up_date, source, tags, priority, description, company_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Direct SQL Test',
      'Schedule Conversation',
      null,
      'Pending',
      25000,
      'USD',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      '',
      'High',
      'Test description',
      null
    ]);
    
    console.log(`✓ Inserted deal with ID: ${result.insertId}`);
    
    const [rows] = await connection.query('SELECT id, deal_name, stage FROM deals WHERE id = ?', [result.insertId]);
    
    console.log(`\nResult from database:`);
    console.log(`  ID: ${rows[0].id}`);
    console.log(`  Name: ${rows[0].deal_name}`);
    console.log(`  Stage: "${rows[0].stage}"`);
    
    if (rows[0].stage === 'Schedule Conversation') {
      console.log('\n✅ Stage is being saved correctly!');
    } else {
      console.log('\n❌ Stage is NOT being saved!');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.release();
    await pool.end();
  }
}

testInsert();
