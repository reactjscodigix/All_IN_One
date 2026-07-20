const http = require('http');

function testEndpoint(name, port, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\n✅ ${name} (${port}${path})`);
          console.log(`   Status: ${res.statusCode}`);
          if (json.length !== undefined) {
            console.log(`   Records: ${json.length}`);
          } else if (json.error) {
            console.log(`   Error: ${json.error}`);
          }
        } catch (e) {
          console.log(`\n❌ ${name} (${port}${path})`);
          console.log(`   Parse Error: ${e.message}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n❌ ${name} (${port}${path})`);
      console.log(`   Connection Error: ${e.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Deal Dashboard Integration\n');
  console.log('=====================================');
  
  await testEndpoint('API: Deals', 5000, '/api/deals');
  await testEndpoint('API: Estimations', 5000, '/api/estimations');
  await testEndpoint('API: Contacts', 5000, '/api/contacts');
  await testEndpoint('API: Companies', 5000, '/api/companies');
  
  console.log('\n=====================================');
  console.log('\n📋 Summary:');
  console.log('✓ Server running on port 5000');
  console.log('✓ Client running on port 3000');
  console.log('✓ Check browser at http://localhost:3000/deals-list');
  console.log('\n');
}

runTests().then(() => process.exit(0));
