const http = require('http');

const userURL = '/api/plans?search=&status=&planType=&sortBy=created_at&order=DESC&page=1&limit=10';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: userURL,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('\n' + '='.repeat(70));
    console.log(`✅ User's URL Test: GET ${userURL}`);
    console.log('='.repeat(70));
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
    
    if (res.statusCode === 200) {
      try {
        const jsonData = JSON.parse(data);
        console.log(`\n✅ Response is valid JSON`);
        console.log(`Total Plans: ${jsonData.data?.length || 0}`);
        console.log(`Pagination:`, jsonData.pagination || 'N/A');
        console.log(`\nFirst Plan:`);
        if (jsonData.data && jsonData.data[0]) {
          console.log(JSON.stringify(jsonData.data[0], null, 2));
        }
      } catch (e) {
        console.log(`\n❌ Error parsing response:`, e.message);
        console.log(`Response body:`, data.substring(0, 500));
      }
    } else {
      console.log(`\n❌ Unexpected status code!`);
      console.log(`Response:`, data);
    }
    
    console.log('\n' + '='.repeat(70));
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log(`\n❌ Request failed: ${e.message}`);
  process.exit(1);
});

req.end();
