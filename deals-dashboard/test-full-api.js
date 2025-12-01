fetch('http://localhost:5000/api/companies')
  .then(r => r.json())
  .then(d => {
    console.log('=== FULL API RESPONSE ===');
    console.log(JSON.stringify(d, null, 2));
  })
  .catch(e => console.error('Error:', e.message));
