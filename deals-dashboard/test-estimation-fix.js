const http = require('http');

const testCreation = () => {
  const data = JSON.stringify({
    client_id: 1,
    project_id: 1,
    bill_to: 'Test Bill Address',
    ship_to: 'Test Ship Address',
    amount: 1500,
    currency: 'USD',
    estimate_date: '2025-12-04',
    expiry_date: '2025-12-31',
    status: 'Draft',
    tags: ['test'],
    description: 'Test estimation',
    estimate_by: null
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/estimations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response:', responseData);
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e);
  });

  req.write(data);
  req.end();
};

testCreation();
