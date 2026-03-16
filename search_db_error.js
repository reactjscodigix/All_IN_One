
const pool = require('./deals-dashboard/server/config/database');

async function searchErrorInDB() {
    try {
        console.log('Searching for error message in followups table...');
        const [rows] = await pool.query("SELECT id, description, remarks FROM followups WHERE description LIKE '%Failed to fetch deals%' OR remarks LIKE '%Failed to fetch deals%'");
        
        if (rows.length > 0) {
            console.log(`✓ Found ${rows.length} records with error message!`);
            rows.forEach(r => {
                console.log(`ID: ${r.id}`);
                console.log(`Description: ${r.description?.substring(0, 100)}...`);
                console.log('---');
            });
        } else {
            console.log('No records found with that error message.');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Search failed:', err.message);
        process.exit(1);
    }
}

searchErrorInDB();
