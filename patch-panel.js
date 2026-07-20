const fs = require('fs');

const path = 'client/src/components/ITIssueDetailsPanel.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add updateIssue to props
content = content.replace(/const ITIssueDetailsPanel = \(\{\s*issue,\s*onClose\s*\}\) => \{/, 'const ITIssueDetailsPanel = ({ issue, updateIssue, onClose }) => {');

// 2. Sync subtasks, linkedIssues, comments from issue prop
content = content.replace(/setSubtasks\(\[\s*\{\s*id:\s*1[\s\S]*?\]\);/, 'setSubtasks([]);');
content = content.replace(/setLinkedIssues\(\[\s*\{\s*relation:\s*'is blocked by'[\s\S]*?\]\);/, 'setLinkedIssues([]);');
content = content.replace(/setComments\(\[\s*\{\s*id:\s*1[\s\S]*?\]\);/, 'setComments([]);');

// Update useEffect to sync these arrays
const syncArrays = `
      setSubtasks(issue.subtasks || []);
      setLinkedIssues(issue.linked_issues || []);
      setComments(issue.comments || []);
      setDescription(issue.description || 'Add a description...');
`;
content = content.replace(/setDescription\(issue\.description \|\| 'Add a description\.\.\.'\);/, syncArrays);


// 3. Helper to update local and remote
const helper = `
  const handleUpdate = (updates) => {
    if (updateIssue && issue) {
      updateIssue(issue.key, updates);
    }
  };
`;
// Insert helper after the useStates
content = content.replace(/const commentInputRef = useRef\(null\);/, `const commentInputRef = useRef(null);\n${helper}`);


// 4. Update specific actions to call handleUpdate

// Title
content = content.replace(/setTitle\(tempTitle\);\s*setIsEditingTitle\(false\);/, `setTitle(tempTitle); setIsEditingTitle(false); handleUpdate({ title: tempTitle });`);

// Status (in header)
content = content.replace(/setCurrentStatus\(status\);\s*setOpenDropdown\(null\);/g, `setCurrentStatus(status); setOpenDropdown(null); handleUpdate({ status });`);

// Assignee
content = content.replace(/setAssignee\(u\);\s*setOpenDropdown\(null\);/g, `setAssignee(u); setOpenDropdown(null); handleUpdate({ assignee: u.name });`);

// Reporter
content = content.replace(/setReporter\(u\);\s*setOpenDropdown\(null\);/g, `setReporter(u); setOpenDropdown(null); handleUpdate({ reporter: u.name });`);

// Priority
content = content.replace(/setPriority\(p\);\s*setOpenDropdown\(null\);/g, `setPriority(p); setOpenDropdown(null); handleUpdate({ priority: p });`);

// Type
content = content.replace(/setType\(t\);\s*setOpenDropdown\(null\);/g, `setType(t); setOpenDropdown(null); handleUpdate({ type: t });`);

// Description
content = content.replace(/setDescription\(tempDescription\);\s*setIsEditingDescription\(false\);/, `setDescription(tempDescription); setIsEditingDescription(false); handleUpdate({ description: tempDescription });`);

// Add subtask
const addSubtaskOld = `const newSubtasks = [...subtasks, { id: Date.now(), title: newSubtaskTitle, completed: false }];
    setSubtasks(newSubtasks);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);`;
const addSubtaskNew = `const newSubtasks = [...subtasks, { id: Date.now(), title: newSubtaskTitle, completed: false }];
    setSubtasks(newSubtasks);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
    handleUpdate({ subtasks: newSubtasks });`;
content = content.replace(addSubtaskOld, addSubtaskNew);

// Toggle subtask
const toggleSubtaskOld = `const newSubtasks = subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st);
    setSubtasks(newSubtasks);`;
const toggleSubtaskNew = `const newSubtasks = subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st);
    setSubtasks(newSubtasks);
    handleUpdate({ subtasks: newSubtasks });`;
content = content.replace(toggleSubtaskOld, toggleSubtaskNew);

// Delete subtask
const deleteSubtaskOld = `const newSubtasks = subtasks.filter(st => st.id !== id);
    setSubtasks(newSubtasks);`;
const deleteSubtaskNew = `const newSubtasks = subtasks.filter(st => st.id !== id);
    setSubtasks(newSubtasks);
    handleUpdate({ subtasks: newSubtasks });`;
content = content.replace(deleteSubtaskOld, deleteSubtaskNew);

// Add Linked Issue
const addLinkedOld = `const newLinks = [...linkedIssues, { key: linkSearchInput, relation: linkRelation, title: 'New linked issue' }];
    setLinkedIssues(newLinks);
    setIsLinkingIssue(false);
    setLinkSearchInput('');`;
const addLinkedNew = `const newLinks = [...linkedIssues, { key: linkSearchInput, relation: linkRelation, title: 'New linked issue' }];
    setLinkedIssues(newLinks);
    setIsLinkingIssue(false);
    setLinkSearchInput('');
    handleUpdate({ linked_issues: newLinks });`;
content = content.replace(addLinkedOld, addLinkedNew);

// Delete Linked Issue
const delLinkedOld = `const newLinks = linkedIssues.filter(l => l.key !== key);
    setLinkedIssues(newLinks);`;
const delLinkedNew = `const newLinks = linkedIssues.filter(l => l.key !== key);
    setLinkedIssues(newLinks);
    handleUpdate({ linked_issues: newLinks });`;
content = content.replace(delLinkedOld, delLinkedNew);

// Add Comment
const addCommentOld = `const newComments = [
      ...comments,
      { id: Date.now(), author: 'Current User', initial: 'CU', color: 'bg-purple-100 text-purple-700', text: newCommentText, date: 'Just now' }
    ];
    setComments(newComments);
    setNewCommentText('');
    setIsCommenting(false);`;
const addCommentNew = `const newComments = [
      ...comments,
      { id: Date.now(), author: 'Current User', initial: 'CU', color: 'bg-purple-100 text-purple-700', text: newCommentText, date: 'Just now' }
    ];
    setComments(newComments);
    setNewCommentText('');
    setIsCommenting(false);
    handleUpdate({ comments: newComments });`;
content = content.replace(addCommentOld, addCommentNew);


fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITIssueDetailsPanel.js');
