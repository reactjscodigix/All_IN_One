fetch('http://localhost:5000/api/companies')
  .then(r => r.json())
  .then(d => {
    console.log('Total companies:', d.length);
    d.forEach(c => {
      console.log(`${c.id}. ${c.company_name} | Account URL: ${c.account_url || 'EMPTY'} | Plan: ${c.plan_name ? c.plan_name + ' (' + c.plan_type + ')' : 'NO PLAN'}`);
    });
  })
  .catch(e => console.error(e));
