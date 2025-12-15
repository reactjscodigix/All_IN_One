const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${path}: ${res.statusCode}`);
        resolve();
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    await makeRequest('/api/invoices');
    await makeRequest('/api/campaigns');
    await makeRequest('/api/call-history');
    console.log('\nAll endpoints responding ✓');
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
