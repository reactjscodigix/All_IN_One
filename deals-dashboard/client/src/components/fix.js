const fs = require('fs');
const lines = fs.readFileSync('ITIssueDetailsPanel.js', 'utf8').split('\n');
lines.splice(351, 512 - 351 + 1); // Delete lines 352 to 512
fs.writeFileSync('ITIssueDetailsPanel.js', lines.join('\n'));
