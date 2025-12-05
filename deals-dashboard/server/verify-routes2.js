const fs = require('fs');
const path = require('path');

const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf-8');
const lines = serverContent.split('\n');

console.log('Searching for /api/payments routes:');
lines.forEach((line, index) => {
  if (line.includes("app.get('/api/payments") || 
      line.includes("app.post('/api/payments") ||
      line.includes("app.put('/api/payments") ||
      line.includes("app.delete('/api/payments")) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

console.log('\nSearching for /api/invoices routes:');
lines.forEach((line, index) => {
  if (line.includes("app.get('/api/invoices") && !line.includes("//")) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
