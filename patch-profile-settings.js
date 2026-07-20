const fs = require('fs');
const path = 'client/src/components/ProfileSettingsPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Import dependencies
if (!content.includes('import axios')) {
  content = content.replace(
    /import React, \{ useState, useRef \} from 'react';/g,
    `import React, { useState, useRef, useEffect } from 'react';\nimport axios from 'axios';\nimport { useAuth } from '../hooks/useAuth';`
  );
}

// 2. Remove all `initial*` mocks
const mockRemovalPatterns = [
  /const initialTickets = \[\s*\{[\s\S]*?\];/g,
  /const initialProjects = \[\s*\{[\s\S]*?\];/g,
  /const initialTasks = \[\s*\{[\s\S]*?\];/g,
  /const initialActivities = \[\s*\{[\s\S]*?\];/g
];

mockRemovalPatterns.forEach(pattern => {
  content = content.replace(pattern, '');
});

// 3. Inject useAuth and replace the profile default state
content = content.replace(
  /const ProfileSettingsPage = \(\) => \{\n  const \[activeTab, setActiveTab\] = useState\('Overview'\);/g,
  `const ProfileSettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');`
);

content = content.replace(
  /const \[profile, setProfile\] = useState\(\{[\s\S]*?\}\);/g,
  `const [profile, setProfile] = useState({
    id: user?.id || 1,
    firstName: user?.first_name || user?.name?.split(' ')[0] || 'User',
    lastName: user?.last_name || user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone1 || user?.phone || '',
    location: user?.location || 'Unknown',
    role: user?.role_name || user?.designation || 'Staff',
    department: user?.department || 'General',
    reportsTo: 'Admin',
    teamSize: 'N/A',
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
    memberDuration: 'Active',
    tags: ['Team Member'],
    avatarUrl: user?.avatar || 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-21.jpg',
    bio: 'Professional bio not set.',
    jobTitle: user?.role_name || 'Staff',
    company: 'Enterprise'
  });`
);

// 4. Modify state initialization to start as empty arrays
content = content.replace(/useState\(initialTickets\)/g, `useState([])`);
content = content.replace(/useState\(initialProjects\)/g, `useState([])`);
content = content.replace(/useState\(initialTasks\)/g, `useState([])`);
content = content.replace(/useState\(initialActivities\)/g, `useState([])`);

// 5. Inject useEffect to fetch data
content = content.replace(
  /const fileInputRef = useRef\(null\);/g,
  `const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id || 1,
        firstName: user.first_name || user.name?.split(' ')[0] || 'User',
        lastName: user.last_name || user.name?.split(' ')[1] || '',
        email: user.email || '',
        phone: user.phone1 || user.phone || '',
        location: user.location || 'Unknown',
        role: user.role_name || user.designation || 'Staff',
        department: user.department || 'General',
        reportsTo: 'Admin',
        teamSize: 'N/A',
        memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
        memberDuration: 'Active',
        tags: ['Team Member'],
        avatarUrl: user.avatar || 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-21.jpg',
        bio: 'Professional bio not set.',
        jobTitle: user.role_name || 'Staff',
        company: 'Enterprise'
      });
      setEditForm({
        id: user.id || 1,
        firstName: user.first_name || user.name?.split(' ')[0] || 'User',
        lastName: user.last_name || user.name?.split(' ')[1] || '',
        email: user.email || '',
        phone: user.phone1 || user.phone || '',
        location: user.location || 'Unknown',
        role: user.role_name || user.designation || 'Staff',
        department: user.department || 'General',
        reportsTo: 'Admin',
        teamSize: 'N/A',
        memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
        memberDuration: 'Active',
        tags: ['Team Member'],
        avatarUrl: user.avatar || 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-21.jpg',
        bio: 'Professional bio not set.',
        jobTitle: user.role_name || 'Staff',
        company: 'Enterprise'
      });
    }

    const fetchData = async () => {
      try {
        const [projRes, tasksRes, issuesRes, activitiesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/projects').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/tasks').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/it-kanban/issues').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/activities').catch(() => ({ data: [] }))
        ]);
        
        setProjects(projRes.data.map(p => ({
          name: p.name || 'Unnamed Project',
          status: p.status || 'Active',
          progress: p.progress || 0,
          startDate: p.start_date ? new Date(p.start_date).toLocaleDateString() : '-',
          dueDate: p.end_date ? new Date(p.end_date).toLocaleDateString() : '-',
          manager: p.project_manager || 'Admin',
          avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-02.jpg'
        })));

        setTasks(tasksRes.data.map(t => ({
          name: t.title || 'Unnamed Task',
          project: t.project || 'General',
          status: t.status || 'To Do',
          priority: t.priority || 'Medium',
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : '-',
          assignedTo: t.assigned_to || 'Unassigned',
          avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-02.jpg'
        })));

        setTickets(issuesRes.data.map(i => ({
          id: \`#IT-\${i.id}\`,
          subject: i.title || 'No Title',
          status: i.status || 'Open',
          priority: i.priority || 'Medium',
          category: i.category || 'General',
          assignedTo: i.assigned_to || 'Unassigned',
          avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-02.jpg',
          createdAt: i.created_at ? new Date(i.created_at).toLocaleDateString() : '-'
        })));

        setActivities(activitiesRes.data.map(a => ({
          id: a.id,
          user: a.created_by || 'System',
          action: a.action || 'performed an action',
          target: a.details || 'on a record',
          time: new Date(a.created_at).toLocaleString(),
          type: a.activity_type || 'system'
        })));

      } catch (err) {
        console.error('Failed to fetch profile data', err);
      }
    };
    fetchData();
  }, [user]);`
);

// 6. Fix handleProfileUpdate to use Axios PUT
content = content.replace(
  /const handleProfileUpdate = \(e\) => \{\n    e\.preventDefault\(\);\n    setProfile\(\{[\s\S]*?\}\);\n    showSuccessToast\('Profile details updated successfully!'\);\n    setActiveTab\('Overview'\);\n  \};/g,
  `const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      if (user && user.id) {
        await axios.put(\`http://localhost:5000/api/users/\${user.id}\`, {
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          email: editForm.email,
          phone1: editForm.phone,
          location: editForm.location,
          department: editForm.department,
          avatar: editForm.avatarUrl
        });
      }
      setProfile({
        ...profile,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        location: editForm.location,
        bio: editForm.bio,
        jobTitle: editForm.jobTitle,
        department: editForm.department
      });
      showSuccessToast('Profile details updated successfully!');
      setActiveTab('Overview');
    } catch (err) {
      console.error('Failed to update profile', err);
      showSuccessToast('Failed to update profile!');
    }
  };`
);

fs.writeFileSync(path, content, 'utf8');
console.log('ProfileSettingsPage patched successfully.');
