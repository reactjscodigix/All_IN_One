const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/files?userId=1',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem: ${e.message}`);
});

req.end();
