const fs = require('fs');
const path = 'client/src/components/ITTasksPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace LIST_DATA with tasks
content = content.replace(/\{LIST_DATA\.map\(\(row, i\) => \(/g, '{tasks.map((row, i) => (');

// 2. Fix key mapping (API returns issue_key)
content = content.replace(/row\.key/g, '(row.issue_key || row.key)');

// 3. Fix scroll wrapper
content = content.replace(/<div className="border border-gray-200 rounded  bg-white">/, '<div className="border border-gray-200 rounded bg-white overflow-x-auto w-full max-w-full">');

// 4. Update the reporter and assignee fields to fall back gracefully if missing
content = content.replace(/row\.assignee\.charAt\(0\)/g, '(row.assignee ? row.assignee.charAt(0) : "U")');
content = content.replace(/<span>\{row\.assignee\}<\/span>/g, '<span>{row.assignee || "Unassigned"}</span>');

content = content.replace(/<span>PM Admin<\/span>/g, '<span>{row.reporter || "PM Admin"}</span>');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITTasksPage.js to use real tasks data and fix scrolling.');
