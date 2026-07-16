const fs = require('fs');
let content = fs.readFileSync('server/routes/leads-deals-roles-routes.js', 'utf8');

// Patch Leads API
const oldLeadsApi = `
  app.get('/api/leads', async (req, res) => {
    try {
      const { status, source, owner_id, skip = 0, limit = 50 } = req.query;
      
      let query = \`SELECT 
        l.*,
        u.first_name AS owner_first_name,
        u.last_name AS owner_last_name
      FROM leads l
      LEFT JOIN users u ON u.id = l.owner_id
      WHERE 1=1\`;
      const params = [];
`;
const newLeadsApi = `
  app.get('/api/leads', async (req, res) => {
    try {
      const { status, source, owner_id, skip = 0, limit = 50, user_id, role, department } = req.query;
      
      let query = \`SELECT 
        l.*,
        u.first_name AS owner_first_name,
        u.last_name AS owner_last_name
      FROM leads l
      LEFT JOIN users u ON u.id = l.owner_id
      LEFT JOIN service_categories sc ON l.service_category_id = sc.id
      LEFT JOIN departments d ON sc.suggested_department_id = d.id
      WHERE 1=1\`;
      const params = [];

      // Filter by role/department
      if (role && role !== 'Admin' && role !== 'Super Admin') {
         if (role.includes('Manager')) {
             if (department) {
                 query += \` AND (d.name = ? OR d.name IS NULL) \`;
                 params.push(department);
             }
         } else {
             query += \` AND l.owner_id = ? \`;
             params.push(user_id);
         }
      }
`;
if (content.includes(oldLeadsApi.trim())) {
  content = content.replace(oldLeadsApi.trim(), newLeadsApi.trim());
}

// Patch Deals API
const oldDealsApi = `
  app.get('/api/deals', async (req, res) => {
    try {
      const { status, category_id, assigned_to, skip = 0, limit = 50 } = req.query;
      
      let query = \`SELECT 
        d.*,
        u.first_name AS assigned_to_first_name,
        u.last_name AS assigned_to_last_name,
        sc.name AS category_name
      FROM deals d
      LEFT JOIN users u ON u.id = d.assigned_to
      LEFT JOIN service_categories sc ON sc.id = d.service_category_id
      WHERE 1=1\`;
      const params = [];
`;
const newDealsApi = `
  app.get('/api/deals', async (req, res) => {
    try {
      const { status, category_id, assigned_to, skip = 0, limit = 50, user_id, role, department } = req.query;
      
      let query = \`SELECT 
        d.*,
        u.first_name AS assigned_to_first_name,
        u.last_name AS assigned_to_last_name,
        sc.name AS category_name
      FROM deals d
      LEFT JOIN users u ON u.id = d.assigned_to
      LEFT JOIN service_categories sc ON sc.id = d.service_category_id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE 1=1\`;
      const params = [];

      // Filter by role/department
      if (role && role !== 'Admin' && role !== 'Super Admin') {
         if (role.includes('Manager')) {
             if (department) {
                 query += \` AND (dept.name = ? OR dept.name IS NULL) \`;
                 params.push(department);
             }
         } else {
             query += \` AND d.assigned_to = ? \`;
             params.push(user_id);
         }
      }
`;
if (content.includes(oldDealsApi.trim())) {
  content = content.replace(oldDealsApi.trim(), newDealsApi.trim());
}

// Patch Projects API
const oldProjectsApi = `
  app.get('/api/projects', async (req, res) => {
    try {
      const { status, client_id, manager_id, skip = 0, limit = 50 } = req.query;
      
      let query = \`SELECT 
        p.*,
        u.first_name AS manager_first_name,
        u.last_name AS manager_last_name,
        c.company_name AS client_name
      FROM projects p
      LEFT JOIN users u ON u.id = p.project_manager_id
      LEFT JOIN companies c ON c.id = p.client_id
      WHERE 1=1\`;
      const params = [];
`;
const newProjectsApi = `
  app.get('/api/projects', async (req, res) => {
    try {
      const { status, client_id, manager_id, skip = 0, limit = 50, user_id, role, department } = req.query;
      
      let query = \`SELECT 
        p.*,
        u.first_name AS manager_first_name,
        u.last_name AS manager_last_name,
        c.company_name AS client_name
      FROM projects p
      LEFT JOIN users u ON u.id = p.project_manager_id
      LEFT JOIN companies c ON c.id = p.client_id
      LEFT JOIN departments d ON p.department_id = d.id
      WHERE 1=1\`;
      const params = [];

      // Filter by role/department
      if (role && role !== 'Admin' && role !== 'Super Admin') {
         if (role.includes('Manager')) {
             if (department) {
                 query += \` AND (d.name = ? OR d.name IS NULL) \`;
                 params.push(department);
             }
         } else {
             query += \` AND p.project_manager_id = ? \`;
             params.push(user_id);
         }
      }
`;
if (content.includes(oldProjectsApi.trim())) {
  content = content.replace(oldProjectsApi.trim(), newProjectsApi.trim());
}

fs.writeFileSync('server/routes/leads-deals-roles-routes.js', content, 'utf8');
console.log('Patched leads-deals-roles-routes.js successfully.');
