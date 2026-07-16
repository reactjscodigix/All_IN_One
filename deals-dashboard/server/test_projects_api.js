const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/projects?assignedOnly=true',
  method: 'GET',
  headers: {
    'x-user-id': '1',
    'x-user-role': 'Admin'
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const projects = JSON.parse(data);
    console.log(`Got ${projects.length} projects`);
    if (projects.length > 0) {
      console.log(projects.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        company_name: p.company_name,
        workflow_type: p.workflow_type,
        department_id: p.department_id,
        created_by: p.created_by
      })));
    }
  });
});

req.on('error', error => console.error(error));
req.end();
