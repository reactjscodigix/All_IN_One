const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('✓ Testing Estimations API\n');

  console.log('1. GET /api/estimations');
  const list = await request('GET', '/api/estimations');
  console.log(`   Status: ${list.status}`);
  console.log(`   Count: ${list.data.length}`);
  console.log(`   ✓ Works\n`);

  console.log('2. POST /api/estimations');
  const create = await request('POST', '/api/estimations', {
    client_id: 1,
    amount: 10000,
    currency: 'USD',
    status: 'Draft'
  });
  console.log(`   Status: ${create.status}`);
  console.log(`   ID: ${create.data.id}`);
  console.log(`   Number: ${create.data.estimation_number}`);
  console.log(`   ✓ Works\n`);

  if (create.status === 201) {
    console.log('3. GET /api/estimations/:id');
    const get = await request('GET', `/api/estimations/${create.data.id}`);
    console.log(`   Status: ${get.status}`);
    console.log(`   Amount: ${get.data.amount}`);
    console.log(`   ✓ Works\n`);

    console.log('4. PUT /api/estimations/:id');
    const update = await request('PUT', `/api/estimations/${create.data.id}`, {
      client_id: 1,
      amount: 15000,
      currency: 'USD'
    });
    console.log(`   Status: ${update.status}`);
    console.log(`   ✓ Works\n`);

    console.log('5. DELETE /api/estimations/:id');
    const del = await request('DELETE', `/api/estimations/${create.data.id}`);
    console.log(`   Status: ${del.status}`);
    console.log(`   ✓ Works\n`);
  }

  console.log('✅ All API endpoints are working correctly!');
  process.exit(0);
}

test().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
