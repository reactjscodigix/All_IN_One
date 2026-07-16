const fs = require('fs');
const path = 'client/src/components/ITCreateIssueDrawer.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update component props to include onIssueCreated
content = content.replace(/const ITCreateIssueDrawer = \(\{\s*isOpen,\s*onClose\s*\}\) => \{/, 'const ITCreateIssueDrawer = ({ isOpen, onClose, onIssueCreated }) => {');

// 2. Replace handleSubmit with actual fetch
const fetchSubmit = `const handleSubmit = async () => {
    if (!formData.summary) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Summary is required.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        title: formData.summary,
        type: formData.workType || 'Task',
        status: formData.status === 'To Do' ? 'TO DO' : formData.status || 'TO DO',
        assignee: formData.assignee ? (formData.assignee.name || formData.assignee.first_name || 'Unassigned') : 'Unassigned',
        priority: 'Medium',
        description: formData.description || ''
      };

      const res = await fetch('http://localhost:5000/api/it-kanban/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to create issue');
      
      Swal.fire({
        icon: 'success',
        title: 'Ticket Created',
        text: \`Task "\${formData.summary}" created successfully!\`,
        timer: 2000,
        showConfirmButton: false
      });
      
      if (onIssueCreated) onIssueCreated();
      
      if (!formData.createAnother) {
        onClose();
      } else {
        setFormData(prev => ({ ...prev, summary: '', description: '', labels: [] }));
        if (editorRef.current) editorRef.current.innerHTML = "";
        setAttachedFiles([]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create issue.' });
    } finally {
      setIsSubmitting(false);
    }
  };`;

content = content.replace(/const handleSubmit = async \(\) => \{[\s\S]*?\}, 800\);\s*\};/, fetchSubmit);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITCreateIssueDrawer.js');
