const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/campaigns',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response:', data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error(`Problem: ${e.message}`);
});

req.end();
