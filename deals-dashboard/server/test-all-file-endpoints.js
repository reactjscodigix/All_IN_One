const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  try {
    console.log('Testing File Manager API Endpoints...\n');

    console.log('1. GET /api/files?userId=1');
    const files = await makeRequest('/api/files?userId=1');
    console.log(`   Status: ${files.status}`);
    console.log(`   Response: ${files.data}\n`);

    console.log('2. GET /api/folders?userId=1');
    const folders = await makeRequest('/api/folders?userId=1');
    console.log(`   Status: ${folders.status}`);
    console.log(`   Response: ${folders.data}\n`);

    console.log('3. GET /api/files/storage-stats?userId=1');
    const stats = await makeRequest('/api/files/storage-stats?userId=1');
    console.log(`   Status: ${stats.status}`);
    console.log(`   Response: ${stats.data}\n`);

    console.log('4. POST /api/folders (Create Folder)');
    const createFolder = await makeRequest('/api/folders', 'POST', {
      name: 'Test Folder',
      storageType: 'Internal',
      userId: 1
    });
    console.log(`   Status: ${createFolder.status}`);
    console.log(`   Response: ${createFolder.data}\n`);

    console.log('5. POST /api/files (Upload File)');
    const uploadFile = await makeRequest('/api/files', 'POST', {
      name: 'test.pdf',
      fileType: 'PDF',
      sizeBytes: 2560000,
      storageType: 'Internal',
      userId: 1,
      mimeType: 'application/pdf'
    });
    console.log(`   Status: ${uploadFile.status}`);
    console.log(`   Response: ${uploadFile.data}\n`);

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
