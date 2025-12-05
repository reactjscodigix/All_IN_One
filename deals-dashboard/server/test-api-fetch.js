const http = require('http');

function testAPI() {
  http.get('http://localhost:5000/api/estimations', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`✅ API working! Returned ${json.length || 'unknown'} records`);
        if (Array.isArray(json) && json.length > 0) {
          console.log('First record sample:', JSON.stringify(json[0], null, 2).substring(0, 500) + '...');
        }
      } catch (e) {
        console.error('❌ Failed to parse response:', e.message);
        console.log('Response:', data.substring(0, 200));
      }
    });
  }).on('error', (err) => {
    console.error('❌ API call failed:', err.message);
  });
}

testAPI();
setTimeout(() => process.exit(0), 5000);
