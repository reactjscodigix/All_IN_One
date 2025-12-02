fetch('http://localhost:5000/api/companies')
  .then(r => r.json())
  .then(data => {
    console.log('✓ GET /api/companies works!');
    console.log(`Total companies: ${data.length}`);
    console.log('\nLast company added:');
    const company = data[data.length - 1];
    console.log(`  ID: ${company.id}`);
    console.log(`  Name: ${company.company_name}`);
    console.log(`  Email: ${company.email}`);
    console.log(`  Phone: ${company.phone}`);
    console.log(`  Status: ${company.status}`);
    console.log(`  Currency: ${company.currency}`);
  })
  .catch(e => console.error('Error:', e));
