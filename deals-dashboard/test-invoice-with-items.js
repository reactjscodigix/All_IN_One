const http = require('http');

const data = JSON.stringify({
  client: 3,
  billTo: 'Thomas Lawler 2077 Chicago Avenue Orosi, CA 93647 Email : tarala2445@gmail.com Phone : +1 987 654 3210',
  amount: 4950,
  currency: 'INR',
  status: 'Paid',
  date: '2025-12-05',
  openTill: '2025-12-25',
  paymentMethod: 'Bank Transfer',
  project: 4,
  shipTo: 'hyderabad',
  total: 4950,
  subtotal: 5500,
  discount: 550,
  notes: 'Please quote invoice number when remitting funds.',
  termsConditions: 'Please quote invoice number when remitting funds.',
  items: [
    {
      item_name: 'Social Media Template',
      description: 'Professional social media design template',
      quantity: 1,
      rate: 5000,
      discount_percent: 10,
      tax_percent: 0
    }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/invoices',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
