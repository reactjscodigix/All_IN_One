const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'routes', 'entities-routes.js');
const content = fs.readFileSync(filePath, 'utf-8');

console.log('Checking for phone2 in entities-routes.js...');
console.log('File size:', content.length, 'bytes');
console.log('');

const lines = content.split('\n');
let inPostContacts = false;
let handlerLineNumber = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes("app.post('/api/contacts'")) {
    inPostContacts = true;
    handlerLineNumber = i + 1;
    console.log(`Found POST /api/contacts at line ${handlerLineNumber}`);
  }
  
  if (inPostContacts) {
    if (line.includes('phone2')) {
      console.log(`⚠️  Found 'phone2' at line ${i + 1}: ${line.trim()}`);
    }
    if (line.includes('fax')) {
      console.log(`⚠️  Found 'fax' at line ${i + 1}: ${line.trim()}`);
    }
    
    // Stop at the next app.post or app.put
    if (i > handlerLineNumber && (line.includes("app.post") || line.includes("app.put") || line.includes("app.get") || line.includes("app.delete")) && !line.includes("'/api/contacts'")) {
      inPostContacts = false;
      console.log(`POST /api/contacts handler ends around line ${i}`);
    }
  }
}

console.log('\nChecking INSERT query structure...');
const insertMatch = content.match(/INSERT INTO contacts \(([\s\S]*?)\) VALUES/);
if (insertMatch) {
  const columns = insertMatch[1].split(',').map(c => c.trim());
  console.log(`Found ${columns.length} columns in INSERT:`);
  columns.forEach((col, i) => {
    console.log(`  ${i + 1}. ${col}`);
  });
} else {
  console.log('Could not find INSERT INTO contacts statement');
}
