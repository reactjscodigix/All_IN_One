const http = require('http');

const data = JSON.stringify({
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane@example.com',
  phone: '555-1234',
  company_id: 1,
  position: 'Manager'
});

const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/contacts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
    process.exit(res.statusCode === 201 ? 0 : 1);
  });
});

req.on('error', (e) => {
  console.log('Error:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
