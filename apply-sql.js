const pool = require('./deals-dashboard/server/config/database');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'deals-dashboard', 'UPDATE_LEAD_BUSINESS_FIELDS.sql'), 'utf8');
    const queries = sql.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      console.log('Running:', query.trim());
      try {
        await pool.query(query);
        console.log('Success');
      } catch (e) {
        if (e.code === 'ER_DUP_COLUMN_NAME') {
          console.log('Column already exists, skipping.');
        } else {
          throw e;
        }
      }
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
run();
