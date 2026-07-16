const fs = require('fs');
const path = 'client/src/components/ITAnalyticsPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove KPI fallbacks
content = content.replace(
  /val: projects\.length \|\| 28/g,
  `val: projects.length`
);
content = content.replace(
  /val: activeProjectsCount \|\| 18/g,
  `val: activeProjectsCount`
);
content = content.replace(
  /val: tasksCompleted \|\| 156/g,
  `val: tasksCompleted`
);
content = content.replace(
  /val: inProgressTasksCount \|\| 132/g,
  `val: inProgressTasksCount`
);
content = content.replace(
  /val: overdueTasks \|\| 18/g,
  `val: overdueTasks`
);
content = content.replace(
  /val: totalBugs \|\| 42/g,
  `val: totalBugs`
);

// We should also remove hardcoded trends since they don't apply when empty:
content = content.replace(
  /trend: '\+ 4 this month'/g,
  `trend: ''`
);
content = content.replace(
  /trend: '\+ 3 this week'/g,
  `trend: ''`
);
content = content.replace(
  /trend: '\+ 28 this week'/g,
  `trend: ''`
);
content = content.replace(
  /trend: '\+ 12 this week'/g,
  `trend: ''`
);
content = content.replace(
  /trend: '- 5 this week'/g,
  `trend: ''`
);
content = content.replace(
  /trend: '- 6 this week'/g,
  `trend: ''`
);
content = content.replace(
  /trend: '\+ 96h this week'/g,
  `trend: ''`
);
content = content.replace(
  /trend: '\+ 65h this week'/g,
  `trend: ''`
);

// 2. Add empty state for recentDeployments
content = content.replace(
  /{recentDeployments\.map\(\(dep, idx\) => \(/g,
  `{recentDeployments.length === 0 ? <div className="text-sm text-gray-500 mt-4">No recent deployments</div> : recentDeployments.map((dep, idx) => (`
);
content = content.replace(
  /<\/div>\n\s*\{\/\* TIME TRACKING \*\/\}/g,
  `</div>)}
          {/* TIME TRACKING */}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITAnalyticsPage.js KPI fallbacks.');
