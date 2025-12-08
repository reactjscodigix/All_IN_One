const http = require('http');

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
  const result = await testLogin('admin@example.com', 'admin123');
  console.log('Response:', JSON.stringify(result, null, 2));
  process.exit(0);
})();
