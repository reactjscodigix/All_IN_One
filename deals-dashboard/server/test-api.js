const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data.substring(0, 200)
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

(async () => {
  console.log('Testing /api/invoices...');
  try {
    const invoicesResult = await makeRequest('/api/invoices');
    console.log(`Status: ${invoicesResult.status}`);
    console.log(`Response: ${invoicesResult.data}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  console.log('\nTesting /api/payments...');
  try {
    const paymentsResult = await makeRequest('/api/payments');
    console.log(`Status: ${paymentsResult.status}`);
    console.log(`Response: ${paymentsResult.data}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  process.exit(0);
})();
