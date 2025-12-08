const http = require('http');

const testCases = [
  { email: 'admin@example.com', password: 'admin123', expectedStatus: 200 },
  { email: 'john@example.com', password: 'pass123', expectedStatus: 200 },
  { email: 'wrong@example.com', password: 'wrong', expectedStatus: 401 },
];

async function testLogin(email, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, error: 'Invalid JSON response', raw: responseData });
        }
      });
    });
    
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('Testing login endpoint...\n');
  for (const test of testCases) {
    const result = await testLogin(test.email, test.password);
    const pass = result.status === test.expectedStatus ? '✓' : '✗';
    console.log(`${pass} ${test.email} (expected ${test.expectedStatus}, got ${result.status})`);
    if (result.data) {
      if (result.data.success) {
        console.log(`  → Logged in as: ${result.data.first_name} ${result.data.email} [${result.data.role_name}]`);
      } else {
        console.log(`  → Error: ${result.data.error}`);
      }
    }
  }
  console.log('\n✓ Login test complete');
  process.exit(0);
})();
