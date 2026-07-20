const fs = require('fs');

let content = fs.readFileSync('server/routes/tasks-projects-routes.js', 'utf8');

const oldApiTasksBlock = `
  app.get('/api/tasks', async (req, res) => {
    try {
      const { department, user_id, role } = req.query;
      let sql = \`
        SELECT t.*, 
               u1.first_name as assigned_to_name, 
               u1.avatar as assigned_to_avatar
        FROM project_tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        WHERE 1=1
      \`;
      const params = [];

      // If not Admin/Super Admin, filter by user's assigned tasks
      if (role && role !== 'Admin' && role !== 'Super Admin') {
         // Assuming project_tasks has a project_id, and we can link that to department...
         // Actually, if it's an employee, just show tasks assigned to them
         sql += \` AND t.assigned_to = ? \`;
         params.push(user_id);
      }

      sql += \` ORDER BY t.created_at DESC\`;
      
      const [tasks] = await db.query(sql, params);
`;

const newApiTasksBlock = `
  app.get('/api/tasks', async (req, res) => {
    try {
      const { department, user_id, role } = req.query;
      let sql = \`
        SELECT t.*, 
               u1.first_name as assigned_to_name, 
               u1.avatar as assigned_to_avatar
        FROM project_tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN departments d ON p.department_id = d.id
        WHERE 1=1
      \`;
      const params = [];

      if (role && role !== 'Admin' && role !== 'Super Admin') {
         if (role.includes('Manager')) {
             // Managers see tasks for their department
             if (department) {
                 sql += \` AND (d.name = ? OR d.name IS NULL) \`;
                 params.push(department);
             }
         } else {
             // Regular employees only see tasks assigned to them
             sql += \` AND t.assigned_to = ? \`;
             params.push(user_id);
         }
      }

      sql += \` ORDER BY t.created_at DESC\`;
      
      const [tasks] = await db.query(sql, params);
`;

if (content.includes(oldApiTasksBlock.trim())) {
  content = content.replace(oldApiTasksBlock.trim(), newApiTasksBlock.trim());
  fs.writeFileSync('server/routes/tasks-projects-routes.js', content, 'utf8');
  console.log('Patched /api/tasks successfully.');
} else {
  console.log('Could not find the block to patch.');
}
