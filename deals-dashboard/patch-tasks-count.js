const fs = require('fs');
const path = 'client/src/components/ITTasksPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace the hardcoded metrics row array
const dynamicMetrics = `const stats = [
                  { label: 'All Issues', count: tasks.length, icon: <LayoutList size={16} className="text-gray-500" />, color: 'text-gray-900' },
                  { label: 'To Do', count: tasks.filter(t => t.status === 'TO DO' || t.status === 'To Do').length, icon: <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100"></div>, color: 'text-gray-900' },
                  { label: 'In Progress', count: tasks.filter(t => t.status === 'IN PROGRESS' || t.status === 'In Progress').length, icon: <div className="w-4 h-4 rounded border-2 border-orange-500 bg-orange-100"></div>, color: 'text-gray-900' },
                  { label: 'In Review', count: tasks.filter(t => t.status === 'IN REVIEW' || t.status === 'In Review').length, icon: <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-100"></div>, color: 'text-gray-900' },
                  { label: 'Testing', count: tasks.filter(t => t.status === 'TESTING' || t.status === 'Testing').length, icon: <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-100"></div>, color: 'text-gray-900' },
                  { label: 'Done', count: tasks.filter(t => t.status === 'DONE' || t.status === 'Done').length, icon: <CheckCircleIcon className="text-teal-500" />, color: 'text-gray-900' },
                  { label: 'Blocked', count: tasks.filter(t => t.status === 'BLOCKED' || t.status === 'Blocked').length, icon: <AlertTriangleIcon className="text-red-500" />, color: 'text-red-600 border-red-200 bg-red-50' },
                ];
                
                return (
                  <div className="flex gap-4 mb-8 pb-2">
                    {stats.map((m, i) => (`;

content = content.replace(
  /{\[\s*{\s*label:\s*'All Issues'[\s\S]*?}\)\)}/g,
  dynamicMetrics.replace('return (', '').replace('<div className="flex gap-4 mb-8 pb-2">', '')
);

// 2. Fix the "128" badge
content = content.replace(
  /<span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded-full">128<\/span>/g,
  `<span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded-full">{tasks.length}</span>`
);

// 3. Fix the "1-8 of 128 issues" text at the bottom
content = content.replace(
  /<span>1-8 of 128 issues<\/span>/g,
  `<span>1-{tasks.length} of {tasks.length} issues</span>`
);

// 4. Fix LIST_DATA in ITIssueDetailsPanel
content = content.replace(
  /issue={LIST_DATA\.find\(r => r\.key === selectedIssue\)}/g,
  `issue={tasks.find(r => (r.issue_key || r.key) === selectedIssue)}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITTasksPage.js to use dynamic stats and fix LIST_DATA.');
