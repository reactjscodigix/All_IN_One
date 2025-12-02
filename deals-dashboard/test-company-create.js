const data = {
  company_name: "Test Company from API",
  email: "test@example.com",
  phone: "1234567890",
  website: "https://test.com",
  status: "Active"
};

fetch('http://localhost:5000/api/companies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
