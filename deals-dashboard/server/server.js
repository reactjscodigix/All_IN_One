const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const PORT = process.env.PORT || 5000;

const pool = require('./config/database');
const { testConnection } = require('./database/init');
const { hashPassword, checkPermission } = require('./middleware/helpers');
const automationService = require('./services/automationService');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('etag', false);
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

console.log(`Server running in ${NODE_ENV} mode`);
console.log(`Database: ${process.env.DB_HOST}/${process.env.DB_NAME}`);
console.log(`Port: ${PORT}`);

// Auth Routes Router
const authRouter = express.Router();

authRouter.get('/login', (req, res) => {
  console.log('GET /api/auth/login hit');
  res.json({ message: 'Login GET endpoint is working' });
});

authRouter.post('/login', async (req, res) => {
  console.log('POST /api/auth/login hit:', req.body.email);
  console.log('Headers:', req.headers);
  let connection;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const hashedPassword = hashPassword(password);

    if (hashedPassword !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

authRouter.post('/signup', async (req, res) => {
  let connection;
  try {
    const { first_name, last_name, email, password, phone, company, department } = req.body;
    let { username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!username) {
      username = email.split('@')[0];
    }

    connection = await pool.getConnection();

    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = hashPassword(password);

    let role_id = 5; // Default to Employee
    if (req.body.role_name) {
      const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', [req.body.role_name]);
      if (roles.length > 0) {
        role_id = roles[0].id;
      }
    }

    const [result] = await connection.query(
      'INSERT INTO users (first_name, last_name, email, username, password, phone1, location, role_id, status, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name || 'User', last_name || '', email, username, hashedPassword, phone || '', company || '', role_id, 'Active', department || null]
    );

    const [newUser] = await connection.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [result.insertId]
    );

    const { password: _, ...userWithoutPassword } = newUser[0];
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

authRouter.post('/update-role', async (req, res) => {
  let connection;
  try {
    const { email, role_name } = req.body;
    if (!email || !role_name) {
      return res.status(400).json({ error: 'Email and role_name required' });
    }

    connection = await pool.getConnection();
    const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', [role_name]);
    if (roles.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const role_id = roles[0].id;
    await connection.query('UPDATE users SET role_id = ? WHERE email = ?', [role_id, email]);
    
    res.json({ success: true, message: `User ${email} role updated to ${role_name}` });
  } catch (error) {
    console.error('Update role error:', error.message);
    res.status(500).json({ error: 'Failed to update role', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

authRouter.post('/check-permission', async (req, res) => {
  try {
    const { userId, module, action } = req.body;
    const hasPermission = await checkPermission(userId, module, action);
    res.json({ success: true, hasPermission });
  } catch (error) {
    console.error('Permission check error:', error.message);
    res.status(500).json({ error: 'Failed to check permission', details: error.message });
  }
});

// Register Auth Router
app.use('/api/auth', authRouter);

app.get('/api/roles', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [roles] = await connection.query('SELECT * FROM roles');
    connection.release();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ error: 'Failed to fetch roles', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/roles/:roleId/permissions', async (req, res) => {
  let connection;
  try {
    const { roleId } = req.params;
    connection = await pool.getConnection();
    const [permissions] = await connection.query('SELECT * FROM permissions WHERE role_id = ?', [roleId]);
    connection.release();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error.message);
    res.status(500).json({ error: 'Failed to fetch permissions', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/roles/:roleId/permissions', async (req, res) => {
  let connection;
  try {
    const { roleId } = req.params;
    const { module_name, can_create, can_read, can_update, can_delete } = req.body;

    connection = await pool.getConnection();
    
    await connection.query(
      'INSERT INTO permissions (role_id, module_name, can_create, can_read, can_update, can_delete) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE can_create=?, can_read=?, can_update=?, can_delete=?',
      [roleId, module_name, can_create, can_read, can_update, can_delete, can_create, can_read, can_update, can_delete]
    );

    connection.release();
    res.json({ success: true, message: 'Permission updated successfully' });
  } catch (error) {
    console.error('Error updating permission:', error.message);
    res.status(500).json({ error: 'Failed to update permission', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/auth/check-permission', async (req, res) => {
  try {
    const { userId, module, action } = req.body;

    const hasPermission = await checkPermission(userId, module, action);

    res.json({ 
      success: true,
      hasPermission
    });

  } catch (error) {
    console.error('Permission check error:', error.message);
    res.status(500).json({ error: 'Failed to check permission', details: error.message });
  }
});

const setupEntitiesRoutes = require('./routes/entities-routes');
const setupActivitiesNotesRoutes = require('./routes/activities-notes-routes');
const setupTasksProjectsRoutes = require('./routes/tasks-projects-routes');
const setupEstimationsPipelineFilesRoutes = require('./routes/estimations-pipeline-files-routes');
const setupLeadsDealsRolesRoutes = require('./routes/leads-deals-roles-routes');
const setupInvoicesCampaignsCallsRoutes = require('./routes/invoices-campaigns-calls-routes');
const setupFilesConversationsRoutes = require('./routes/files-conversations-routes');
const setupAutomationRoutes = require('./routes/automation-routes');
const setupApprovalRoutes = require('./routes/approval-routes');
const setupPerformanceRoutes = require('./routes/performance-routes');
const setupReminderRoutes = require('./routes/reminder-routes');
const setupRBACRoutes = require('./routes/rbac-routes');
const setupReportingRoutes = require('./routes/reporting-routes');
const setupDepartmentDashboardRoutes = require('./routes/department-dashboard-routes');
const setupMarketingITWorkflowRoutes = require('./routes/marketing-it-workflow-routes');
const setupFollowupsRoutes = require('./routes/followups-routes');

setupEntitiesRoutes(app, pool);
setupActivitiesNotesRoutes(app, pool);
setupTasksProjectsRoutes(app, pool);
setupEstimationsPipelineFilesRoutes(app, pool);
setupLeadsDealsRolesRoutes(app, pool);
setupInvoicesCampaignsCallsRoutes(app, pool);
setupFilesConversationsRoutes(app, pool);
setupAutomationRoutes(app, pool);
setupApprovalRoutes(app, pool);
setupPerformanceRoutes(app, pool);
setupReminderRoutes(app, pool);
setupRBACRoutes(app, pool);
setupReportingRoutes(app, pool);
setupDepartmentDashboardRoutes(app, pool);
setupMarketingITWorkflowRoutes(app, pool);
setupFollowupsRoutes(app, pool);

app.get('/', (req, res) => {
  res.send('CRM Backend API is running!');
});

app.use((req, res) => {
  console.log(`404 at ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

const server = app.listen(PORT, async () => {
  console.log('================================================');
  console.log(`🚀 CRM Backend Server is now LIVE!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔐 CORS allowed for: ${process.env.CORS_ORIGIN}`);
  console.log('================================================');
  await testConnection();
  
  // Schedule automation checks every hour
  setInterval(async () => {
    console.log('\n⏰ Running scheduled automation checks...');
    await automationService.runAllChecks();
  }, 60 * 60 * 1000);
  
  console.log('✓ Automation checks scheduled (runs hourly)');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;
