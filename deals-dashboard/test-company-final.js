const data = {
  company_name: "TechCorp Solutions",
  email: "info@techcorp.com",
  email_opt_out: false,
  phone: "+1-555-123-4567",
  phone2: "+1-555-123-4568",
  fax: "+1-555-987-6543",
  website: "https://techcorp.com",
  address: "123 Tech Street",
  city: "San Francisco",
  state: "CA",
  country: "USA",
  status: "Active",
  industry: "Technology",
  reviews: "5 stars",
  owner: "John Smith",
  tags: "saas,startup,enterprise",
  source: "Website",
  currency: "USD",
  language: "English",
  description: "Leading technology solutions provider"
};

fetch('http://localhost:5000/api/companies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(r => r.json())
.then(d => {
  console.log('✓ Company created successfully!');
  console.log(`  ID: ${d.id}`);
  console.log(`  Message: ${d.message}`);
})
.catch(e => console.error('✗ Error:', e));
