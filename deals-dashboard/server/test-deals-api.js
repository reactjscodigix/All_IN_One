const http = require('http');

function testAPI() {
  http.get('http://localhost:5000/api/deals', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`✅ Deals API Status: ${res.statusCode}`);
        console.log(`Returned ${json.length || 'unknown'} records`);
        if (Array.isArray(json) && json.length > 0) {
          console.log('First deal sample:', JSON.stringify(json[0], null, 2).substring(0, 800));
        } else if (json.error) {
          console.error('API Error:', json.error);
        }
      } catch (e) {
        console.error('❌ Failed to parse response:', e.message);
        console.log('Response:', data.substring(0, 300));
      }
    });
  }).on('error', (err) => {
    console.error('❌ API call failed:', err.message);
  });
}

testAPI();
setTimeout(() => process.exit(0), 5000);
