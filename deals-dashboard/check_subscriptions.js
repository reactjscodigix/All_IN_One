fetch('http://localhost:5000/api/companies')
  .then(r => r.json())
  .then(d => {
    console.log('Total companies:', d.length);
    console.log('\nDetailed data:');
    d.forEach(c => {
      console.log(`ID: ${c.id}, Name: ${c.company_name}`);
      console.log(`  plan_name: ${c.plan_name}, plan_type: ${c.plan_type}, status: ${c.status}`);
    });
  })
  .catch(e => console.error(e));
