const http = require('http');

const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/messages/7',
  method: 'GET'
};

const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const data = JSON.parse(body);
      console.log('Messages count:', Array.isArray(data) ? data.length : 1);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First message:', JSON.stringify(data[0], null, 2).substring(0, 300));
      }
    } catch (e) {
      console.log('Response:', body.substring(0, 300));
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log('Error:', e.message);
  process.exit(1);
});

req.end();
