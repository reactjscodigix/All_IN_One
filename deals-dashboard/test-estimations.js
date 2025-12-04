const http = require('http');

http.get('http://localhost:5000/api/estimations', (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
