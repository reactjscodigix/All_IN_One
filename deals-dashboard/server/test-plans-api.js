const http = require('http');

const tests = [
  {
    name: 'GET /api/plans (list all)',
    path: '/api/plans?search=&status=&planType=&sortBy=created_at&order=DESC&page=1&limit=10',
    method: 'GET'
  },
  {
    name: 'GET /api/plans?search=Basic',
    path: '/api/plans?search=Basic',
    method: 'GET'
  },
  {
    name: 'GET /api/plans/:id (get single plan)',
    path: '/api/plans/1',
    method: 'GET'
  }
];

function testAPI(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`\n✅ ${test.name}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response:`, JSON.stringify(jsonData, null, 2).substring(0, 300) + '...');
        } catch (e) {
          console.log(`\n❌ ${test.name}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Error: Invalid JSON response`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n❌ ${test.name}`);
      console.log(`   Error: ${e.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing Plans API Endpoints...\n');
  console.log('='.repeat(60));
  
  for (const test of tests) {
    await testAPI(test);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  process.exit(0);
}

runTests();
