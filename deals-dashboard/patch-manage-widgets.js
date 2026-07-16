const fs = require('fs');
let content = fs.readFileSync('client/src/components/ITManagerDashboard.js', 'utf8');

// Add X import if missing
if (!content.includes('X,')) {
  content = content.replace(/Flag, CheckCircle, AlertCircle, ChevronLeft, ChevronRight/g, 'Flag, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, X');
}

// Add state variables
const stateCode = `  const [loading, setLoading] = useState(true);

  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = useState(false);
  const [widgets, setWidgets] = useState({
    kpi: true,
    projectHealth: true,
    timeline: true,
    activity: true,
    taskSummary: true,
    workload: true,
    timeTracking: true,
    openTasks: true
  });`;

content = content.replace(/  const \[loading, setLoading\] = useState\(true\);/, stateCode);

// Add onClick to Manage Widgets button
content = content.replace(
  /<button className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-indigo-50 transition-colors">(\s*)<Layout size=\{16\} \/>(\s*)Manage Widgets(\s*)<\/button>/,
  `<button onClick={() => setIsWidgetDrawerOpen(true)} className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-indigo-50 transition-colors cursor-pointer">\n            <Layout size={16} />\n            Manage Widgets\n          </button>`
);

// Wrap KPI CARDS
content = content.replace(
  /\{\/\* KPI CARDS \*\/\}\n(\s*)<div className="grid grid-cols-6 gap-4 mb-6">/,
  `{/* KPI CARDS */}\n      {widgets.kpi && (\n      <div className="grid grid-cols-6 gap-4 mb-6">`
);
content = content.replace(
  /(\s*)<\/div>\n(\s*)\{\/\* MIDDLE ROW \*\/\}/,
  `\n      </div>\n      )}\n\n      {/* MIDDLE ROW */}`
);

// Wrap Project Health Overview
content = content.replace(
  /\{\/\* Project Health Overview \*\/\}\n(\s*)<div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">/,
  `{/* Project Health Overview */}\n        {widgets.projectHealth && (\n        <div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">`
);
content = content.replace(
  /(\s*)<\/div>\n\n(\s*)<div className="col-span-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">/,
  `\n        </div>\n        )}\n\n        {widgets.timeline && (\n        <div className="col-span-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">`
);

// Wrap Projects Timeline
content = content.replace(
  /(\s*)<\/div>\n\n(\s*)<div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">\n(\s*)<h3 className="text-sm  text-gray-900 mb-6">Activity Feed<\/h3>/,
  `\n        </div>\n        )}\n\n        {widgets.activity && (\n        <div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">\n          <h3 className="text-sm  text-gray-900 mb-6">Activity Feed</h3>`
);

// Wrap Activity Feed
content = content.replace(
  /(\s*)<\/div>\n(\s*)<\/div>\n\n(\s*)\{\/\* BOTTOM ROW \*\/\}/,
  `\n        </div>\n        )}\n      </div>\n\n      {/* BOTTOM ROW */}`
);

// Wrap Task Summary
content = content.replace(
  /\{\/\* Task Summary \*\/\}\n(\s*)<div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">/,
  `{/* Task Summary */}\n        {widgets.taskSummary && (\n        <div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">`
);
content = content.replace(
  /(\s*)<\/div>\n\n(\s*)\{\/\* Team Workload \*\/\}\n(\s*)<div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">/,
  `\n        </div>\n        )}\n\n        {/* Team Workload */}\n        {widgets.workload && (\n        <div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">`
);

// Wrap Team Workload
content = content.replace(
  /(\s*)<\/div>\n\n(\s*)\{\/\* Time Tracking \*\/\}\n(\s*)<div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">/,
  `\n        </div>\n        )}\n\n        {/* Time Tracking */}\n        {widgets.timeTracking && (\n        <div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">`
);

// Wrap Time Tracking
content = content.replace(
  /(\s*)<\/div>\n\n(\s*)\{\/\* Top Open Tasks \*\/\}\n(\s*)<div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">/,
  `\n        </div>\n        )}\n\n        {/* Top Open Tasks */}\n        {widgets.openTasks && (\n        <div className="col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">`
);

// Wrap Top Open Tasks
content = content.replace(
  /(\s*)<\/div>\n(\s*)<\/div>\n(\s*)<\/div>\n(\s*)\);\n\};/,
  `\n        </div>\n        )}\n      </div>\n\n      {/* Widget Drawer */}\n      <div className={\`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 \${isWidgetDrawerOpen ? 'translate-x-0' : 'translate-x-full'}\`}>\n        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">\n          <h3 className="font-semibold text-gray-900">Manage Widgets</h3>\n          <button onClick={() => setIsWidgetDrawerOpen(false)} className="text-gray-500 hover:text-gray-700">\n            <X size={18} />\n          </button>\n        </div>\n        <div className="p-5 space-y-4">\n          {[\n            { key: 'kpi', label: 'KPI Cards' },\n            { key: 'projectHealth', label: 'Project Health' },\n            { key: 'timeline', label: 'Projects Timeline' },\n            { key: 'activity', label: 'Activity Feed' },\n            { key: 'taskSummary', label: 'Task Summary' },\n            { key: 'workload', label: 'Team Workload' },\n            { key: 'timeTracking', label: 'Time Tracking' },\n            { key: 'openTasks', label: 'Top Open Tasks' }\n          ].map(w => (\n            <div key={w.key} className="flex items-center justify-between">\n              <span className="text-sm font-medium text-gray-700">{w.label}</span>\n              <label className="relative inline-flex items-center cursor-pointer">\n                <input type="checkbox" className="sr-only peer" checked={widgets[w.key]} onChange={() => setWidgets({...widgets, [w.key]: !widgets[w.key]})} />\n                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>\n              </label>\n            </div>\n          ))}\n        </div>\n      </div>\n\n    </div>\n  );\n};`
);

fs.writeFileSync('client/src/components/ITManagerDashboard.js', content, 'utf8');
console.log('Patched ITManagerDashboard.js');
