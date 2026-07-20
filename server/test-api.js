const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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
    console.log('║         TESTING INVOICE ITEMS API ENDPOINTS            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Test 1: Get invoice 15 items
    console.log('TEST 1: GET /api/invoices/15/items');
    const items15 = await makeRequest('/api/invoices/15/items');
    console.log(`Status: ${items15.status}`);
    console.log(`Items found: ${items15.data.length}`);
    if (items15.data.length > 0) {
      items15.data.forEach(item => {
        console.log(`  ✓ ${item.item_name} (Qty: ${item.quantity}, Price: $${item.price})`);
      });
    }

    // Test 2: Get invoice 15 details
    console.log('\nTEST 2: GET /api/invoices/15');
    const inv15 = await makeRequest('/api/invoices/15');
    console.log(`Status: ${inv15.status}`);
    console.log(`Invoice Number: ${inv15.data.invoice_number}`);
    console.log(`Company Name: ${inv15.data.company_name}`);
    console.log(`Amount: $${inv15.data.amount}`);
    console.log(`Client ID: ${inv15.data.client_id}`);

    // Test 3: Get invoice 4 items
    console.log('\nTEST 3: GET /api/invoices/4/items');
    const items4 = await makeRequest('/api/invoices/4/items');
    console.log(`Status: ${items4.status}`);
    console.log(`Items found: ${items4.data.length}`);
    if (items4.data.length > 0) {
      items4.data.forEach(item => {
        console.log(`  ✓ ${item.item_name} (Qty: ${item.quantity}, Price: $${item.price})`);
      });
    }

    // Test 4: Get invoice metrics
    console.log('\nTEST 4: GET /api/invoices/metrics/summary');
    const metrics = await makeRequest('/api/invoices/metrics/summary');
    console.log(`Status: ${metrics.status}`);
    if (metrics.data.summary) {
      console.log(`Total Invoices: ${metrics.data.summary.total_invoices}`);
      console.log(`Total Amount: $${metrics.data.summary.total_amount}`);
      console.log(`Average Amount: $${metrics.data.summary.avg_amount}`);
    }

    // Test 5: Get company invoices
    console.log('\nTEST 5: GET /api/companies/15/invoices');
    const compInvoices = await makeRequest('/api/companies/15/invoices');
    console.log(`Status: ${compInvoices.status}`);
    console.log(`Invoices found: ${compInvoices.data.length}`);
    if (compInvoices.data.length > 0) {
      compInvoices.data.forEach(inv => {
        console.log(`  ✓ ${inv.invoice_number} ($${inv.amount}) - ${inv.client_name}`);
      });
    }

    // Test 6: Get non-existent invoice
    console.log('\nTEST 6: GET /api/invoices/999 (non-existent)');
    const inv999 = await makeRequest('/api/invoices/999');
    console.log(`Status: ${inv999.status} (${inv999.status === 404 ? 'OK - 404 as expected' : 'ERROR'})`);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              ✅ ALL TESTS COMPLETED                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
