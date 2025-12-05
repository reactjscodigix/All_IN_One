const https = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/deals',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:3001',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`✅ API Response: ${json.length} deals received`);
      if (json.length > 0) {
        console.log('First deal:', JSON.stringify(json[0], null, 2).substring(0, 400));
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Response:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
setTimeout(() => process.exit(0), 3000);
