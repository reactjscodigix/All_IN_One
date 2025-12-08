const http = require('http');

async function testAPI(path, method = 'GET') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, error: 'Invalid JSON response', raw: data });
        }
      });
    });
    
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

(async () => {
  console.log('Testing /api/companies...\n');
  
  const result = await testAPI('/api/companies');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('\n✓ Companies endpoint working');
  } else {
    console.log('\n✗ Companies endpoint failed');
  }
  
  process.exit(0);
})();
