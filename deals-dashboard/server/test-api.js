const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/deals',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const deals = JSON.parse(data);
      console.log('✅ API Response Successful!');
      console.log(`Total deals: ${deals.length}`);
      console.log('\nFirst 3 deals:');
      deals.slice(0, 3).forEach((deal, idx) => {
        console.log(`  ${idx + 1}. ${deal.deal_name} - $${Number(deal.deal_value).toLocaleString()} (${deal.status})`);
      });
      process.exit(0);
    } catch (err) {
      console.error('Failed to parse response:', err.message);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ API Error:', err.message);
  process.exit(1);
});

req.end();
