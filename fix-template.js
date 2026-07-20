const fs = require('fs');
const filePath = 'client/src/components/CreateNotePage.js';
let code = fs.readFileSync(filePath, 'utf8');

// Replace \${ with ${
let modified = false;
if (code.includes('\\${')) {
  code = code.replace(/\\\$\{/g, '${');
  modified = true;
}

if (modified) {
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Fixed escaped template literals in CreateNotePage.js');
} else {
  console.log('No escaped template literals found');
}
