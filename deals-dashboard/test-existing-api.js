const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, path: path });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('Testing existing APIs...\n');
  
  const paths = [
    '/api/deals',
    '/api/contacts',
    '/api/companies',
    '/api/campaigns',
    '/api/pipeline'
  ];

  for (const path of paths) {
    try {
      const result = await makeRequest(path);
      console.log(`${path}: ${result.status}`);
    } catch (err) {
      console.log(`${path}: ERROR - ${err.message}`);
    }
  }
}

test();
