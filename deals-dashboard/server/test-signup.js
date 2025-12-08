const http = require('http');

async function testSignup(userData) {
  return new Promise((resolve) => {
    const data = JSON.stringify(userData);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/signup',
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
  console.log('Testing signup endpoint...\n');
  
  const newUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'testuser@example.com',
    password: 'test1234',
    role_name: 'Lead',
    phone: '555-1234',
    company: 'Test Company'
  };
  
  const result = await testSignup(newUser);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 201) {
    console.log('\n✓ Signup successful');
  } else {
    console.log('\n✗ Signup failed');
  }
  
  process.exit(0);
})();
