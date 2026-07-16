const fs = require('fs');
const path = 'client/src/components/ITActivitiesPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
if (!content.includes('import axios')) {
  content = content.replace(
    /import React, \{ useState \} from 'react';/,
    `import React, { useState, useEffect } from 'react';\nimport axios from 'axios';`
  );
}

// 2. Remove KPIS and ACTIVITIES arrays
content = content.replace(/const KPIS = \[[\s\S]*?\];\n/g, '');
content = content.replace(/const ACTIVITIES = \[\s*\{[\s\S]*?\n\];\n/g, '');

// 3. Inject Component Logic
content = content.replace(
  /export default function ITActivitiesPage\(\) \{\n\s*const \[selectedActivity, setSelectedActivity\] = useState\(ACTIVITIES\[0\]\);/,
  `export default function ITActivitiesPage() {
  const [activitiesList, setActivitiesList] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [kpis, setKpis] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/activities');
        
        // Map raw data to UI format
        const formatted = res.data.map(act => {
          let typeColor = 'text-gray-600 bg-gray-50';
          let icon = <Activity size={16} className="text-gray-500" />;
          let iconBg = 'bg-gray-100';
          
          if (act.activity_type === 'Task') { icon = <Check size={16} className="text-green-500" />; iconBg = 'bg-green-100'; }
          else if (act.activity_type === 'Issue') { icon = <AlertCircle size={16} className="text-orange-500" />; iconBg = 'bg-orange-100'; }
          else if (act.activity_type === 'Comment') { icon = <MessageSquare size={16} className="text-purple-500" />; iconBg = 'bg-purple-100'; }
          else if (act.activity_type === 'Meeting') { icon = <Users size={16} className="text-blue-500" />; iconBg = 'bg-blue-100'; }

          return {
            id: act.id,
            title: act.title || 'System Activity',
            subtitle: act.description || 'General System Update',
            details: 'Status: ' + (act.status || 'N/A') + ' | Priority: ' + (act.priority || 'N/A'),
            user: { 
              name: act.created_by_name || 'System Auto', 
              avatar: \`https://ui-avatars.com/api/?name=\${encodeURIComponent(act.created_by_name || 'System')}&background=random\`, 
              time: new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
              date: new Date(act.created_at).toLocaleDateString() 
            },
            type: act.activity_type || 'Update',
            icon: icon,
            iconBg: iconBg,
            metadata: {
              module: act.activity_type || 'General',
              project: act.project_name || 'Global',
              task: act.task_name || null,
              fieldUpdated: 'General Update',
              oldValue: null,
              newValue: null,
              ipAddress: 'System',
              userAgent: 'System Backend',
              taskInfo: null
            }
          };
        });
        
        setActivitiesList(formatted);
        
        // Compute dynamic KPIs
        const total = formatted.length;
        const tasks = formatted.filter(a => a.type === 'Task').length;
        const issues = formatted.filter(a => a.type === 'Issue').length;
        const comments = formatted.filter(a => a.type === 'Comment').length;
        const meetings = formatted.filter(a => a.type === 'Meeting').length;
        
        setKpis([
          { icon: <Activity size={24} className="text-blue-500" />, count: total, label: 'All Activities', trend: '+0%', isPositive: true, bg: 'bg-blue-50' },
          { icon: <Check size={24} className="text-green-500" />, count: tasks, label: 'Tasks Updated', trend: '+0%', isPositive: true, bg: 'bg-green-50' },
          { icon: <AlertCircle size={24} className="text-orange-500" />, count: issues, label: 'Issues Updated', trend: '+0%', isPositive: true, bg: 'bg-orange-50' },
          { icon: <MessageSquare size={24} className="text-purple-500" />, count: comments, label: 'Comments', trend: '+0%', isPositive: true, bg: 'bg-purple-50' },
          { icon: <Users size={24} className="text-blue-500" />, count: meetings, label: 'Meetings', trend: '+0%', isPositive: true, bg: 'bg-blue-50' }
        ]);

      } catch (err) {
        console.error('Failed to fetch activities', err);
      }
    };
    fetchActivities();
  }, []);`
);

// 4. Update JSX to use new variables
content = content.replace(/KPIS/g, 'kpis');
content = content.replace(/ACTIVITIES/g, 'activitiesList');

// Update onClick to open the panel
content = content.replace(
  /onClick=\{[^\}]*setSelectedActivity[^\}]*\}/g,
  `onClick={() => { setSelectedActivity(activity); setIsPanelOpen(true); }}`
);

// Check if there are other click handlers (just to be safe)
// Actually the previous replace is robust for `onClick={() => setSelectedActivity(activity)}`
content = content.replace(
  /onClick=\{\(\) => setSelectedActivity\(activity\)\}/g,
  `onClick={() => { setSelectedActivity(activity); setIsPanelOpen(true); }}`
);

// Render the right panel conditionally
// In ITActivitiesPage, the right panel starts with: {/* Right Panel - Activity Details */}
// <div className="w-[320px] shrink-0">
content = content.replace(
  /\{\/\* Right Panel - Activity Details \*\/\}\n\s*<div className="w-\[320px\] shrink-0">/g,
  `{/* Right Panel - Activity Details */}
        {isPanelOpen && selectedActivity && (
          <div className="w-[320px] shrink-0 animate-slide-left">`
);

// Close the conditional rendering where the panel ends
content = content.replace(
  /              \{\/\* Task Information \(if applicable\) \*\/\}([\s\S]*?)<\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n\n      <\/div>\n    <\/div>/g,
  `              {/* Task Information (if applicable) */}$1</div>
            </div>
          </div>
        </div>
        )}

      </div>
      <style>{\`
        .animate-slide-left { animation: slideLeft 0.3s ease-out forwards; }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
      \`}</style>
    </div>`
);

// Fix the 'X' close button
content = content.replace(
  /<button className="text-gray-400 hover:text-gray-700"><X size=\{16\} \/><\/button>/g,
  `<button onClick={() => setIsPanelOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITActivitiesPage.js');
