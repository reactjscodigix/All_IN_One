const http = require('http');

http.get('http://localhost:5000/api/projects', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const projects = JSON.parse(data);
      console.log('Found', projects.length, 'projects');
      if (projects.length > 0) {
        console.log('\nFirst project:');
        console.log(JSON.stringify(projects[0], null, 2));
      }
    } catch (e) {
      console.log('Response (first 500 chars):', data.substring(0, 500));
    }
    process.exit(0);
  });
}).on('error', err => {
  console.error('Error:', err.message);
  process.exit(1);
});
