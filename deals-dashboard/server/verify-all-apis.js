const http = require('http');

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/auth/login', name: 'GET Login Test' },
  { method: 'GET', path: '/api/contacts', name: 'GET Contacts' },
  { method: 'GET', path: '/api/companies', name: 'GET Companies' },
  { method: 'GET', path: '/api/users', name: 'GET Users' },
  { method: 'GET', path: '/api/deals', name: 'GET Deals' },
  { method: 'GET', path: '/api/projects', name: 'GET Projects' },
  { method: 'GET', path: '/api/activities', name: 'GET Activities' },
  { method: 'GET', path: '/api/notes', name: 'GET Notes' },
  { method: 'GET', path: '/api/roles', name: 'GET Roles' },
  { method: 'GET', path: '/api/pipeline-stages', name: 'GET Pipeline Stages' },
  { method: 'GET', path: '/api/leads', name: 'GET Leads' },
];

const testAPI = (method, path, name) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✓ ${name} (${res.statusCode})`);
        } else {
          console.log(`✗ ${name} (${res.statusCode})`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`✗ ${name} - Connection Error: ${error.message}`);
      resolve();
    });

    req.setTimeout(2000, () => {
      req.destroy();
      console.log(`✗ ${name} - Timeout`);
      resolve();
    });

    req.end();
  });
};

async function runTests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  API ENDPOINT VERIFICATION TEST        ║');
  console.log('║  Target: http://localhost:5000         ║');
  console.log('╚════════════════════════════════════════╝\n');

  for (const endpoint of API_ENDPOINTS) {
    await testAPI(endpoint.method, endpoint.path, endpoint.name);
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n✓ Test complete. Check results above.\n');
  process.exit(0);
}

runTests();
