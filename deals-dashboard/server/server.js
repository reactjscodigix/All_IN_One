const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

const app = express();
const PORT = process.env.PORT || 5000;

const pool = require('./config/database');
const { testConnection } = require('./database/init');
const { hashPassword, checkPermission } = require('./middleware/helpers');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

console.log(`Server running in ${NODE_ENV} mode`);
console.log(`Database: ${process.env.DB_HOST}/${process.env.DB_NAME}`);
console.log(`Port: ${PORT}`);

app.post('/api/auth/login', async (req, res) => {
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
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const hashedPassword = hashPassword(password);

    if (hashedPassword !== user.password) {
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    connection.release();

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/auth/signup', async (req, res) => {
  let connection;
  try {
    const { first_name, last_name, email, username, password, phone1, location } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username and password required' });
    }

    connection = await pool.getConnection();

    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = hashPassword(password);

    const [result] = await connection.query(
      'INSERT INTO users (first_name, last_name, email, username, password, phone1, location, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name || 'User', last_name || '', email, username, hashedPassword, phone1 || '', location || '', 5, 'Active']
    );

    const [newUser] = await connection.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [result.insertId]
    );

    connection.release();

    const { password: _, ...userWithoutPassword } = newUser[0];
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

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

setupEntitiesRoutes(app, pool);
setupActivitiesNotesRoutes(app, pool);
setupTasksProjectsRoutes(app, pool);
setupEstimationsPipelineFilesRoutes(app, pool);
setupLeadsDealsRolesRoutes(app, pool);
setupInvoicesCampaignsCallsRoutes(app, pool);
setupFilesConversationsRoutes(app, pool);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

const server = app.listen(PORT, async () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${NODE_ENV}`);
  console.log(`✓ CORS origin: ${process.env.CORS_ORIGIN}`);
  await testConnection();
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
