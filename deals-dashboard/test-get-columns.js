fetch('http://localhost:5000/api/companies/7')
  .then(r => r.json())
  .then(data => {
    console.log('All columns returned:\n');
    Object.keys(data).forEach(key => {
      console.log(`  ${key}: ${data[key]}`);
    });
  })
  .catch(e => console.error('Error:', e));
