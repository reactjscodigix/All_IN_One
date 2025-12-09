const http = require('http');

function makeRequest(method, path, body = null) {
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
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testNotes() {
  try {
    console.log('Testing Notes API...\n');

    console.log('1. Creating a note for user_id=1...');
    const createRes = await makeRequest('POST', '/api/notes', {
      user_id: 1,
      title: 'Test Note',
      description: 'This is a test note',
      priority: 'High',
      category: 'Work',
      tag: 'Pending',
      is_important: false
    });
    console.log('Response:', createRes);
    
    if (createRes.status === 200 && createRes.body.note) {
      const noteId = createRes.body.note.id;
      console.log('\n2. Fetching notes for user_id=1...');
      const getRes = await makeRequest('GET', '/api/notes?userId=1');
      console.log('Response:', getRes);

      console.log('\n3. Updating note...');
      const updateRes = await makeRequest('PUT', `/api/notes/${noteId}`, {
        title: 'Updated Test Note',
        is_important: true
      });
      console.log('Response:', updateRes);

      console.log('\n4. Deleting note...');
      const deleteRes = await makeRequest('DELETE', `/api/notes/${noteId}`);
      console.log('Response:', deleteRes);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

testNotes();
