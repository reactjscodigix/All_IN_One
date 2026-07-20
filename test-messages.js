const http = require('http');

const data = JSON.stringify({
  sender_id: 7,
  receiver_id: 8,
  message_text: 'Test message from user 7 to user 8'
});

const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/messages',
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
