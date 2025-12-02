fetch('http://localhost:5000/api/companies')
  .then(r => r.json())
  .then(data => {
    console.log(`Total companies: ${data.length}\n`);
    const techCorp = data.find(c => c.company_name === 'TechCorp Solutions');
    if (techCorp) {
      console.log('✓ TechCorp Solutions FOUND:\n');
      console.log(`  ID: ${techCorp.id}`);
      console.log(`  Name: ${techCorp.company_name}`);
      console.log(`  Email: ${techCorp.email}`);
      console.log(`  Phone: ${techCorp.phone}`);
      console.log(`  Phone 2: ${techCorp.phone2}`);
      console.log(`  Fax: ${techCorp.fax}`);
      console.log(`  Tags: ${techCorp.tags}`);
      console.log(`  Owner: ${techCorp.owner}`);
      console.log(`  Source: ${techCorp.source}`);
      console.log(`  Currency: ${techCorp.currency}`);
      console.log(`  Language: ${techCorp.language}`);
      console.log(`  Description: ${techCorp.description}`);
    } else {
      console.log('✗ TechCorp Solutions NOT FOUND\n');
      console.log('Latest 3 companies:');
      data.slice(-3).forEach(c => console.log(`  - ${c.company_name}`));
    }
  })
  .catch(e => console.error('Error:', e));
