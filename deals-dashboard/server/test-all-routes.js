const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode);
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
  const routes = [
    '/api/invoices',
    '/api/payments',
    '/api/invoices/1',
    '/api/payments/1',
    '/api/invoices/metrics/summary',
    '/api/invoices/status/breakdown',
    '/api/companies'
  ];

  for (const route of routes) {
    try {
      const status = await makeRequest(route);
      console.log(`${route}: ${status}`);
    } catch (error) {
      console.log(`${route}: ERROR - ${error}`);
    }
  }

  process.exit(0);
})();
