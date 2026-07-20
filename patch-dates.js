const fs = require('fs');
const path = 'client/src/components/ITTasksPage.js';
let content = fs.readFileSync(path, 'utf8');

// Replace static dates with real data
const datesReplace = `case 'created':
                                return <td key={col.key} className="p-3 text-gray-500 font-medium">{row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>;
                              case 'updated':
                                return <td key={col.key} className="p-3 text-gray-500 font-medium">{row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>;
                              case 'dueDate':
                                return <td key={col.key} className="p-3 text-gray-500 font-medium">{row.due_date ? new Date(row.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : row.due_date || '-'}</td>;`;

content = content.replace(/case 'created':[\s\S]*?case 'dueDate':[\s\S]*?<\/td>;/, datesReplace);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched date mapping in ITTasksPage.js');
