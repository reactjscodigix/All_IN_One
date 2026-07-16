const fs = require('fs');
const path = 'client/src/components/ITTasksPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update fetchTasks to use kanban API and map fields
const fetchTasksNew = `const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/it-kanban/issues');
      if (res.ok) {
        const data = await res.json();
        // The list page expects some fields to be formatted slightly differently (e.g. summary instead of title, though we can use title)
        // But our ITIssueDetailsPanel expects issue.key and issue.title etc.
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  const updateIssue = async (key, updates) => {
    // Optimistic local update
    setTasks(prev => prev.map(t => t.issue_key === key || t.key === key ? { ...t, ...updates } : t));
    try {
      await fetch(\`http://localhost:5000/api/it-kanban/issues/\${key}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update issue', err);
    }
  };

  const deleteIssue = async (key) => {
    try {
      await fetch(\`http://localhost:5000/api/it-kanban/issues/\${key}\`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.issue_key !== key && t.key !== key));
      setSelectedIssue(null);
    } catch (err) {
      console.error('Failed to delete issue', err);
    }
  };
`;

content = content.replace(/const fetchTasks = async \(\) => \{[\s\S]*?console\.error\('Error fetching tasks', err\);\s*\}\s*\};/, fetchTasksNew);

// 2. Pass updateIssue and deleteIssue to ITIssueDetailsPanel
// We need to see how ITIssueDetailsPanel is rendered in ITTasksPage.js
content = content.replace(/<ITIssueDetailsPanel\s+issue=\{selectedIssueData\}\s+onClose=\{/, `<ITIssueDetailsPanel
              issue={selectedIssueData}
              updateIssue={updateIssue}
              deleteIssue={deleteIssue}
              onClose={`
);

// 3. Pass onIssueCreated to ITCreateIssueDrawer
content = content.replace(/<ITCreateIssueDrawer isOpen=\{isCreateDrawerOpen\} onClose=\{/, `<ITCreateIssueDrawer isOpen={isCreateDrawerOpen} onIssueCreated={fetchTasks} onClose={`
);


fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITTasksPage.js');
