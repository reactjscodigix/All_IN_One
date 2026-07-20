const http = require('http');

http.get('http://localhost:5000/api/projects', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const projects = JSON.parse(data);
      console.log('Found', projects.length, 'projects');
      
      // Find project 18
      const proj18 = projects.find(p => p.id === 18);
      if (proj18) {
        console.log('\nProject 18 from API:');
        console.log(JSON.stringify(proj18, null, 2));
      } else {
        console.log('\nProject 18 not found');
      }
      
      // Check first project
      if (projects.length > 0) {
        console.log('\nFirst project keys:', Object.keys(projects[0]));
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
    }
    process.exit(0);
  });
}).on('error', err => {
  console.error('Error:', err.message);
  process.exit(1);
});
