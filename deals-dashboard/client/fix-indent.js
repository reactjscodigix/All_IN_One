const fs = require('fs');

const content = fs.readFileSync('./src/components/ProjectDetailsPage.js', 'utf-8');
const lines = content.split('\n');

// Fix indentation from line 188 onwards
for (let i = 187; i < lines.length; i++) {
  // Remove 2 spaces from the beginning if they have more than 10 spaces
  if (lines[i].startsWith('            ') && !lines[i].startsWith('              {')) {
    lines[i] = lines[i].substring(2);
  }
}

fs.writeFileSync('./src/components/ProjectDetailsPage.js', lines.join('\n'));
console.log('Indentation fixed');
