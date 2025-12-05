const http = require('http');

http.get('http://localhost:5000/api/deals', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const deals = JSON.parse(data);
    console.log('Status: OK');
    console.log('Deals count:', deals.length);
    if (deals.length > 0) {
      console.log('First deal:', JSON.stringify(deals[0], null, 2));
    }
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
