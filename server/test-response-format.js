const http = require('http');

function test(endpoint) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000/api${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`${endpoint}: ${Array.isArray(parsed) ? '✓ Array' : '✗ Object'}`);
        } catch (e) {
          console.log(`${endpoint}: ERROR`);
        }
        resolve();
      });
    });
  });
}

(async () => {
  await test('/invoices');
  await test('/campaigns');
  await test('/call-history');
})();
