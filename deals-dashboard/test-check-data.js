const http = require('http');

const fetchData = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

(async () => {
  try {
    console.log('Fetching companies...');
    const companies = await fetchData('/api/companies');
    console.log('Companies:', Array.isArray(companies) ? companies.length + ' found' : companies);
    if (Array.isArray(companies) && companies.length > 0) {
      console.log('First company:', companies[0]);
    }

    console.log('\nFetching users...');
    const users = await fetchData('/api/contacts');
    console.log('Users:', Array.isArray(users) ? users.length + ' found' : users);
    if (Array.isArray(users) && users.length > 0) {
      console.log('First user:', users[0]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
