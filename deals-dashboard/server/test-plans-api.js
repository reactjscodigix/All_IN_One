const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testPlansAPI() {
  console.log('\n=== Testing /api/plans Endpoints ===\n');

  try {
    console.log('1. GET /api/plans (No filters)');
    const getResponse = await makeRequest('GET', '/api/plans');
    console.log('Status:', getResponse.statusCode);
    console.log('Response:', JSON.stringify(getResponse.body, null, 2));

    console.log('\n2. GET /api/plans with pagination');
    const paginatedResponse = await makeRequest('GET', '/api/plans?page=1&limit=5');
    console.log('Status:', paginatedResponse.statusCode);
    console.log('Response:', JSON.stringify(paginatedResponse.body, null, 2));

    console.log('\n3. POST /api/plans (Create new plan)');
    const createResponse = await makeRequest('POST', '/api/plans', {
      plan_name: 'Premium Plan',
      plan_type: 'Yearly',
      price: 299.99,
      currency: 'USD',
      description: 'Premium annual subscription',
      status: 'Active'
    });
    console.log('Status:', createResponse.statusCode);
    console.log('Response:', JSON.stringify(createResponse.body, null, 2));

    if (createResponse.body.data?.id) {
      const planId = createResponse.body.data.id;
      console.log(`\n4. GET /api/plans/${planId} (Get specific plan)`);
      const getByIdResponse = await makeRequest('GET', `/api/plans/${planId}`);
      console.log('Status:', getByIdResponse.statusCode);
      console.log('Response:', JSON.stringify(getByIdResponse.body, null, 2));

      console.log(`\n5. PUT /api/plans/${planId} (Update plan)`);
      const updateResponse = await makeRequest('PUT', `/api/plans/${planId}`, {
        price: 399.99,
        status: 'Inactive'
      });
      console.log('Status:', updateResponse.statusCode);
      console.log('Response:', JSON.stringify(updateResponse.body, null, 2));

      console.log(`\n6. DELETE /api/plans/${planId} (Delete plan)`);
      const deleteResponse = await makeRequest('DELETE', `/api/plans/${planId}`);
      console.log('Status:', deleteResponse.statusCode);
      console.log('Response:', JSON.stringify(deleteResponse.body, null, 2));
    }

    console.log('\n✓ Tests completed successfully!\n');
  } catch (error) {
    console.error('Error during testing:', error.message);
  }

  process.exit(0);
}

testPlansAPI();
