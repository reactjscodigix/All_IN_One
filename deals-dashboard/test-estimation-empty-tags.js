const http = require('http');

const testCreation = () => {
  const tagsString = [].length > 0 ? [].join(',') : null;
  const data = JSON.stringify({
    client_id: 1,
    project_id: null,
    bill_to: 'Test Bill Address',
    ship_to: 'Test Ship Address',
    amount: 2000,
    currency: 'USD',
    estimate_date: '2025-12-04',
    expiry_date: '2025-12-31',
    status: 'Draft',
    tags: tagsString,
    description: null,
    estimate_by: 1
  });

  console.log('Sending data with tags:', tagsString);

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
      console.log('Response:');
      try {
        console.log(JSON.stringify(JSON.parse(responseData), null, 2));
      } catch {
        console.log(responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e);
  });

  req.write(data);
  req.end();
};

testCreation();
