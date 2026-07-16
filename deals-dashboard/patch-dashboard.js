const fs = require('fs');
const path = 'client/src/components/ITManagerDashboard.js';
let content = fs.readFileSync(path, 'utf8');

// Remove Mocked KPIs
content = content.replace(
  /{ title: 'Deployments', value: '11', trend: 'Mocked'[\s\S]*?{ title: 'Logged Hours', value: '1,248h', trend: 'Mocked'.*?}/,
  `{ title: 'Deployments', value: '0', trend: 'Live Data', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-50', trendColor: 'text-gray-400' },
    { title: 'Logged Hours', value: '0h', trend: 'Live Data', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', trendColor: 'text-gray-400' }`
);

// Remove fallback in onTrackCount
content = content.replace(
  /const onTrackCount = projects\.filter\(p => p\.status === 'Active' \|\| p\.status === 'On Track'\)\.length \|\| 1; \/\/ Fallback to avoid empty chart/,
  `const onTrackCount = projects.filter(p => p.status === 'Active' || p.status === 'On Track').length;`
);

// Remove random progress in Gantt
content = content.replace(
  /const progress = p\.progress \|\| Math\.floor\(Math\.random\(\) \* 80\) \+ 10;/,
  `const progress = p.progress || 0;`
);

// Remove random length in Gantt
content = content.replace(
  /length: 20 \+ \(Math\.random\(\) \* 30\),/,
  `length: 30,`
);

// Fix empty pie chart state so it doesn't crash if all 0
content = content.replace(
  /const projectHealthData = \[[\s\S]*?\];/,
  `const projectHealthData = [
    { name: 'On Track', value: onTrackCount, color: '#22c55e' },
    { name: 'At Risk', value: atRiskCount, color: '#3b82f6' },
    { name: 'Delayed', value: delayedCount, color: '#eab308' },
    { name: 'On Hold', value: onHoldCount, color: '#ef4444' },
  ];
  if (onTrackCount === 0 && atRiskCount === 0 && delayedCount === 0 && onHoldCount === 0) {
    projectHealthData.push({ name: 'No Data', value: 1, color: '#e5e7eb' });
  }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully removed dummy data fallbacks from ITManagerDashboard.js');
