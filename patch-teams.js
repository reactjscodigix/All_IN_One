const fs = require('fs');
let content = fs.readFileSync('client/src/components/ITTeamsPage.js', 'utf8');

// 1. Calculate dynamic data
const dynamicDataLogic = `
  const totalUsers = users.length;
  const activeAssignments = teams.reduce((acc, t) => acc + (t.members ? t.members.length : 0), 0);
  
  // Dynamic Role Allocations
  const roleMap = {};
  users.forEach(u => {
    const r = u.job_title || u.role || 'Member';
    roleMap[r] = (roleMap[r] || 0) + 1;
  });
  const dynamicRoleAllocations = Object.entries(roleMap).map(([role, count]) => ({
    role,
    count,
    pct: totalUsers ? ((count / totalUsers) * 100).toFixed(2) + '%' : '0%'
  }));

  // Dynamic Workload Data (Mock mapping for now based on team assignments)
  const dynamicWorkloadData = totalUsers > 0 ? [
    { name: 'Overallocated', value: 0, color: '#ef4444', pct: '0%' },
    { name: 'High (80-100%)', value: Math.floor(totalUsers * 0.1), color: '#f59e0b', pct: '10%' },
    { name: 'Medium (50-79%)', value: Math.floor(totalUsers * 0.5), color: '#3b82f6', pct: '50%' },
    { name: 'Low (1-49%)', value: totalUsers - Math.floor(totalUsers * 0.6), color: '#22c55e', pct: '40%' }
  ] : [];
`;

// Remove mock data arrays
content = content.replace(
  /const workloadData = \[[\s\S]*?\];\s*const roleAllocations = \[[\s\S]*?\];\s*const mockUsers = \[[\s\S]*?\];\s*const mockProjects = \[[\s\S]*?\];/g,
  dynamicDataLogic
);

// Fallback in case the exact match fails
if (content.includes('const mockUsers = [')) {
  content = content.replace(/const mockUsers = \[\s*\{[\s\S]*?\];/g, '');
  content = content.replace(/const mockProjects = \[\s*\{[\s\S]*?\];/g, '');
  content = content.replace(/const workloadData = \[\s*\{[\s\S]*?\];/g, '');
  content = content.replace(/const roleAllocations = \[\s*\{[\s\S]*?\];/g, dynamicDataLogic);
}

// 2. Replace hardcoded KPI values with dynamic ones
content = content.replace(
  /\{ title: 'Total Team Members', val: '48',/g,
  "{ title: 'Total Team Members', val: totalUsers,"
);
content = content.replace(
  /\{ title: 'Total Projects', val: '42',/g,
  "{ title: 'Total Projects', val: projects.length,"
);
content = content.replace(
  /\{ title: 'Active Assignments', val: '68',/g,
  "{ title: 'Active Assignments', val: activeAssignments,"
);

// 3. Replace dataKey/data mappings in charts
content = content.replace(/workloadData/g, 'dynamicWorkloadData');
content = content.replace(/roleAllocations/g, 'dynamicRoleAllocations');

// 4. Replace mockUsers mapping
content = content.replace(/mockUsers\.map/g, 'users.map');

// 5. Replace mockProjects mapping
content = content.replace(/mockProjects\.map/g, 'projects.map');

// 6. Fix mapping properties for Users
// mockUsers had: u.name, u.role, u.skills, u.avail, u.color, u.avatar
// users has: u.first_name, u.last_name, u.email, u.job_title, u.avatar, u.role
content = content.replace(/u\.name/g, "(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User')");
content = content.replace(/u\.role/g, "(u.job_title || u.role || 'Member')");
content = content.replace(/u\.skills\.join\('/g, "([u.job_title || 'Skill'].join(')");
content = content.replace(/u\.skills/g, "([u.job_title || 'Skill'])");
content = content.replace(/u\.avail/g, "('100%')");
content = content.replace(/u\.color/g, "('text-blue-600')");
// Keep u.avatar as u.avatar, but add a fallback
content = content.replace(/src=\{u\.avatar\}/g, "src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name || 'U')}&background=random`}");

// 7. Fix mapping properties for Projects
// mockProjects had: p.name, p.code, p.pm, p.roles, p.start, p.end, p.prog, p.pmAvatar
// projects has: p.name, p.code, p.projectManager, p.start_date, p.end_date, p.progress
content = content.replace(/p\.pmAvatar/g, "(`https://ui-avatars.com/api/?name=${encodeURIComponent(p.projectManager || 'PM')}&background=random`)");
content = content.replace(/p\.pm/g, "(p.projectManager || 'Unassigned')");
content = content.replace(/p\.roles/g, "('Assigned Roles')");
content = content.replace(/p\.start/g, "(new Date(p.start_date || p.createdAt).toLocaleDateString())");
content = content.replace(/p\.end/g, "(p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Ongoing')");
content = content.replace(/p\.prog/g, "(p.progress || 0)");

fs.writeFileSync('client/src/components/ITTeamsPage.js', content, 'utf8');
console.log('Patched ITTeamsPage.js');
