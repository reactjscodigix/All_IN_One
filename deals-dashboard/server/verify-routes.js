const fs = require('fs');
const path = require('path');

const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf-8');

const getPaymentsMatch = serverContent.match(/app\.get\('\/api\/payments'/g);
const postPaymentsMatch = serverContent.match(/app\.post\('\/api\/payments'/g);
const getInvoicesMatch = serverContent.match(/app\.get\('\/api\/invoices'/g);

console.log(`Found ${getPaymentsMatch ? getPaymentsMatch.length : 0} GET /api/payments routes`);
console.log(`Found ${postPaymentsMatch ? postPaymentsMatch.length : 0} POST /api/payments routes`);
console.log(`Found ${getInvoicesMatch ? getInvoicesMatch.length : 0} GET /api/invoices routes`);

if (getPaymentsMatch) {
  console.log('\n/api/payments routes found at:');
  let index = 0;
  for (const match of getPaymentsMatch) {
    index = serverContent.indexOf(match, index);
    const lineNum = serverContent.substring(0, index).split('\n').length;
    console.log(`  Line ${lineNum}`);
    index += match.length;
  }
}
