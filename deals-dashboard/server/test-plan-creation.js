const http = require('http');

const testData = {
  planName: 'test-plan',
  planType: 'Monthly',
  planPosition: 'Basic',
  planCurrency: 'USD',
  planCurrencyFree: 'USD',
  discountType: 'Percentage',
  discount: '10',
  limitationsInvoices: 100,
  maxCustomers: 50,
  product: 'test-product',
  supplier: 'test-supplier',
  planModules: {
    Contacts: true,
    Companies: true,
    Deals: false
  },
  accessTrial: true,
  trialDays: 14,
  status: 'Active'
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/plans',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': JSON.stringify(testData).length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(JSON.stringify(testData));
req.end();
