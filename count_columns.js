
const fs = require('fs');
const content = fs.readFileSync('d:/projects/All_IN_One/deals-dashboard/server/routes/entities-routes.js', 'utf8');

const firstSelectMatch = content.match(/\(SELECT\s+([\s\S]*?)\s+FROM\s+deals\s+d/);
const secondSelectMatch = content.match(/UNION\s+ALL\s+\(SELECT\s+([\s\S]*?)\s+FROM\s+leads\s+l/);

if (firstSelectMatch && secondSelectMatch) {
  const firstColumns = firstSelectMatch[1].split(',').map(s => s.trim());
  const secondColumns = secondSelectMatch[1].split(',').map(s => s.trim());

  console.log('First SELECT count:', firstColumns.length);
  firstColumns.forEach((c, i) => console.log(`${i+1}: ${c}`));

  console.log('\nSecond SELECT count:', secondColumns.length);
  secondColumns.forEach((c, i) => console.log(`${i+1}: ${c}`));
} else {
  console.log('Could not find both SELECT statements');
}
