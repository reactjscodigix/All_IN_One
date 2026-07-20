const pool = require('./config/database');

async function checkCampaigns() {
  try {
    const [rows] = await pool.query('DESCRIBE campaigns');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkCampaigns();
