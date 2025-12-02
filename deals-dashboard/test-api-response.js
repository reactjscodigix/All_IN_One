fetch('http://localhost:5000/api/companies/7')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', {
      'content-type': r.headers.get('content-type'),
    });
    return r.json();
  })
  .then(data => {
    console.log('\nFull response:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(e => console.error('Error:', e));
