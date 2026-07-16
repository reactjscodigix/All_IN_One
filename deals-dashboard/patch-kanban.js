const fs = require('fs');

const path = 'client/src/components/ITKanbanPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove localStorage init, set default boardData
content = content.replace(/const \[boardData, setBoardData\] = useState\(\(\) => \{[\s\S]*?\}\);/, `const [boardData, setBoardData] = useState({
    'TO DO': [],
    'IN PROGRESS': [],
    'IN REVIEW': [],
    'TESTING': [],
    'DONE': []
  });`);

// 2. Add useEffect for fetching
const fetchEffect = `
  useEffect(() => {
    fetch('http://localhost:5000/api/it-kanban/issues')
      .then(res => res.json())
      .then(data => {
        const newBoard = {
          'TO DO': [],
          'IN PROGRESS': [],
          'IN REVIEW': [],
          'TESTING': [],
          'DONE': []
        };
        // Add dynamic columns if they exist
        columnOrder.forEach(col => {
          if (!newBoard[col]) newBoard[col] = [];
        });
        
        data.forEach(issue => {
          const col = issue.status || 'TO DO';
          if (!newBoard[col]) newBoard[col] = [];
          newBoard[col].push({
            key: issue.issue_key,
            title: issue.title,
            type: issue.type,
            priority: issue.priority,
            status: issue.status,
            assignee: issue.assignee,
            reporter: issue.reporter,
            sprint: issue.sprint,
            due_date: issue.due_date,
            start_date: issue.start_date,
            description: issue.description,
            subtasks: issue.subtasks,
            linked_issues: issue.linked_issues,
            comments: issue.comments
          });
        });
        setBoardData(newBoard);
      })
      .catch(err => console.error('Error fetching kanban data:', err));
  }, []); // Run on mount
`;

// Insert after columnOrder state
content = content.replace(/const \[columnOrder, setColumnOrder\] = useState\(\(\) => \{[\s\S]*?\}\);/, `const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('kanbanColumnOrder');
    return saved ? JSON.parse(saved) : Object.keys(INITIAL_KANBAN_DATA);
  });
${fetchEffect}
`);

// 3. Remove localStorage saves for boardData
content = content.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('kanbanBoardData'[\s\S]*?\}, \[boardData\]\);/, '');

// 4. Update handleCreateInlineIssue to use actual POST API
const postLogic = `
  const handleCreateInlineIssue = async (col) => {
    if (!newIssueTitle.trim()) return;
    
    const assigneeVal = newIssueAssignee === 'Unassigned' || newIssueAssignee === 'Automatic' ? 'Unassigned' : newIssueAssignee;
    
    try {
      const res = await fetch('http://localhost:5000/api/it-kanban/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newIssueTitle,
          type: newIssueType,
          status: col,
          assignee: assigneeVal,
          priority: 'Medium'
        })
      });
      const data = await res.json();
      
      const newCard = {
        key: data.issue_key,
        title: newIssueTitle,
        type: newIssueType,
        status: col,
        assignee: assigneeVal,
        priority: 'Medium',
        labels: ['IT'],
        sprint: 'Sprint 1',
        subtasks: [],
        linked_issues: [],
        comments: []
      };

      setBoardData(prev => ({
        ...prev,
        [col]: [...(prev[col] || []), newCard]
      }));

      setNewIssueTitle('');
      setNewIssueType('Task');
      setNewIssueAssignee('Unassigned');
      setNewIssueDueDate('');
      setActiveCreateColumn(null);
      setOpenInlineDropdown(null);
    } catch (err) {
      console.error('Failed to save inline task', err);
    }
  };
`;

content = content.replace(/const handleCreateInlineIssue = \(col\) => \{[\s\S]*?catch\(err => console\.error\('Failed to save inline task', err\)\);\s*\};/, postLogic);

// 5. Update onDragEnd to PUT to backend
content = content.replace(/setBoardData\(\{\s*\.\.\.boardData,\s*\[source\.droppableId\]: sourceCol,\s*\[destination\.droppableId\]: destCol\s*\}\);/, `setBoardData({
        ...boardData,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol
      });
      // Fire API
      fetch(\`http://localhost:5000/api/it-kanban/issues/\${removed.key}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId })
      }).catch(err => console.error('Failed to update status', err));`);

content = content.replace(/setBoardData\(\{\s*\.\.\.boardData,\s*\[source\.droppableId\]: col\s*\}\);/, `setBoardData({
        ...boardData,
        [source.droppableId]: col
      });`);


// 6. Add updateIssue function and pass to ITIssueDetailsPanel
const updateIssueFunc = `
  const updateIssue = async (key, updates) => {
    // Optimistic update locally
    setBoardData(prev => {
      const next = { ...prev };
      let foundCol = null;
      let foundIdx = -1;
      
      // Find issue
      for (const col of Object.keys(next)) {
        const idx = next[col].findIndex(c => c.key === key);
        if (idx !== -1) {
          foundCol = col;
          foundIdx = idx;
          break;
        }
      }
      
      if (foundCol && foundIdx !== -1) {
        const issue = next[foundCol][foundIdx];
        const updatedIssue = { ...issue, ...updates };
        
        // If status changed, move to new column
        if (updates.status && updates.status !== foundCol) {
          next[foundCol].splice(foundIdx, 1);
          if (!next[updates.status]) next[updates.status] = [];
          next[updates.status].push(updatedIssue);
        } else {
          next[foundCol][foundIdx] = updatedIssue;
        }
        
        // Update selectedIssueData reference if it's currently open
        if (selectedIssue === key) {
           // React will re-render and selectedIssueData will be computed correctly from boardData
        }
      }
      return next;
    });

    try {
      await fetch(\`http://localhost:5000/api/it-kanban/issues/\${key}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update issue in DB', err);
    }
  };
`;

content = content.replace(/const onDragEnd = \(result\) => \{/, `${updateIssueFunc}\n  const onDragEnd = (result) => {`);

// Pass updateIssue to ITIssueDetailsPanel
content = content.replace(/<ITIssueDetailsPanel\s+issue=\{selectedIssueData\}\s+onClose=\{/, `<ITIssueDetailsPanel
              issue={selectedIssueData}
              updateIssue={updateIssue}
              onClose={`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITKanbanPage.js');
