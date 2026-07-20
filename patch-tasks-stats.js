const fs = require('fs');
const path = 'client/src/components/ITTasksPage.js';
let content = fs.readFileSync(path, 'utf8');

// Replace mock renders with real data
const replaceStr = `// Unselected/extra columns mock renders
                              case 'progress':
                                return <td key={col.key} className="p-3 text-gray-700 ">{row.progress || 0}%</td>;
                              case 'remainingEstimate':
                                return <td key={col.key} className="p-3 text-gray-600">{row.remaining_estimate || '0h'}</td>;
                              case 'originalEstimate':
                                return <td key={col.key} className="p-3 text-gray-600">{row.original_estimate || '0h'}</td>;
                              case 'timeSpent':
                                return <td key={col.key} className="p-3 text-gray-600">{row.time_spent || '0h'}</td>;
                              case 'comments':
                                const commentCount = row.comments ? (Array.isArray(row.comments) ? row.comments.length : JSON.parse(row.comments).length) : 0;
                                return <td key={col.key} className="p-3 text-gray-600">{commentCount} Comments</td>;
                              case 'subTasks':
                                const subtaskCount = row.subtasks ? (Array.isArray(row.subtasks) ? row.subtasks.length : JSON.parse(row.subtasks).length) : 0;
                                return <td key={col.key} className="p-3 text-gray-600">{subtaskCount} Subtasks</td>;
                              case 'components':
                                return <td key={col.key} className="p-3 text-gray-600">{row.components || '-'}</td>;
                              case 'confluenceItems':
                                return <td key={col.key} className="p-3 text-gray-600">0 Links</td>;
                              case 'creator':
                                return <td key={col.key} className="p-3 text-gray-600">{row.reporter || 'System'}</td>;
                              case 'development':
                                return <td key={col.key} className="p-3 text-gray-600">0 Branches</td>;`;

content = content.replace(/\/\/ Unselected\/extra columns mock renders[\s\S]*?case 'development':[\s\S]*?<\/td>;/, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITTasksPage.js stats mapping.');
