const http = require('http');

function testAPI(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Pipeline API...\n');

  try {
    console.log('1. GET /api/pipeline - Fetch all pipelines');
    const pipelines = await testAPI('GET', '/pipeline');
    console.log(`Status: ${pipelines.status}`);
    console.log(`Data:`, JSON.stringify(pipelines.data, null, 2));
    console.log('');

    console.log('2. POST /api/pipeline - Create new pipeline');
    const newPipeline = await testAPI('POST', '/pipeline', {
      name: 'Test Sales Pipeline',
      description: 'A test pipeline to verify the form works',
      stages: ['Lead', 'Qualified', 'Proposal', 'Closed'],
      access_type: 'All',
      status: 'Active'
    });
    console.log(`Status: ${newPipeline.status}`);
    console.log(`Response:`, JSON.stringify(newPipeline.data, null, 2));

    if (newPipeline.data.id) {
      console.log('\n3. GET /api/pipeline/:id - Fetch specific pipeline');
      const pipelineId = newPipeline.data.id;
      const singlePipeline = await testAPI('GET', `/pipeline/${pipelineId}`);
      console.log(`Status: ${singlePipeline.status}`);
      console.log(`Data:`, JSON.stringify(singlePipeline.data, null, 2));
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }

  process.exit(0);
}

setTimeout(runTests, 2000);
