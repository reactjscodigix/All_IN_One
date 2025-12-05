const http = require('http');

function makeRequest(host, port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString().substring(0, 100);
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      reject(error.message);
    });

    req.on('timeout', () => {
      req.destroy();
      reject('Timeout');
    });

    req.end();
  });
}

(async () => {
  console.log('Testing backend API...');
  try {
    const result = await makeRequest('localhost', 5000, '/api/invoices');
    console.log(`Backend: Status ${result.status}`);
  } catch (error) {
    console.log(`Backend: ${error}`);
  }

  console.log('\nTesting frontend app...');
  try {
    const result = await makeRequest('localhost', 3000, '/');
    console.log(`Frontend: Status ${result.status}`);
    if (result.data.includes('<!DOCTYPE')) {
      console.log('Frontend: HTML app loaded');
    }
  } catch (error) {
    console.log(`Frontend: ${error}`);
  }

  process.exit(0);
})();
