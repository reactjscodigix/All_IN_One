const pool = require('./config/database');

async function checkSchema() {
  try {
    const tables = ['seo_management', 'gmb_management'];
    for (const table of tables) {
      try {
        const [rows] = await pool.query(`DESCRIBE ${table}`);
        console.log(`--- ${table} ---`);
        console.log(rows.map(r => r.Field));
      } catch(e) {
         console.log(`Table ${table} not found or error.`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkSchema();
