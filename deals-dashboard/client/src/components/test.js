const parser = require('@babel/parser');
const fs = require('fs');

const code = fs.readFileSync('ITIssueDetailsPanel.js', 'utf8');
try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Parsed successfully!');
} catch (e) {
  console.error(e.message);
}
