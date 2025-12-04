const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
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
  console.log('Testing GET /api/estimations...');
  const get = await request('GET', '/api/estimations');
  console.log('Status:', get.status, 'Data:', get.data);

  console.log('\nTesting POST /api/estimations...');
  const post = await request('POST', '/api/estimations', {
    client_id: 1,
    amount: 5000,
    currency: 'USD'
  });
  console.log('Status:', post.status, 'Data:', post.data);

  process.exit(0);
}

test();
