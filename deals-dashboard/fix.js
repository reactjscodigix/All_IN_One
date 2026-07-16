const fs = require('fs');
let content = fs.readFileSync('client/src/components/ITChatPage.js', 'utf8');
content = content.replace(/\\\`/g, '\`');
content = content.replace(/\\\$\{/g, '${');
fs.writeFileSync('client/src/components/ITChatPage.js', content, 'utf8');
console.log('Fixed escaping in ITChatPage.js');
