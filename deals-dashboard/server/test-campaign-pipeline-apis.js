const http = require('http');

const tests = [
  {
    name: '✅ GET /api/campaigns',
    path: '/api/campaigns',
    method: 'GET',
    expectedFields: ['id', 'name', 'status', 'budget', 'start_date', 'end_date']
  },
  {
    name: '✅ GET /api/pipeline',
    path: '/api/pipeline',
    method: 'GET',
    expectedFields: ['id', 'name', 'description', 'status']
  },
  {
    name: '✅ GET /api/leads',
    path: '/api/leads',
    method: 'GET',
    expectedFields: ['id', 'lead_name', 'email', 'lead_source']
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
          const items = Array.isArray(jsonData) ? jsonData : jsonData.data || jsonData.campaigns || jsonData.leads || jsonData.pipelines || [];
          
          console.log(`\n${test.name}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Items: ${items.length}`);
          
          if (items.length > 0) {
            const firstItem = items[0];
            console.log(`   First Item: ${JSON.stringify(firstItem).substring(0, 100)}...`);
            
            const missingFields = test.expectedFields.filter(field => !(field in firstItem));
            if (missingFields.length > 0) {
              console.log(`   ⚠️ Missing fields: ${missingFields.join(', ')}`);
            } else {
              console.log(`   ✅ All expected fields present`);
            }
          }
        } catch (e) {
          console.log(`\n❌ ${test.name}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Error: ${e.message}`);
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
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTING CAMPAIGN & PIPELINE API ENDPOINTS');
  console.log('='.repeat(70));
  
  for (const test of tests) {
    await testAPI(test);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ All API tests completed!');
  console.log('='.repeat(70) + '\n');
  process.exit(0);
}

runTests();
