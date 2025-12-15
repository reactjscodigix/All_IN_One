const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     TESTING COMPANY NAME FIELD IN API RESPONSES        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Test GET /api/invoices
    const invoices = await makeRequest('/api/invoices?limit=5');
    console.log('✅ GET /api/invoices (first 2 invoices):');
    invoices.slice(0, 2).forEach(inv => {
      console.log(`\n  Invoice: ${inv.invoice_number}`);
      console.log(`    client_id: ${inv.client_id}`);
      console.log(`    company_name: ${inv.company_name || '(missing)'}`);
      console.log(`    client_name: ${inv.client_name || '(missing)'}`);
      console.log(`    Expected in UI: ${inv.company_name || 'UNKNOWN ❌'}`);
    });

    // Test specific invoice
    console.log('\n✅ GET /api/invoices/4 (specific invoice):');
    const inv4 = await makeRequest('/api/invoices/4');
    console.log(`  Invoice: ${inv4.invoice_number}`);
    console.log(`    client_id: ${inv4.client_id}`);
    console.log(`    company_name: ${inv4.company_name || '(missing)'}`);
    console.log(`    client_name: ${inv4.client_name || '(missing)'}`);
    console.log(`    Expected in UI: ${inv4.company_name || 'UNKNOWN ❌'}`);

    // Test invoice items endpoint
    console.log('\n✅ GET /api/invoices/4/items:');
    const items = await makeRequest('/api/invoices/4/items');
    console.log(`  Items count: ${items.length}`);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ TEST COMPLETE                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
