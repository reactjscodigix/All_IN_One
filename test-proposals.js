const http = require('http');

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000';
  
  const test = (method, path, data, userId = 1, userRole = 'Admin') => {
    return new Promise((resolve, reject) => {
      const url = new URL(baseUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
          'x-user-role': userRole
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });

      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  };

  console.log('Testing Proposal Endpoints with Authentication...\n');

  console.log('📋 PROPOSAL ACTION WORKFLOW TEST\n');

  // Test 1: Update Status to Approved
  console.log('1️⃣  Testing POST /api/proposals/3/status (set to Approved)');
  try {
    const result = await test('POST', '/api/proposals/3/status', { status: 'Approved' }, 1, 'Admin');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log();
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 2: Send Proposal
  console.log('2️⃣  Testing POST /api/proposals/3/send (Send to client)');
  try {
    const result = await test('POST', '/api/proposals/3/send', { action_by: 1, client_email: 'client@example.com' }, 1, 'Admin');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log();
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 3: Convert to Invoice (with Admin role)
  console.log('3️⃣  Testing POST /api/proposals/3/convert-to-invoice (Admin user)');
  try {
    const result = await test('POST', '/api/proposals/3/convert-to-invoice', {}, 1, 'Admin');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log();
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 4: Convert to Contract (with Company Owner role)
  console.log('4️⃣  Testing POST /api/proposals/4/convert-to-contract (Company Owner role)');
  try {
    const result = await test('POST', '/api/proposals/4/convert-to-contract', {}, 1, 'Company Owner');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log();
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 5: Test forbidden role (Client cannot convert)
  console.log('5️⃣  Testing POST /api/proposals/5/convert-to-contract (Client role - should fail with 403)');
  try {
    const result = await test('POST', '/api/proposals/5/convert-to-contract', {}, 1, 'Client');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log();
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 6: Test missing auth headers
  console.log('6️⃣  Testing POST /api/proposals/6/convert-to-invoice (No auth headers - should fail with 401)');
  try {
    const result = await new Promise((resolve, reject) => {
      const url = new URL(baseUrl + '/api/proposals/6/convert-to-invoice');
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify({}));
      req.end();
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log();
  } catch (err) {
    console.error('   Error:', err.message);
  }

  console.log('✅ All tests completed!');
};

testEndpoints();
