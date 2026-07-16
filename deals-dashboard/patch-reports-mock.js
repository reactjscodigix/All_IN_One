const fs = require('fs');
const path = 'client/src/components/ITAnalyticsPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Project Health Data
content = content.replace(
  /const projectHealthData = \[\s*\{ name: 'On Track', value: projects\.filter\(p => p\.status === 'Active' \|\| p\.status === 'On Track'\)\.length \|\| 12, color: '#22c55e' \},\s*\{ name: 'At Risk', value: projects\.filter\(p => p\.status === 'At Risk'\)\.length \|\| 8, color: '#3b82f6' \},\s*\{ name: 'Delayed', value: projects\.filter\(p => p\.status === 'Delayed'\)\.length \|\| 5, color: '#eab308' \},\s*\{ name: 'On Hold', value: projects\.filter\(p => p\.status === 'On Hold'\)\.length \|\| 3, color: '#ef4444' \},\s*\];/g,
  `const projectHealthData = [
    { name: 'On Track', value: projects.filter(p => p.status === 'Active' || p.status === 'On Track').length, color: '#22c55e' },
    { name: 'At Risk', value: projects.filter(p => p.status === 'At Risk').length, color: '#3b82f6' },
    { name: 'Delayed', value: projects.filter(p => p.status === 'Delayed').length, color: '#eab308' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'On Hold').length, color: '#ef4444' },
  ];`
);

// 2. Time Tracking Data
content = content.replace(
  /const timeTrackingData = \[\s*\{ name: 'Development', value: 720, color: '#3b82f6' \},\s*\{ name: 'Testing', value: 240, color: '#8b5cf6' \},\s*\{ name: 'Design', value: 160, color: '#22c55e' \},\s*\{ name: 'Meetings', value: 128, color: '#eab308' \},\s*\];/g,
  `const timeTrackingData = [];`
);

// 3. Task Trend Data
content = content.replace(
  /const taskTrendData = \[\s*\{ name: '01 Jul', completed: 40, inProgress: 60, overdue: 20 \},\s*\{ name: '04 Jul', completed: 60, inProgress: 70, overdue: 25 \},\s*\{ name: '07 Jul', completed: 90, inProgress: 85, overdue: 22 \},\s*\{ name: '10 Jul', completed: 156, inProgress: 132, overdue: 18 \},\s*\{ name: '13 Jul', completed: 140, inProgress: 120, overdue: 15 \},\s*\{ name: '15 Jul', completed: 160, inProgress: 140, overdue: 10 \},\s*\];/g,
  `const taskTrendData = [];`
);

// 4. perfSummary 
content = content.replace(
  /if \(perfSummary\.length === 0\) \{[\s\S]*?\}\n/g,
  ``
);

// 5. teamPerf
content = content.replace(
  /const teamPerf = \[\s*\{ name: 'Rahul Patil', role: 'Developer', completed: 28, hours: 168, eff: 90 \},[\s\S]*?\];/g,
  `const teamPerf = [];`
);

// 6. displayBugs
content = content.replace(
  /const displayBugs = topOpenBugs\.length > 0 \? topOpenBugs\.map\(\(t, idx\) => \(\{\s*id: \`BUG-\$\{idx \+ 101\}\`,\s*title: t\.title \|\| 'Untitled',\s*project: projects\.find\(p => p\.id === t\.project_id\)\?\.name \|\| 'General',\s*priority: t\.priority \|\| 'Medium',\s*status: t\.status \|\| 'Open',\s*age: '2d'\s*\}\)\) : \[\s*\{ id: 'BUG-125', title: 'Login session expire issue', project: 'Hospital ERP System', priority: 'High', status: 'Open', age: '2d' \},[\s\S]*?\];/g,
  `const displayBugs = topOpenBugs.map((t, idx) => ({
    id: \`BUG-\${idx + 101}\`,
    title: t.title || 'Untitled',
    project: projects.find(p => p.id === t.project_id)?.name || 'General',
    priority: t.priority || 'Medium',
    status: t.status || 'Open',
    age: '2d'
  }));`
);

// 7. recentDeployments
content = content.replace(
  /const recentDeployments = \[\s*\{ version: 'v2\.1\.0', project: 'Hospital ERP System', env: 'Production', deployedBy: 'Akshay More', date: '15 Jul 2026 10:30 AM', status: 'Success' \},[\s\S]*?\];/g,
  `const recentDeployments = [];`
);

// 8. projectsTimeline
content = content.replace(
  /const projectsTimeline = \(projects\.length > 0 \? projects : \[\s*\{ name: 'Hospital ERP System', status: 'On Track' \},[\s\S]*?\]\)\.slice\(0, 6\)/g,
  `const projectsTimeline = projects.slice(0, 6)`
);

// Fix bug block rendering check (optional, but good practice)
content = content.replace(
  /{displayBugs\.map\(\(bug\) => \(/g,
  `{displayBugs.length === 0 ? <div className="text-sm text-gray-500 mt-4">No active bugs</div> : displayBugs.map((bug) => (`
);
content = content.replace(
  /<\/div>\n\s*<\/div>\n\s*\{\/\* RECENT DEPLOYMENTS \*\/\}/g,
  `</div>)}
          </div>
          {/* RECENT DEPLOYMENTS */}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITAnalyticsPage.js to remove dummy data.');
