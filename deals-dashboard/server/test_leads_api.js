const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    console.log('Testing GET /api/leads');
    const response = await makeRequest('/api/leads');
    console.log(`Status: ${response.status}`);
    console.log(`Leads count: ${Array.isArray(response.data) ? response.data.length : 'Not an array'}`);
    if (Array.isArray(response.data)) {
      response.data.forEach(lead => {
        console.log(`  - ${lead.lead_name} (Status: ${lead.lead_status})`);
      });
    } else {
      console.log('Response data:', response.data);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
