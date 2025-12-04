const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

const app = express();

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

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log(`Server running in ${NODE_ENV} mode`);
console.log(`Database: ${process.env.DB_HOST}/${process.env.DB_NAME}`);

async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        email_opt_out BOOLEAN DEFAULT FALSE,
        password VARCHAR(255) NOT NULL,
        phone1 VARCHAR(20),
        phone1_country VARCHAR(5) DEFAULT 'US',
        phone2 VARCHAR(20),
        phone2_country VARCHAR(5) DEFAULT 'US',
        location VARCHAR(100),
        avatar LONGTEXT,
        role_id INT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_status (status),
        INDEX idx_role_id (role_id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        module_name VARCHAR(100) NOT NULL,
        can_create BOOLEAN DEFAULT FALSE,
        can_read BOOLEAN DEFAULT FALSE,
        can_update BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_module_per_role (role_id, module_name),
        INDEX idx_role_id (role_id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS delete_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS general_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        status ENUM('Open', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Open',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        assigned_to JSON,
        due_date DATE,
        tags JSON,
        linked_type ENUM('General', 'Deal', 'Project') DEFAULT 'General',
        linked_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_due_date (due_date),
        INDEX idx_linked_type (linked_type),
        INDEX idx_linked_id (linked_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        client_id INT NOT NULL,
        contact_id INT,
        deal_id INT,
        created_by INT,
        status ENUM('Draft', 'Submitted', 'Approved', 'Rejected', 'Sent', 'Accepted', 'Declined') DEFAULT 'Draft',
        proposal_date DATE,
        validity_date DATE,
        total_amount DECIMAL(15, 2),
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        terms_conditions LONGTEXT,
        notes LONGTEXT,
        version INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_proposal_number (proposal_number),
        INDEX idx_client_id (client_id),
        INDEX idx_deal_id (deal_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proposal_line_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        description LONGTEXT,
        quantity DECIMAL(10, 2) NOT NULL,
        rate DECIMAL(15, 2) NOT NULL,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        tax_percent DECIMAL(5, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        subtotal DECIMAL(15, 2),
        total DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_proposal_id (proposal_id),
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proposal_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        action_by INT,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        comments LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_proposal_id (proposal_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proposal_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        file_size INT,
        file_data LONGBLOB,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_proposal_id (proposal_id),
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✓ All tables initialized successfully');
    
    const [existingRoles] = await connection.query('SELECT COUNT(*) as count FROM roles');
    if (existingRoles[0].count === 0) {
      const defaultRoles = ['Admin', 'Manager', 'Sales', 'Support', 'Viewer'];
      for (const role of defaultRoles) {
        await connection.query('INSERT INTO roles (name) VALUES (?)', [role]);
      }
      console.log('✓ Default roles created');
    }
    
    const [existingModules] = await connection.query('SELECT COUNT(*) as count FROM modules');
    if (existingModules[0].count === 0) {
      const defaultModules = ['Dashboard', 'Contacts', 'Companies', 'Leads', 'Deals', 'Pipelines', 'Campaign', 'Projects', 'Tasks', 'Activity'];
      for (const module of defaultModules) {
        await connection.query('INSERT INTO modules (name) VALUES (?)', [module]);
      }
      console.log('✓ Default modules created');
    }
    
    connection.release();
  } catch (error) {
    console.error('Database initialization error:', error.message);
    if (connection) connection.release();
  }
}

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log('✓ Database connection successful');
    await initializeDatabase();
  } catch (err) {
    console.error('✗ Database connection failed:', err.code || err.message);
  }
}

app.get('/api/deals', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, c.company_name, ct.first_name, ct.last_name,
             a.first_name as assignee_first_name, a.last_name as assignee_last_name
      FROM deals d 
      LEFT JOIN companies c ON d.company_id = c.id 
      LEFT JOIN contacts ct ON d.contact_id = ct.id 
      LEFT JOIN contacts a ON d.assignee_id = a.id
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching deals:', error.message);
    res.status(500).json({ error: 'Failed to fetch deals' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/deals/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, c.company_name, ct.first_name, ct.last_name,
             a.first_name as assignee_first_name, a.last_name as assignee_last_name
      FROM deals d 
      LEFT JOIN companies c ON d.company_id = c.id 
      LEFT JOIN contacts ct ON d.contact_id = ct.id 
      LEFT JOIN contacts a ON d.assignee_id = a.id
      WHERE d.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching deal:', error.message);
    res.status(500).json({ error: 'Failed to fetch deal' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/deals', async (req, res) => {
  let connection;
  try {
    const {
      deal_name,
      pipeline,
      status,
      deal_value,
      currency,
      period,
      period_value,
      contact_id,
      project_ids,
      due_date,
      expected_close_date,
      assignee_id,
      follow_up_date,
      source,
      tags,
      priority,
      description,
      company_id
    } = req.body;

    if (!deal_name || !deal_value) {
      return res.status(400).json({ error: 'Missing required fields: deal_name, deal_value' });
    }

    connection = await pool.getConnection();
    
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags || '';
    const projectString = Array.isArray(project_ids) ? project_ids.join(',') : project_ids || '';

    const [result] = await connection.query(`
      INSERT INTO deals (
        deal_name, pipeline, status, deal_value, currency, period, period_value,
        contact_id, project_id, due_date, expected_close_date, assignee_id,
        follow_up_date, source, tags, priority, description, company_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      deal_name,
      pipeline || null,
      status || 'Pending',
      deal_value,
      currency || 'USD',
      period || null,
      period_value || null,
      contact_id || null,
      projectString || null,
      due_date || null,
      expected_close_date || null,
      assignee_id || null,
      follow_up_date || null,
      source || null,
      tagsString,
      priority || 'Medium',
      description || '',
      company_id || null
    ]);

    res.json({ 
      message: 'Deal created successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating deal:', error.message);
    res.status(500).json({ error: 'Failed to create deal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/deals/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const {
      deal_name,
      pipeline,
      status,
      deal_value,
      currency,
      period,
      period_value,
      contact_id,
      project_ids,
      due_date,
      expected_close_date,
      assignee_id,
      follow_up_date,
      source,
      tags,
      priority,
      description,
      company_id
    } = req.body;

    connection = await pool.getConnection();
    
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags || '';
    const projectString = Array.isArray(project_ids) ? project_ids.join(',') : project_ids || '';

    await connection.query(`
      UPDATE deals 
      SET deal_name = ?, pipeline = ?, status = ?, deal_value = ?, currency = ?,
          period = ?, period_value = ?, contact_id = ?, project_id = ?,
          due_date = ?, expected_close_date = ?, assignee_id = ?,
          follow_up_date = ?, source = ?, tags = ?, priority = ?,
          description = ?, company_id = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      deal_name || null,
      pipeline || null,
      status || 'Pending',
      deal_value || null,
      currency || 'USD',
      period || null,
      period_value || null,
      contact_id || null,
      projectString || null,
      due_date || null,
      expected_close_date || null,
      assignee_id || null,
      follow_up_date || null,
      source || null,
      tagsString,
      priority || 'Medium',
      description || '',
      company_id || null,
      id
    ]);

    res.json({ message: 'Deal updated successfully' });
  } catch (error) {
    console.error('Error updating deal:', error.message);
    res.status(500).json({ error: 'Failed to update deal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/deals/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM deals WHERE id = ?', [id]);
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error.message);
    res.status(500).json({ error: 'Failed to delete deal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/deals/:id/convert-to-project', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, description, budget, startDate, dueDate, status } = req.body;

    connection = await pool.getConnection();

    const [deal] = await connection.query('SELECT * FROM deals WHERE id = ?', [id]);
    if (deal.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const [result] = await connection.query(`
      INSERT INTO projects (
        title, description, budget, start_date, due_date, status, company_id, contact_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name || deal[0].deal_name,
      description || deal[0].description,
      budget || deal[0].deal_value,
      startDate || null,
      dueDate || deal[0].expected_close_date,
      status || 'Active',
      deal[0].company_id,
      deal[0].contact_id
    ]);

    await connection.query(`
      UPDATE deals SET status = 'Converted to Project', updated_at = NOW() WHERE id = ?
    `, [id]);

    res.json({ 
      message: 'Deal converted to project successfully',
      projectId: result.insertId,
      dealId: id
    });
  } catch (error) {
    console.error('Error converting deal to project:', error.message);
    res.status(500).json({ error: 'Failed to convert deal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/deals/:id/convert-to-invoice', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, description, budget, startDate, dueDate } = req.body;

    connection = await pool.getConnection();

    const [deal] = await connection.query('SELECT * FROM deals WHERE id = ?', [id]);
    if (deal.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const invoiceNumber = `INV-${Date.now()}`;

    const [result] = await connection.query(`
      INSERT INTO invoices (
        invoice_number, title, description, amount, issue_date, due_date, company_id, contact_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      invoiceNumber,
      name || deal[0].deal_name,
      description || deal[0].description,
      budget || deal[0].deal_value,
      startDate || new Date().toISOString().split('T')[0],
      dueDate || deal[0].expected_close_date,
      deal[0].company_id,
      deal[0].contact_id,
      'Draft'
    ]);

    await connection.query(`
      UPDATE deals SET status = 'Converted to Invoice', updated_at = NOW() WHERE id = ?
    `, [id]);

    res.json({ 
      message: 'Deal converted to invoice successfully',
      invoiceId: result.insertId,
      invoiceNumber: invoiceNumber,
      dealId: id
    });
  } catch (error) {
    console.error('Error converting deal to invoice:', error.message);
    res.status(500).json({ error: 'Failed to convert deal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/deals/:id/convert-to-estimate', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, description, budget, startDate, dueDate, status } = req.body;

    connection = await pool.getConnection();

    const [deal] = await connection.query('SELECT * FROM deals WHERE id = ?', [id]);
    if (deal.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const estimateNumber = `EST-${Date.now()}`;

    const [result] = await connection.query(`
      INSERT INTO estimates (
        estimate_number, title, description, amount, issue_date, due_date, company_id, contact_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      estimateNumber,
      name || deal[0].deal_name,
      description || deal[0].description,
      budget || deal[0].deal_value,
      startDate || new Date().toISOString().split('T')[0],
      dueDate || deal[0].expected_close_date,
      deal[0].company_id,
      deal[0].contact_id,
      status || 'Draft'
    ]);

    await connection.query(`
      UPDATE deals SET status = 'Converted to Estimate', updated_at = NOW() WHERE id = ?
    `, [id]);

    res.json({ 
      message: 'Deal converted to estimate successfully',
      estimateId: result.insertId,
      estimateNumber: estimateNumber,
      dealId: id
    });
  } catch (error) {
    console.error('Error converting deal to estimate:', error.message);
    res.status(500).json({ error: 'Failed to convert deal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});



app.get('/api/contacts', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT c.*, co.company_name 
      FROM contacts c 
      LEFT JOIN companies co ON c.company_id = co.id 
      ORDER BY c.created_at DESC
    `);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT c.*, co.company_name 
      FROM contacts c 
      LEFT JOIN companies co ON c.company_id = co.id 
      WHERE c.id = ?
    `, [id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

app.post('/api/contacts', async (req, res) => {
  let connection;
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is empty' });
    }
    
    const { first_name, last_name, email, phone, company_id, position, status, avatar } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, email' });
    }

    connection = await pool.getConnection();
    const [result] = await connection.query('INSERT INTO contacts (first_name, last_name, email, phone, company_id, position, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [first_name, last_name, email, phone, company_id || null, position || '', status || 'Active', avatar || null]);
    res.json({ message: 'Contact created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating contact:', error.message, error.code);
    res.status(500).json({ error: 'Failed to create contact', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, company_id, position, status, avatar } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, email' });
    }

    connection = await pool.getConnection();
    await connection.query(
      'UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ?, company_id = ?, position = ?, status = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
      [first_name, last_name, email, phone, company_id || null, position || '', status || 'Active', avatar || null, id]
    );
    connection.release();
    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    console.error('Error updating contact:', error.message, error.code);
    res.status(500).json({ error: 'Failed to update contact', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM contacts WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error.message);
    res.status(500).json({ error: 'Failed to delete contact', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/companies/:companyId/contacts', async (req, res) => {
  try {
    const { companyId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT c.*, co.company_name 
      FROM contacts c 
      LEFT JOIN companies co ON c.company_id = co.id 
      WHERE c.company_id = ?
      ORDER BY c.created_at DESC
    `, [companyId]);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching company contacts:', error.message);
    res.status(500).json({ error: 'Failed to fetch company contacts' });
  }
});

app.get('/api/contacts/:contactId/notes', async (req, res) => {
  try {
    const { contactId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT * FROM contact_notes
      WHERE contact_id = ?
      ORDER BY created_at DESC
    `, [contactId]);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact notes:', error.message);
    res.status(500).json({ error: 'Failed to fetch contact notes' });
  }
});

app.post('/api/contacts/:contactId/notes', async (req, res) => {
  let connection;
  try {
    const { contactId } = req.params;
    const { note_text, created_by } = req.body;

    if (!note_text) {
      return res.status(400).json({ error: 'Note text is required' });
    }

    connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO contact_notes (contact_id, note_text, created_by) VALUES (?, ?, ?)',
      [contactId, note_text, created_by || 'Unknown']
    );
    connection.release();
    res.json({ message: 'Note created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating note:', error.message);
    res.status(500).json({ error: 'Failed to create note', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/contacts/:contactId/activities', async (req, res) => {
  try {
    const { contactId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT * FROM contact_activities
      WHERE contact_id = ?
      ORDER BY created_at DESC
    `, [contactId]);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact activities:', error.message);
    res.status(500).json({ error: 'Failed to fetch contact activities' });
  }
});

app.post('/api/contacts/:contactId/activities', async (req, res) => {
  let connection;
  try {
    const { contactId } = req.params;
    const { activity_type, activity_text, activity_icon, created_by } = req.body;

    if (!activity_type) {
      return res.status(400).json({ error: 'Activity type is required' });
    }

    connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO contact_activities (contact_id, activity_type, activity_text, activity_icon, created_by) VALUES (?, ?, ?, ?, ?)',
      [contactId, activity_type, activity_text || '', activity_icon || '📊', created_by || 'Unknown']
    );
    connection.release();
    res.json({ message: 'Activity created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating activity:', error.message);
    res.status(500).json({ error: 'Failed to create activity', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/companies/:companyId/deals', async (req, res) => {
  try {
    const { companyId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, c.company_name, ct.first_name, ct.last_name,
             a.first_name as assignee_first_name, a.last_name as assignee_last_name
      FROM deals d 
      LEFT JOIN companies c ON d.company_id = c.id 
      LEFT JOIN contacts ct ON d.contact_id = ct.id 
      LEFT JOIN contacts a ON d.assignee_id = a.id
      WHERE d.company_id = ?
      ORDER BY d.created_at DESC
    `, [companyId]);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching company deals:', error.message);
    res.status(500).json({ error: 'Failed to fetch company deals' });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        c.id, c.company_name, c.industry, c.email, c.email_opt_out, c.phone, c.phone2, c.fax, 
        c.website, c.address, c.city, c.state, c.country, c.employee_count, c.annual_revenue,
        c.status, c.account_url, c.logo, c.password, c.created_at, c.updated_at,
        c.reviews, c.owner, c.tags, c.source, c.currency, c.language, c.description,
        cs.plan_name, cs.plan_type, cs.price, cs.registered_date, cs.expiring_on
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      ORDER BY c.created_at DESC
    `);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error in /api/companies:', error.code || error.message || error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        c.id, c.company_name, c.industry, c.email, c.email_opt_out, c.phone, c.phone2, c.fax, 
        c.website, c.address, c.city, c.state, c.country, c.employee_count, c.annual_revenue,
        c.status, c.account_url, c.logo, c.password, c.created_at, c.updated_at,
        c.reviews, c.owner, c.tags, c.source, c.currency, c.language, c.description,
        cs.plan_name, cs.plan_type, cs.price, cs.registered_date, cs.expiring_on
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      WHERE c.id = ?
    `, [id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    const company = rows[0];
    console.log(`[DEBUG] Company ${id} - currency:${company.currency}, language:${company.language}`);
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is empty' });
    }

    const { 
      company_name, email, email_opt_out, phone, phone2, fax, website, address, 
      account_url, status, industry, city, state, country, reviews, owner, 
      tags, source, currency, language, description, planName, planType, logo 
    } = req.body;
    
    if (!company_name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields: company_name, email, phone' });
    }
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO companies 
       (company_name, email, email_opt_out, phone, phone2, fax, website, address, account_url, 
        status, industry, city, state, country, reviews, owner, tags, source, 
        currency, language, description, logo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [company_name, email, email_opt_out || false, phone, phone2 || null, fax || null, website || null, address || null, 
       account_url || null, status || 'Active', industry || null, city || null, state || null, 
       country || null, reviews || null, owner || null, tags || null, source || null, 
       currency || 'USD', language || 'English', description || null, logo || null]
    );
    
    const companyId = result.insertId;
    
    if (planName && planType) {
      const expiring = new Date();
      expiring.setMonth(expiring.getMonth() + 1);
      
      await connection.query(
        'INSERT INTO company_subscriptions (company_id, plan_name, plan_type, currency, language, registered_date, expiring_on) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
        [companyId, planName, planType, currency || 'USD', language || 'English', expiring]
      );
    }
    
    connection.release();
    res.json({ message: 'Company created successfully', id: companyId });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, email, phone, website, address, account_url, status, logo } = req.body;
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE companies SET company_name = ?, email = ?, phone = ?, website = ?, address = ?, account_url = ?, status = ?, logo = ?, updated_at = NOW() WHERE id = ?',
      [company_name, email, phone, website, address, account_url, status, logo || null, id]
    );
    
    connection.release();
    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM companies WHERE id = ?', [id]);
    
    connection.release();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

app.post('/api/companies/:id/upgrade', async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, planType, currency, language } = req.body;
    const connection = await pool.getConnection();
    
    const expiring = new Date();
    expiring.setMonth(expiring.getMonth() + 1);
    
    const [result] = await connection.query(
      'INSERT INTO company_subscriptions (company_id, plan_name, plan_type, currency, language, registered_date, expiring_on) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
      [id, planName, planType, currency || 'USD', language || 'English', expiring]
    );
    
    connection.release();
    res.json({ message: 'Company plan upgraded successfully', subscriptionId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upgrade company plan' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const {
      planName,
      planType,
      planPosition,
      planCurrency,
      planCurrencyFree,
      discountType,
      discount,
      limitationsInvoices,
      maxCustomers,
      product,
      supplier,
      planModules,
      accessTrial,
      trialDays,
      status,
    } = req.body;

    const connection = await pool.getConnection();
    
    const modulesString = Object.keys(planModules)
      .filter(key => planModules[key])
      .join(',');

    const positionMap = {
      'Basic': 1,
      'Standard': 2,
      'Premium': 3,
      'Select': null
    };
    
    const positionValue = positionMap[planPosition] !== undefined ? positionMap[planPosition] : null;

    await connection.query(
      `INSERT INTO company_plans 
      (plan_name, plan_type, plan_position, plan_currency, plan_currency_free, discount_type, discount, 
       limitations_invoices, max_customers, product, supplier, modules, access_trial, trial_days, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        planName,
        planType,
        positionValue,
        planCurrency,
        planCurrencyFree || null,
        discountType || null,
        discount || null,
        limitationsInvoices || null,
        maxCustomers || null,
        product || null,
        supplier || null,
        modulesString,
        accessTrial ? 1 : 0,
        trialDays === 'Select' ? null : trialDays,
        status,
      ]
    );

    connection.release();
    res.json({ message: 'Plan created successfully' });
  } catch (error) {
    console.error('Error creating plan:', error.code || error.message, error.sql);
    res.status(500).json({ error: 'Failed to create plan', details: error.message });
  }
});

app.get('/api/plans', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM company_plans ORDER BY created_at DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

app.get('/api/leads', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM leads ORDER BY created_at DESC');
    connection.release();
    const formatted = rows.map(r => ({
      ...r,
      name: r.lead_name,
      source: r.lead_source,
      status: r.lead_status
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, company, source, status, rating, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Lead name is required' });
    }
    
    const connection = await pool.getConnection();
    
    const result = await connection.query(
      'INSERT INTO leads (lead_name, email, phone, company, lead_source, lead_status, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [name, email || null, phone || null, company || null, source || 'Website', status || 'New', rating || 5, description || null]
    );
    
    connection.release();
    res.json({ 
      id: result[0].insertId,
      name,
      email,
      phone,
      company,
      source: source || 'Website',
      status: status || 'New',
      rating: rating || 5,
      message: 'Lead created successfully'
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead', details: error.message });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM leads WHERE id = ?', [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const lead = rows[0];
    res.json({
      ...lead,
      name: lead.lead_name,
      source: lead.lead_source,
      status: lead.lead_status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lead_name, email, phone, company, lead_source, lead_status, rating, notes } = req.body;
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE leads SET lead_name = ?, email = ?, phone = ?, company = ?, lead_source = ?, lead_status = ?, rating = ?, notes = ?, updated_at = NOW() WHERE id = ?',
      [lead_name, email, phone, company || null, lead_source, lead_status, rating || 5, notes || null, id]
    );
    
    connection.release();
    res.json({ message: 'Lead updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM leads WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

app.post('/api/leads/:id/convert-to-contact', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { first_name, last_name, company_id, position, status: contactStatus } = req.body;
    
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name' });
    }
    
    connection = await pool.getConnection();
    
    const [lead] = await connection.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (lead.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const leadData = lead[0];
    const [result] = await connection.query(
      'INSERT INTO contacts (first_name, last_name, email, phone, company_id, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, leadData.email, leadData.phone, company_id || null, position || '', contactStatus || 'Active']
    );
    
    const contactId = result.insertId;
    
    res.json({
      message: 'Lead converted to contact successfully',
      contactId,
      contact: {
        id: contactId,
        first_name,
        last_name,
        email: leadData.email,
        phone: leadData.phone,
        company_id,
        position,
        status: contactStatus || 'Active'
      }
    });
  } catch (error) {
    console.error('Error converting lead to contact:', error.message);
    res.status(500).json({ error: 'Failed to convert lead to contact', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/leads/:id/convert-to-company', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { company_name, industry, email, phone, website, address, status: companyStatus } = req.body;
    
    if (!company_name) {
      return res.status(400).json({ error: 'Missing required field: company_name' });
    }
    
    connection = await pool.getConnection();
    
    const [lead] = await connection.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (lead.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const leadData = lead[0];
    const [result] = await connection.query(
      'INSERT INTO companies (company_name, industry, email, phone, website, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [company_name, industry || null, email || leadData.email, phone || leadData.phone, website || null, address || null, companyStatus || 'Active']
    );
    
    const companyId = result.insertId;
    
    res.json({
      message: 'Lead converted to company successfully',
      companyId,
      company: {
        id: companyId,
        company_name,
        industry,
        email: email || leadData.email,
        phone: phone || leadData.phone,
        website,
        address,
        status: companyStatus || 'Active'
      }
    });
  } catch (error) {
    console.error('Error converting lead to company:', error.message);
    res.status(500).json({ error: 'Failed to convert lead to company', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/leads/:id/convert-to-deal', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { deal_name, deal_value, currency, contact_id, company_id, pipeline, status: dealStatus, description } = req.body;
    
    if (!deal_name || !deal_value) {
      return res.status(400).json({ error: 'Missing required fields: deal_name, deal_value' });
    }
    
    connection = await pool.getConnection();
    
    const [lead] = await connection.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (lead.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const [result] = await connection.query(
      'INSERT INTO deals (deal_name, company_id, contact_id, deal_value, currency, pipeline, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [deal_name, company_id || null, contact_id || null, deal_value, currency || 'USD', pipeline || null, dealStatus || 'Pending', description || null]
    );
    
    const dealId = result.insertId;
    
    res.json({
      message: 'Lead converted to deal successfully',
      dealId,
      deal: {
        id: dealId,
        deal_name,
        deal_value,
        currency: currency || 'USD',
        contact_id,
        company_id,
        pipeline,
        status: dealStatus || 'Pending',
        description
      }
    });
  } catch (error) {
    console.error('Error converting lead to deal:', error.message);
    res.status(500).json({ error: 'Failed to convert lead to deal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/pipeline', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM pipeline ORDER BY created_at DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

app.get('/api/invoices', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT i.*, c.company_name 
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching invoices:', error.message);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [invoiceRows] = await connection.query(`
      SELECT i.*, c.company_name 
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      WHERE i.id = ?
    `, [id]);
    
    if (invoiceRows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const [items] = await connection.query(`
      SELECT * FROM invoice_items WHERE invoice_id = ?
    `, [id]);

    res.json({ ...invoiceRows[0], items });
  } catch (error) {
    console.error('Error fetching invoice:', error.message);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/invoices', async (req, res) => {
  let connection;
  try {
    const { 
      client, billTo, shipTo, project, amount, currency, 
      date, openTill, paymentMethod, status, description, 
      items, subtotal, discount2, extraDiscount0, tax, total, 
      notes, termsConditions 
    } = req.body;

    if (!client || !billTo || !amount) {
      return res.status(400).json({ error: 'Missing required fields: client, billTo, amount' });
    }

    connection = await pool.getConnection();
    
    const invoiceNumber = `INV-${Date.now()}`;
    
    const [result] = await connection.query(`
      INSERT INTO invoices (
        invoice_number, client_id, bill_to, ship_to, project_id, amount, currency,
        invoice_date, open_till, payment_method, status, description,
        subtotal, discount_percentage, discount_amount,
        extra_discount_percentage, extra_discount_amount,
        tax_percentage, tax_amount, total, notes, terms_conditions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      invoiceNumber, client, billTo, shipTo, project || null, amount, currency,
      date || null, openTill || null, paymentMethod || null, status || 'Draft', description || '',
      subtotal || 0, 0, 0, 0, 0, 0, 0, total || amount, notes || '', termsConditions || ''
    ]);

    const invoiceId = result.insertId;

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.item && item.price && item.quantity) {
          await connection.query(`
            INSERT INTO invoice_items (
              invoice_id, item_name, quantity, price, 
              discount_percentage, discount_amount, amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            invoiceId, item.item, item.quantity, item.price,
            0, 0, (item.quantity * item.price) || 0
          ]);
        }
      }
    }

    res.json({ 
      message: 'Invoice created successfully', 
      id: invoiceId,
      invoiceNumber 
    });
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    res.status(500).json({ error: 'Failed to create invoice', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status, paymentMethod, notes } = req.body;

    connection = await pool.getConnection();
    await connection.query(`
      UPDATE invoices 
      SET status = ?, payment_method = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `, [status || 'Draft', paymentMethod || null, notes || '', id]);

    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Error updating invoice:', error.message);
    res.status(500).json({ error: 'Failed to update invoice', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM invoices WHERE id = ?', [id]);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error.message);
    res.status(500).json({ error: 'Failed to delete invoice', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/pipeline', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [pipelines] = await connection.query(`
      SELECT p.*, 
             COUNT(ps.id) as stage_count,
             GROUP_CONCAT(ps.stage_name) as stages
      FROM pipeline p
      LEFT JOIN pipeline_stages ps ON p.id = ps.pipeline_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(pipelines);
  } catch (error) {
    console.error('Error fetching pipelines:', error.message);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/pipeline/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [pipeline] = await connection.query(`
      SELECT p.* FROM pipeline p WHERE p.id = ?
    `, [id]);
    
    if (pipeline.length === 0) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    const [stages] = await connection.query(`
      SELECT * FROM pipeline_stages WHERE pipeline_id = ? ORDER BY stage_order
    `, [id]);

    const [access] = await connection.query(`
      SELECT * FROM pipeline_access WHERE pipeline_id = ?
    `, [id]);

    res.json({
      ...pipeline[0],
      stages,
      access
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error.message);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/pipeline', async (req, res) => {
  let connection;
  try {
    const {
      name,
      description,
      stages,
      access_type,
      user_ids,
      status
    } = req.body;

    if (!name || !stages || stages.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: name, stages' });
    }

    connection = await pool.getConnection();
    
    const [result] = await connection.query(`
      INSERT INTO pipeline (name, description, status, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `, [name, description || '', status || 'Active']);

    const pipelineId = result.insertId;

    for (let i = 0; i < stages.length; i++) {
      await connection.query(`
        INSERT INTO pipeline_stages (pipeline_id, stage_name, stage_order, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `, [pipelineId, stages[i], i + 1]);
    }

    if (access_type === 'All') {
      await connection.query(`
        INSERT INTO pipeline_access (pipeline_id, access_type)
        VALUES (?, 'All')
      `, [pipelineId]);
    } else if (user_ids && user_ids.length > 0) {
      for (const userId of user_ids) {
        await connection.query(`
          INSERT INTO pipeline_access (pipeline_id, access_type, user_id)
          VALUES (?, 'Selected', ?)
        `, [pipelineId, userId]);
      }
    }

    res.json({ 
      message: 'Pipeline created successfully', 
      id: pipelineId 
    });
  } catch (error) {
    console.error('Error creating pipeline:', error.message);
    res.status(500).json({ error: 'Failed to create pipeline', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/pipeline/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const {
      name,
      description,
      stages,
      access_type,
      user_ids,
      status
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    connection = await pool.getConnection();
    
    await connection.query(`
      UPDATE pipeline 
      SET name = ?, description = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, description || '', status || 'Active', id]);

    if (stages && stages.length > 0) {
      await connection.query('DELETE FROM pipeline_stages WHERE pipeline_id = ?', [id]);
      
      for (let i = 0; i < stages.length; i++) {
        await connection.query(`
          INSERT INTO pipeline_stages (pipeline_id, stage_name, stage_order, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
        `, [id, stages[i], i + 1]);
      }
    }

    if (access_type) {
      await connection.query('DELETE FROM pipeline_access WHERE pipeline_id = ?', [id]);
      
      if (access_type === 'All') {
        await connection.query(`
          INSERT INTO pipeline_access (pipeline_id, access_type)
          VALUES (?, 'All')
        `, [id]);
      } else if (user_ids && user_ids.length > 0) {
        for (const userId of user_ids) {
          await connection.query(`
            INSERT INTO pipeline_access (pipeline_id, access_type, user_id)
            VALUES (?, 'Selected', ?)
          `, [id, userId]);
        }
      }
    }

    res.json({ message: 'Pipeline updated successfully' });
  } catch (error) {
    console.error('Error updating pipeline:', error.message);
    res.status(500).json({ error: 'Failed to update pipeline', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/pipeline/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM pipeline WHERE id = ?', [id]);
    res.json({ message: 'Pipeline deleted successfully' });
  } catch (error) {
    console.error('Error deleting pipeline:', error.message);
    res.status(500).json({ error: 'Failed to delete pipeline', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/campaigns', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [campaigns] = await connection.query(`
      SELECT * FROM campaigns ORDER BY created_at DESC
    `);
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error.message);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [campaigns] = await connection.query(`
      SELECT * FROM campaigns WHERE id = ?
    `, [id]);
    
    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaigns[0]);
  } catch (error) {
    console.error('Error fetching campaign:', error.message);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/campaigns', async (req, res) => {
  let connection;
  try {
    const {
      name,
      campaign_type,
      deal_value,
      currency,
      period,
      period_value,
      target_audience,
      description,
      attachment_data,
      attachment_name,
      attachment_size,
      status
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    connection = await pool.getConnection();
    
    const targetAudienceStr = Array.isArray(target_audience) ? target_audience.join(',') : target_audience || '';

    const [result] = await connection.query(`
      INSERT INTO campaigns (
        name, campaign_type, deal_value, currency, period, period_value,
        target_audience, description, attachment_data, attachment_name,
        attachment_size, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      name,
      campaign_type || null,
      deal_value || null,
      currency || 'USD',
      period || null,
      period_value || null,
      targetAudienceStr,
      description || '',
      attachment_data || null,
      attachment_name || null,
      attachment_size || null,
      status || 'Draft'
    ]);

    res.json({ 
      message: 'Campaign created successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating campaign:', error.message);
    res.status(500).json({ error: 'Failed to create campaign', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/campaigns/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const {
      name,
      campaign_type,
      deal_value,
      currency,
      period,
      period_value,
      target_audience,
      description,
      attachment_data,
      attachment_name,
      attachment_size,
      status
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    connection = await pool.getConnection();
    
    const targetAudienceStr = Array.isArray(target_audience) ? target_audience.join(',') : target_audience || '';

    await connection.query(`
      UPDATE campaigns 
      SET name = ?, campaign_type = ?, deal_value = ?, currency = ?, period = ?,
          period_value = ?, target_audience = ?, description = ?,
          attachment_data = ?, attachment_name = ?, attachment_size = ?, 
          status = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      name,
      campaign_type || null,
      deal_value || null,
      currency || 'USD',
      period || null,
      period_value || null,
      targetAudienceStr,
      description || '',
      attachment_data || null,
      attachment_name || null,
      attachment_size || null,
      status || 'Draft',
      id
    ]);

    res.json({ message: 'Campaign updated successfully' });
  } catch (error) {
    console.error('Error updating campaign:', error.message);
    res.status(500).json({ error: 'Failed to update campaign', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM campaigns WHERE id = ?', [id]);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error.message);
    res.status(500).json({ error: 'Failed to delete campaign', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/projects', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ error: 'Failed to fetch projects', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/projects/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = rows[0];
    if (project.responsible_persons) {
      project.responsible_persons = project.responsible_persons.split(',');
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error.message);
    res.status(500).json({ error: 'Failed to fetch project', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/projects', async (req, res) => {
  let connection;
  try {
    const {
      name,
      project_id,
      project_type,
      client,
      category,
      project_timing,
      price,
      responsible_persons,
      team_leader,
      start_date,
      due_date,
      priority,
      status,
      description
    } = req.body;

    if (!name || !project_id) {
      return res.status(400).json({ error: 'Name and Project ID are required' });
    }

    connection = await pool.getConnection();
    const responsiblePersonsStr = Array.isArray(responsible_persons) 
      ? responsible_persons.join(',') 
      : responsible_persons || '';

    const [result] = await connection.query(
      `INSERT INTO projects (name, project_id, project_type, client, category, project_timing, price, responsible_persons, team_leader, start_date, due_date, priority, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, project_id, project_type, client, category, project_timing, price, responsiblePersonsStr, team_leader, start_date, due_date, priority, status || 'Planning', description]
    );

    res.status(201).json({ 
      message: 'Project created successfully',
      id: result.insertId,
      project: { id: result.insertId, name, project_id, status: status || 'Planning' }
    });
  } catch (error) {
    console.error('Error creating project:', error.message);
    res.status(500).json({ error: 'Failed to create project', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/projects/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const {
      name,
      project_id,
      project_type,
      client,
      category,
      project_timing,
      price,
      responsible_persons,
      team_leader,
      start_date,
      due_date,
      priority,
      status,
      description
    } = req.body;

    connection = await pool.getConnection();
    const responsiblePersonsStr = Array.isArray(responsible_persons) 
      ? responsible_persons.join(',') 
      : responsible_persons || '';

    await connection.query(
      `UPDATE projects SET name=?, project_id=?, project_type=?, client=?, category=?, project_timing=?, price=?, responsible_persons=?, team_leader=?, start_date=?, due_date=?, priority=?, status=?, description=?
       WHERE id=?`,
      [name, project_id, project_type, client, category, project_timing, price, responsiblePersonsStr, team_leader, start_date, due_date, priority, status, description, id]
    );

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error.message);
    res.status(500).json({ error: 'Failed to update project', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error.message);
    res.status(500).json({ error: 'Failed to delete project', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/users/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/users', async (req, res) => {
  let connection;
  try {
    const { first_name, username, email, password, phone1, phone1_country, phone2, phone2_country, location, avatar, role_id, email_opt_out, status } = req.body;
    
    if (!first_name || !username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO users (first_name, username, email, password, phone1, phone1_country, phone2, phone2_country, location, avatar, role_id, email_opt_out, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, username, email, password, phone1, phone1_country || 'US', phone2, phone2_country || 'US', location, avatar, role_id || 5, email_opt_out || false, status || 'Active']
    );
    
    const [newUser] = await connection.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/users/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { first_name, username, email, phone1, phone1_country, phone2, phone2_country, location, avatar, role_id, email_opt_out, status } = req.body;
    
    connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET first_name = ?, username = ?, email = ?, phone1 = ?, phone1_country = ?, phone2 = ?, phone2_country = ?, location = ?, avatar = ?, role_id = ?, email_opt_out = ?, status = ? WHERE id = ?',
      [first_name, username, email, phone1, phone1_country, phone2, phone2_country, location, avatar, role_id, email_opt_out, status, id]
    );
    
    const [updatedUser] = await connection.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [id]
    );
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/users/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/roles', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM roles ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ error: 'Failed to fetch roles' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/roles', async (req, res) => {
  let connection;
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO roles (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    
    const [newRole] = await connection.query('SELECT * FROM roles WHERE id = ?', [result.insertId]);
    res.status(201).json(newRole[0]);
  } catch (error) {
    console.error('Error creating role:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Role name already exists' });
    }
    res.status(500).json({ error: 'Failed to create role', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/roles/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    connection = await pool.getConnection();
    await connection.query(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    
    const [updatedRole] = await connection.query('SELECT * FROM roles WHERE id = ?', [id]);
    res.json(updatedRole[0]);
  } catch (error) {
    console.error('Error updating role:', error.message);
    res.status(500).json({ error: 'Failed to update role', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/roles/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    
    const [usersWithRole] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [id]);
    if (usersWithRole[0].count > 0) {
      connection.release();
      return res.status(400).json({ error: 'Cannot delete role with assigned users' });
    }
    
    await connection.query('DELETE FROM roles WHERE id = ?', [id]);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error.message);
    res.status(500).json({ error: 'Failed to delete role', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/permissions/role/:roleId', async (req, res) => {
  let connection;
  try {
    const { roleId } = req.params;
    connection = await pool.getConnection();
    
    const [rows] = await connection.query(`
      SELECT p.*, m.name as module_name
      FROM permissions p
      LEFT JOIN modules m ON p.module_name = m.name
      WHERE p.role_id = ?
      ORDER BY m.name
    `, [roleId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching permissions:', error.message);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/modules', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM modules ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching modules:', error.message);
    res.status(500).json({ error: 'Failed to fetch modules' });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/permissions/role/:roleId', async (req, res) => {
  let connection;
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }
    
    connection = await pool.getConnection();
    
    await connection.query('DELETE FROM permissions WHERE role_id = ?', [roleId]);
    
    for (const perm of permissions) {
      await connection.query(
        'INSERT INTO permissions (role_id, module_name, can_create, can_read, can_update, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
        [roleId, perm.module_name, perm.can_create || false, perm.can_read || false, perm.can_update || false, perm.can_delete || false]
      );
    }
    
    const [updatedPermissions] = await connection.query(`
      SELECT p.*, m.name as module_name
      FROM permissions p
      LEFT JOIN modules m ON p.module_name = m.name
      WHERE p.role_id = ?
      ORDER BY m.name
    `, [roleId]);
    
    res.json(updatedPermissions);
  } catch (error) {
    console.error('Error updating permissions:', error.message);
    res.status(500).json({ error: 'Failed to update permissions', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/delete-requests', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT dr.*, u.first_name, u.email, u.avatar, r.first_name as reviewer_name
      FROM delete_requests dr
      LEFT JOIN users u ON dr.user_id = u.id
      LEFT JOIN users r ON dr.reviewed_by = r.id
      ORDER BY dr.requested_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching delete requests:', error.message);
    res.status(500).json({ error: 'Failed to fetch delete requests' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/delete-requests/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT dr.*, u.first_name, u.email, u.avatar, r.first_name as reviewer_name
      FROM delete_requests dr
      LEFT JOIN users u ON dr.user_id = u.id
      LEFT JOIN users r ON dr.reviewed_by = r.id
      WHERE dr.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Delete request not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching delete request:', error.message);
    res.status(500).json({ error: 'Failed to fetch delete request' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/delete-requests', async (req, res) => {
  let connection;
  try {
    const { user_id, reason } = req.body;
    
    if (!user_id || !reason) {
      return res.status(400).json({ error: 'Missing required fields: user_id, reason' });
    }
    
    connection = await pool.getConnection();
    
    const [existing] = await connection.query(
      'SELECT id FROM delete_requests WHERE user_id = ? AND status = ?',
      [user_id, 'Pending']
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You already have a pending delete request' });
    }
    
    const [result] = await connection.query(
      'INSERT INTO delete_requests (user_id, reason) VALUES (?, ?)',
      [user_id, reason]
    );
    
    res.json({ message: 'Delete request created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating delete request:', error.message);
    res.status(500).json({ error: 'Failed to create delete request', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/delete-requests/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status, reviewed_by } = req.body;
    
    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    connection = await pool.getConnection();
    
    if (status === 'Approved') {
      const [request] = await connection.query('SELECT user_id FROM delete_requests WHERE id = ?', [id]);
      if (request.length > 0) {
        await connection.query('UPDATE users SET status = ? WHERE id = ?', ['Inactive', request[0].user_id]);
      }
    }
    
    await connection.query(
      'UPDATE delete_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [status, reviewed_by || null, id]
    );
    
    res.json({ message: `Delete request ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error updating delete request:', error.message);
    res.status(500).json({ error: 'Failed to update delete request', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/delete-requests/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    
    const [request] = await connection.query('SELECT user_id FROM delete_requests WHERE id = ?', [id]);
    if (request.length > 0) {
      await connection.query('DELETE FROM users WHERE id = ?', [request[0].user_id]);
    }
    
    await connection.query('DELETE FROM delete_requests WHERE id = ?', [id]);
    res.json({ message: 'User and delete request deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/seed-mock-companies', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const mockCompanies = [
      {
        company_name: 'TechVision Inc',
        email: 'contact@techvision.com',
        phone: '+1-555-0101',
        website: 'www.techvision.com',
        address: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        industry: 'Technology',
        tags: 'Enterprise,Active',
        source: 'Referral',
        description: 'Leading technology solutions provider'
      },
      {
        company_name: 'Global Health Solutions',
        email: 'info@globalhealthsolutions.com',
        phone: '+1-555-0102',
        website: 'www.globalhealthsolutions.com',
        address: '456 Medical Plaza',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        industry: 'Healthcare',
        tags: 'Healthcare,Growing',
        source: 'Direct',
        description: 'Healthcare management and consulting'
      },
      {
        company_name: 'Finance Pro Corp',
        email: 'sales@financeprocorp.com',
        phone: '+1-555-0103',
        website: 'www.financeprocorp.com',
        address: '789 Wall Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        industry: 'Finance',
        tags: 'Finance,Trusted',
        source: 'Paid Campaign',
        description: 'Financial services and investment solutions'
      },
      {
        company_name: 'Smart Retail Ltd',
        email: 'support@smartretail.com',
        phone: '+1-555-0104',
        website: 'www.smartretail.com',
        address: '321 Commerce Ave',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        industry: 'Retail',
        tags: 'Retail,Partner',
        source: 'Website',
        description: 'Innovative retail solutions and consulting'
      },
      {
        company_name: 'Industrial Manufacturing Co',
        email: 'info@industrialmanufacturing.com',
        phone: '+1-555-0105',
        website: 'www.industrialmanufacturing.com',
        address: '654 Industrial Park',
        city: 'Detroit',
        state: 'MI',
        country: 'USA',
        industry: 'Manufacturing',
        tags: 'Manufacturing,Established',
        source: 'Direct',
        description: 'Premium industrial manufacturing services'
      },
      {
        company_name: 'EduTech Innovations',
        email: 'hello@edutechinnovations.com',
        phone: '+1-555-0106',
        website: 'www.edutechinnovations.com',
        address: '987 Campus Drive',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        industry: 'Education',
        tags: 'Education,Tech',
        source: 'Referral',
        description: 'Educational technology and training solutions'
      },
      {
        company_name: 'Prime Real Estate Group',
        email: 'contact@primerealestate.com',
        phone: '+1-555-0107',
        website: 'www.primerealestate.com',
        address: '147 Property Lane',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        industry: 'Real Estate',
        tags: 'RealEstate,Active',
        source: 'Event',
        description: 'Luxury real estate investment and management'
      },
      {
        company_name: 'Hospitality Plus',
        email: 'reservations@hospitalityplus.com',
        phone: '+1-555-0108',
        website: 'www.hospitalityplus.com',
        address: '258 Hotel Boulevard',
        city: 'Las Vegas',
        state: 'NV',
        country: 'USA',
        industry: 'Hospitality',
        tags: 'Hospitality,Growing',
        source: 'Paid Campaign',
        description: 'Premier hospitality and tourism services'
      }
    ];
    
    for (const company of mockCompanies) {
      await connection.query(`
        INSERT INTO companies 
        (company_name, email, phone, website, address, city, state, country, industry, tags, source, description, currency, language, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'English', 'Active')
      `, [
        company.company_name,
        company.email,
        company.phone,
        company.website,
        company.address,
        company.city,
        company.state,
        company.country,
        company.industry,
        company.tags,
        company.source,
        company.description
      ]);
    }
    
    res.json({ message: 'Mock companies added successfully', count: mockCompanies.length });
  } catch (error) {
    console.error('Error seeding mock companies:', error.message);
    res.status(500).json({ error: 'Failed to seed mock companies', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/sources', async (req, res) => {
  try {
    const sources = [
      { id: 1, name: 'Direct' },
      { id: 2, name: 'Referral' },
      { id: 3, name: 'Website' },
      { id: 4, name: 'Event' },
      { id: 5, name: 'Other' },
      { id: 6, name: 'Paid Campaign' },
      { id: 7, name: 'Social Media' },
      { id: 8, name: 'Partner' }
    ];
    res.json(sources);
  } catch (error) {
    console.error('Error fetching sources:', error.message);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

app.get('/api/industries', async (req, res) => {
  try {
    const industries = [
      { id: 1, name: 'Technology' },
      { id: 2, name: 'Healthcare' },
      { id: 3, name: 'Finance' },
      { id: 4, name: 'Retail' },
      { id: 5, name: 'Manufacturing' },
      { id: 6, name: 'Education' },
      { id: 7, name: 'Real Estate' },
      { id: 8, name: 'Hospitality' },
      { id: 9, name: 'Transportation' },
      { id: 10, name: 'Telecommunications' },
      { id: 11, name: 'Energy' },
      { id: 12, name: 'Media & Entertainment' },
      { id: 13, name: 'Aviation Tech' },
      { id: 14, name: 'Consulting' },
      { id: 15, name: 'Legal Services' }
    ];
    res.json(industries);
  } catch (error) {
    console.error('Error fetching industries:', error.message);
    res.status(500).json({ error: 'Failed to fetch industries' });
  }
});

const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

app.post('/api/projects', async (req, res) => {
  let connection;
  try {
    const { name, project_id, project_type, client, category, project_timing, price, responsible_persons, team_leader, start_date, due_date, priority, status, description, deal_id, created_by, visibility } = req.body;
    
    if (!name || !project_id) {
      return res.status(400).json({ error: 'Project name and ID are required' });
    }

    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO projects (name, project_id, project_type, client, category, project_timing, price, responsible_persons, team_leader, start_date, due_date, priority, status, description, deal_id, created_by, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, project_id, project_type || null, client || null, category || null, project_timing || null, price || 0, JSON.stringify(responsible_persons || []), team_leader || null, start_date || null, due_date || null, priority || 'Medium', status || 'Planning', description || null, deal_id || null, created_by || null, visibility || 'Public']
    );

    connection.release();
    res.json({ id: result.insertId, message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error.message);
    res.status(500).json({ error: 'Failed to create project', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/projects', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM projects ORDER BY created_at DESC');
    connection.release();
    
    const projects = rows.map(p => ({
      ...p,
      responsible_persons: p.responsible_persons ? JSON.parse(p.responsible_persons) : []
    }));
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM projects WHERE id = ?', [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = rows[0];
    project.responsible_persons = project.responsible_persons ? JSON.parse(project.responsible_persons) : [];
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error.message);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, project_type, client, category, project_timing, price, responsible_persons, team_leader, start_date, due_date, priority, status, description, visibility } = req.body;
    
    connection = await pool.getConnection();
    await connection.query(
      `UPDATE projects SET name = ?, project_type = ?, client = ?, category = ?, project_timing = ?, price = ?, responsible_persons = ?, team_leader = ?, start_date = ?, due_date = ?, priority = ?, status = ?, description = ?, visibility = ?, updated_at = NOW() WHERE id = ?`,
      [name, project_type, client, category, project_timing, price, JSON.stringify(responsible_persons || []), team_leader, start_date, due_date, priority, status, description, visibility, id]
    );
    
    connection.release();
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error.message);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM projects WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error.message);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.post('/api/projects/:projectId/tasks', async (req, res) => {
  let connection;
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assigned_to, assigned_by, due_date, start_date, estimated_hours } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO project_tasks (project_id, title, description, status, priority, assigned_to, assigned_by, due_date, start_date, estimated_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, title, description || null, status || 'Todo', priority || 'Medium', assigned_to || null, assigned_by || null, due_date || null, start_date || null, estimated_hours || null]
    );

    connection.release();
    res.json({ id: result.insertId, message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.get('/api/projects/:projectId/tasks', async (req, res) => {
  let connection;
  try {
    const { projectId } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM project_tasks WHERE project_id = ? ORDER BY order_index ASC, created_at ASC', [projectId]);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.put('/api/projects/:projectId/tasks/:taskId', async (req, res) => {
  let connection;
  try {
    const { projectId, taskId } = req.params;
    const { title, description, status, priority, assigned_to, due_date, start_date, estimated_hours, actual_hours, progress, order_index } = req.body;
    
    connection = await pool.getConnection();
    await connection.query(
      `UPDATE project_tasks SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?, start_date = ?, estimated_hours = ?, actual_hours = ?, progress = ?, order_index = ?, updated_at = NOW() WHERE id = ? AND project_id = ?`,
      [title, description, status, priority, assigned_to, due_date, start_date, estimated_hours, actual_hours, progress, order_index, taskId, projectId]
    );
    
    connection.release();
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/projects/:projectId/tasks/:taskId', async (req, res) => {
  let connection;
  try {
    const { projectId, taskId } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM project_tasks WHERE id = ? AND project_id = ?', [taskId, projectId]);
    connection.release();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.post('/api/tasks', async (req, res) => {
  let connection;
  try {
    const { title, description, priority, status, assigned_to, due_date, linked_type, linked_id, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO general_tasks (title, description, status, priority, assigned_to, due_date, linked_type, linked_id, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        status || 'Open',
        priority || 'Medium',
        assigned_to ? JSON.stringify(assigned_to) : JSON.stringify([]),
        due_date || null,
        linked_type || 'General',
        linked_id || null,
        tags ? JSON.stringify(tags) : JSON.stringify([])
      ]
    );

    connection.release();
    res.json({ 
      id: result.insertId,
      title,
      description,
      status: status || 'Open',
      priority: priority || 'Medium',
      assigned_to: assigned_to || [],
      due_date: due_date || null,
      linked_type: linked_type || 'General',
      linked_id: linked_id || null,
      tags: tags || [],
      created_at: new Date(),
      updated_at: new Date()
    });
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.get('/api/tasks', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM general_tasks ORDER BY created_at DESC');
    
    const tasks = rows.map(task => ({
      ...task,
      assigned_to: typeof task.assigned_to === 'string' ? JSON.parse(task.assigned_to) : (task.assigned_to || []),
      tags: typeof task.tags === 'string' ? JSON.parse(task.tags) : (task.tags || [])
    }));
    
    connection.release();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:taskId', async (req, res) => {
  let connection;
  try {
    const { taskId } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM general_tasks WHERE id = ?', [taskId]);
    
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = rows[0];
    task.assigned_to = typeof task.assigned_to === 'string' ? JSON.parse(task.assigned_to) : (task.assigned_to || []);
    task.tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : (task.tags || []);
    
    connection.release();
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error.message);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.put('/api/tasks/:taskId', async (req, res) => {
  let connection;
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assigned_to, due_date, linked_type, linked_id, tags } = req.body;
    
    connection = await pool.getConnection();
    
    await connection.query(
      `UPDATE general_tasks SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?, linked_type = ?, linked_id = ?, tags = ?, updated_at = NOW() WHERE id = ?`,
      [
        title,
        description || null,
        status || 'Open',
        priority || 'Medium',
        assigned_to ? JSON.stringify(assigned_to) : JSON.stringify([]),
        due_date || null,
        linked_type || 'General',
        linked_id || null,
        tags ? JSON.stringify(tags) : JSON.stringify([]),
        taskId
      ]
    );
    
    connection.release();
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  let connection;
  try {
    const { taskId } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM general_tasks WHERE id = ?', [taskId]);
    connection.release();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.post('/api/projects/:projectId/comments', async (req, res) => {
  let connection;
  try {
    const { projectId } = req.params;
    const { task_id, user_id, comment_text, file_id } = req.body;
    
    if (!user_id || !comment_text) {
      return res.status(400).json({ error: 'User ID and comment text are required' });
    }

    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO project_comments (project_id, task_id, user_id, comment_text, file_id)
       VALUES (?, ?, ?, ?, ?)`,
      [projectId, task_id || null, user_id, comment_text, file_id || null]
    );

    connection.release();
    res.json({ id: result.insertId, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error.message);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

app.get('/api/projects/:projectId/comments', async (req, res) => {
  let connection;
  try {
    const { projectId } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT pc.*, u.first_name, u.last_name, u.avatar FROM project_comments pc 
       LEFT JOIN users u ON pc.user_id = u.id
       WHERE pc.project_id = ? ORDER BY pc.created_at DESC`,
      [projectId]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/projects/:projectId/team', async (req, res) => {
  let connection;
  try {
    const { projectId } = req.params;
    const { user_id, role, added_by } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO project_team (project_id, user_id, role, added_by)
       VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE role = ?, added_at = NOW()`,
      [projectId, user_id, role || 'Member', added_by || null, role || 'Member']
    );

    connection.release();
    res.json({ message: 'Team member added successfully' });
  } catch (error) {
    console.error('Error adding team member:', error.message);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

app.get('/api/projects/:projectId/team', async (req, res) => {
  let connection;
  try {
    const { projectId } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT pt.*, u.first_name, u.last_name, u.email, u.avatar FROM project_team pt 
       LEFT JOIN users u ON pt.user_id = u.id
       WHERE pt.project_id = ? ORDER BY pt.added_at DESC`,
      [projectId]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching team members:', error.message);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

app.delete('/api/projects/:projectId/team/:userId', async (req, res) => {
  let connection;
  try {
    const { projectId, userId } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM project_team WHERE project_id = ? AND user_id = ?', [projectId, userId]);
    connection.release();
    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error.message);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

app.post('/api/deals/:dealId/convert-to-project', async (req, res) => {
  let connection;
  try {
    const { dealId } = req.params;
    const { name, project_type, category, start_date, due_date, priority, created_by } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    connection = await pool.getConnection();
    
    const [deal] = await connection.query('SELECT * FROM deals WHERE id = ?', [dealId]);
    if (deal.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Deal not found' });
    }

    const dealData = deal[0];
    const projectId = `PRJ-${Date.now()}`;
    
    const [result] = await connection.query(
      `INSERT INTO projects (name, project_id, project_type, deal_id, start_date, due_date, priority, status, category, price, description, created_by, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, projectId, project_type || 'Custom', dealId, start_date || null, due_date || dealData.expected_close_date, priority || 'High', 'Planning', category || 'Development', dealData.deal_value, dealData.description, created_by || null, 'Public']
    );

    const projectIdInserted = result.insertId;

    const [updateDeal] = await connection.query(
      'UPDATE deals SET status = "Won" WHERE id = ?',
      [dealId]
    );

    connection.release();
    
    res.json({ 
      message: 'Deal converted to project successfully',
      projectId: projectIdInserted,
      project_number: projectId
    });
  } catch (error) {
    console.error('Error converting deal to project:', error.message);
    res.status(500).json({ error: 'Failed to convert deal to project', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/projects/:projectId/activity', async (req, res) => {
  let connection;
  try {
    const { projectId } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT pa.*, u.first_name, u.last_name, u.avatar FROM project_activity pa 
       LEFT JOIN users u ON pa.user_id = u.id
       WHERE pa.project_id = ? ORDER BY pa.created_at DESC`,
      [projectId]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching activity:', error.message);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

app.get('/api/proposals', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { status, client_id, deal_id, search } = req.query;
    
    let query = `
      SELECT p.*, c.company_name, ct.first_name, ct.last_name,
             u.first_name as creator_first_name, u.last_name as creator_last_name
      FROM proposals p
      LEFT JOIN companies c ON p.client_id = c.id
      LEFT JOIN contacts ct ON p.contact_id = ct.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    if (client_id) {
      query += ' AND p.client_id = ?';
      params.push(client_id);
    }
    if (deal_id) {
      query += ' AND p.deal_id = ?';
      params.push(deal_id);
    }
    if (search) {
      query += ' AND (p.title LIKE ? OR p.proposal_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const [rows] = await connection.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching proposals:', error.message);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/proposals/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    
    const [proposal] = await connection.query(`
      SELECT p.*, c.company_name, ct.first_name, ct.last_name,
             u.first_name as creator_first_name, u.last_name as creator_last_name
      FROM proposals p
      LEFT JOIN companies c ON p.client_id = c.id
      LEFT JOIN contacts ct ON p.contact_id = ct.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [id]);
    
    if (proposal.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    const [lineItems] = await connection.query(`
      SELECT * FROM proposal_line_items WHERE proposal_id = ? ORDER BY id ASC
    `, [id]);
    
    const [history] = await connection.query(`
      SELECT ph.*, u.first_name, u.last_name
      FROM proposal_history ph
      LEFT JOIN users u ON ph.action_by = u.id
      WHERE ph.proposal_id = ?
      ORDER BY ph.created_at DESC
    `, [id]);
    
    res.json({
      ...proposal[0],
      lineItems,
      history
    });
  } catch (error) {
    console.error('Error fetching proposal:', error.message);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/proposals', async (req, res) => {
  let connection;
  try {
    const {
      title,
      proposal_number,
      description,
      client_id,
      contact_id,
      deal_id,
      created_by,
      proposal_date,
      validity_date,
      currency,
      terms_conditions,
      notes,
      lineItems
    } = req.body;
    
    if (!title || !proposal_number || !client_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    connection = await pool.getConnection();
    
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      for (const item of lineItems) {
        const subtotal = item.quantity * item.rate;
        const discount = (subtotal * item.discount_percent) / 100;
        const tax = ((subtotal - discount) * item.tax_percent) / 100;
        totalAmount += subtotal - discount + tax;
        totalDiscount += discount;
        totalTax += tax;
      }
    }
    
    const [result] = await connection.query(`
      INSERT INTO proposals (
        proposal_number, title, description, client_id, contact_id, deal_id,
        created_by, proposal_date, validity_date, total_amount, discount_amount,
        tax_amount, currency, terms_conditions, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      proposal_number,
      title,
      description || '',
      client_id,
      contact_id || null,
      deal_id || null,
      created_by || null,
      proposal_date || null,
      validity_date || null,
      totalAmount,
      totalDiscount,
      totalTax,
      currency || 'USD',
      terms_conditions || '',
      notes || ''
    ]);
    
    const proposalId = result.insertId;
    
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      for (const item of lineItems) {
        const subtotal = item.quantity * item.rate;
        const discount = (subtotal * item.discount_percent) / 100;
        const itemTax = ((subtotal - discount) * item.tax_percent) / 100;
        const itemTotal = subtotal - discount + itemTax;
        
        await connection.query(`
          INSERT INTO proposal_line_items (
            proposal_id, item_name, description, quantity, rate,
            discount_percent, discount_amount, tax_percent, tax_amount,
            subtotal, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          proposalId,
          item.item_name,
          item.description || '',
          item.quantity,
          item.rate,
          item.discount_percent || 0,
          discount,
          item.tax_percent || 0,
          itemTax,
          subtotal,
          itemTotal
        ]);
      }
    }
    
    await connection.query(`
      INSERT INTO proposal_history (proposal_id, action, action_by, new_status)
      VALUES (?, 'Created', ?, 'Draft')
    `, [proposalId, created_by || null]);
    
    res.json({ 
      message: 'Proposal created successfully', 
      id: proposalId,
      proposal_number: proposal_number
    });
  } catch (error) {
    console.error('Error creating proposal:', error.message);
    res.status(500).json({ error: 'Failed to create proposal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/proposals/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const {
      title,
      description,
      contact_id,
      deal_id,
      proposal_date,
      validity_date,
      currency,
      terms_conditions,
      notes,
      lineItems
    } = req.body;
    
    connection = await pool.getConnection();
    
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      for (const item of lineItems) {
        const subtotal = item.quantity * item.rate;
        const discount = (subtotal * item.discount_percent) / 100;
        const tax = ((subtotal - discount) * item.tax_percent) / 100;
        totalAmount += subtotal - discount + tax;
        totalDiscount += discount;
        totalTax += tax;
      }
    }
    
    await connection.query(`
      UPDATE proposals 
      SET title = ?, description = ?, contact_id = ?, deal_id = ?,
          proposal_date = ?, validity_date = ?, total_amount = ?,
          discount_amount = ?, tax_amount = ?, currency = ?,
          terms_conditions = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      title,
      description || '',
      contact_id || null,
      deal_id || null,
      proposal_date || null,
      validity_date || null,
      totalAmount,
      totalDiscount,
      totalTax,
      currency || 'USD',
      terms_conditions || '',
      notes || '',
      id
    ]);
    
    await connection.query('DELETE FROM proposal_line_items WHERE proposal_id = ?', [id]);
    
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      for (const item of lineItems) {
        const subtotal = item.quantity * item.rate;
        const discount = (subtotal * item.discount_percent) / 100;
        const itemTax = ((subtotal - discount) * item.tax_percent) / 100;
        const itemTotal = subtotal - discount + itemTax;
        
        await connection.query(`
          INSERT INTO proposal_line_items (
            proposal_id, item_name, description, quantity, rate,
            discount_percent, discount_amount, tax_percent, tax_amount,
            subtotal, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id,
          item.item_name,
          item.description || '',
          item.quantity,
          item.rate,
          item.discount_percent || 0,
          discount,
          item.tax_percent || 0,
          itemTax,
          subtotal,
          itemTotal
        ]);
      }
    }
    
    res.json({ message: 'Proposal updated successfully' });
  } catch (error) {
    console.error('Error updating proposal:', error.message);
    res.status(500).json({ error: 'Failed to update proposal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/proposals/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM proposals WHERE id = ?', [id]);
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error.message);
    res.status(500).json({ error: 'Failed to delete proposal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/proposals/:id/status', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status, comments, action_by } = req.body;
    
    const validStatuses = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Sent', 'Accepted', 'Declined'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    connection = await pool.getConnection();
    
    const [proposal] = await connection.query('SELECT status FROM proposals WHERE id = ?', [id]);
    if (proposal.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    const oldStatus = proposal[0].status;
    
    await connection.query(`
      UPDATE proposals SET status = ?, updated_at = NOW() WHERE id = ?
    `, [status, id]);
    
    await connection.query(`
      INSERT INTO proposal_history (proposal_id, action, action_by, old_status, new_status, comments)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, 'Status Changed', action_by || null, oldStatus, status, comments || '']);
    
    res.json({ message: 'Proposal status updated successfully' });
  } catch (error) {
    console.error('Error updating proposal status:', error.message);
    res.status(500).json({ error: 'Failed to update proposal status', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/proposals/:id/convert-to-invoice', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { created_by } = req.body;
    
    connection = await pool.getConnection();
    
    const [proposal] = await connection.query(`
      SELECT * FROM proposals WHERE id = ?
    `, [id]);
    
    if (proposal.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    const prop = proposal[0];
    
    const [lineItems] = await connection.query(`
      SELECT * FROM proposal_line_items WHERE proposal_id = ?
    `, [id]);
    
    const [result] = await connection.query(`
      INSERT INTO invoices (
        invoice_number, title, description, client_id, contact_id, deal_id,
        created_by, invoice_date, due_date, total_amount, discount_amount,
        tax_amount, currency, terms_conditions, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft')
    `, [
      `INV-${Date.now()}`,
      prop.title,
      prop.description,
      prop.client_id,
      prop.contact_id,
      prop.deal_id,
      created_by || prop.created_by,
      new Date().toISOString().split('T')[0],
      prop.validity_date,
      prop.total_amount,
      prop.discount_amount,
      prop.tax_amount,
      prop.currency,
      prop.terms_conditions,
      prop.notes
    ]);
    
    const invoiceId = result.insertId;
    
    for (const item of lineItems) {
      await connection.query(`
        INSERT INTO invoice_line_items (
          invoice_id, item_name, description, quantity, rate,
          discount_percent, discount_amount, tax_percent, tax_amount,
          subtotal, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceId,
        item.item_name,
        item.description,
        item.quantity,
        item.rate,
        item.discount_percent,
        item.discount_amount,
        item.tax_percent,
        item.tax_amount,
        item.subtotal,
        item.total
      ]);
    }
    
    await connection.query(`
      UPDATE proposals SET status = 'Accepted', updated_at = NOW() WHERE id = ?
    `, [id]);
    
    await connection.query(`
      INSERT INTO proposal_history (proposal_id, action, action_by, new_status)
      VALUES (?, 'Converted to Invoice', ?, 'Accepted')
    `, [id, created_by || null]);
    
    res.json({ 
      message: 'Proposal converted to invoice successfully',
      invoiceId,
      invoiceNumber: `INV-${Date.now()}`
    });
  } catch (error) {
    console.error('Error converting proposal to invoice:', error.message);
    res.status(500).json({ error: 'Failed to convert proposal to invoice', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/proposals/:id/submit', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { created_by, comments } = req.body;
    
    connection = await pool.getConnection();
    
    const [proposal] = await connection.query('SELECT status FROM proposals WHERE id = ?', [id]);
    if (proposal.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal[0].status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft proposals can be submitted' });
    }
    
    await connection.query(`
      UPDATE proposals SET status = 'Submitted', updated_at = NOW() WHERE id = ?
    `, [id]);
    
    await connection.query(`
      INSERT INTO proposal_history (proposal_id, action, action_by, old_status, new_status, comments)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, 'Submitted for Approval', created_by || null, 'Draft', 'Submitted', comments || '']);
    
    res.json({ message: 'Proposal submitted for approval successfully' });
  } catch (error) {
    console.error('Error submitting proposal:', error.message);
    res.status(500).json({ error: 'Failed to submit proposal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/proposals/:id/approve', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { action_by, comments } = req.body;
    
    connection = await pool.getConnection();
    
    const [proposal] = await connection.query('SELECT status FROM proposals WHERE id = ?', [id]);
    if (proposal.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal[0].status !== 'Submitted') {
      return res.status(400).json({ error: 'Only submitted proposals can be approved' });
    }
    
    await connection.query(`
      UPDATE proposals SET status = 'Approved', updated_at = NOW() WHERE id = ?
    `, [id]);
    
    await connection.query(`
      INSERT INTO proposal_history (proposal_id, action, action_by, old_status, new_status, comments)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, 'Approved', action_by || null, 'Submitted', 'Approved', comments || '']);
    
    res.json({ message: 'Proposal approved successfully' });
  } catch (error) {
    console.error('Error approving proposal:', error.message);
    res.status(500).json({ error: 'Failed to approve proposal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/proposals/:id/reject', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { action_by, reason, comments } = req.body;
    
    connection = await pool.getConnection();
    
    const [proposal] = await connection.query('SELECT status FROM proposals WHERE id = ?', [id]);
    if (proposal.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal[0].status !== 'Submitted') {
      return res.status(400).json({ error: 'Only submitted proposals can be rejected' });
    }
    
    await connection.query(`
      UPDATE proposals SET status = 'Rejected', updated_at = NOW() WHERE id = ?
    `, [id]);
    
    await connection.query(`
      INSERT INTO proposal_history (proposal_id, action, action_by, old_status, new_status, comments)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, 'Rejected', action_by || null, 'Submitted', 'Rejected', reason || comments || '']);
    
    res.json({ message: 'Proposal rejected successfully' });
  } catch (error) {
    console.error('Error rejecting proposal:', error.message);
    res.status(500).json({ error: 'Failed to reject proposal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/proposals/:id/send', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { action_by, client_email, comments } = req.body;
    
    connection = await pool.getConnection();
    
    const [proposal] = await connection.query('SELECT status FROM proposals WHERE id = ?', [id]);
    if (proposal.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal[0].status !== 'Approved') {
      return res.status(400).json({ error: 'Only approved proposals can be sent' });
    }
    
    await connection.query(`
      UPDATE proposals SET status = 'Sent', updated_at = NOW() WHERE id = ?
    `, [id]);
    
    await connection.query(`
      INSERT INTO proposal_history (proposal_id, action, action_by, old_status, new_status, comments)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, 'Sent to Client', action_by || null, 'Approved', 'Sent', `Sent to ${client_email || 'client'}`]);
    
    res.json({ message: 'Proposal sent to client successfully' });
  } catch (error) {
    console.error('Error sending proposal:', error.message);
    res.status(500).json({ error: 'Failed to send proposal', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/proposals/:id/history', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    
    const [history] = await connection.query(`
      SELECT ph.*, u.first_name, u.last_name, u.email
      FROM proposal_history ph
      LEFT JOIN users u ON ph.action_by = u.id
      WHERE ph.proposal_id = ?
      ORDER BY ph.created_at DESC
    `, [id]);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching proposal history:', error.message);
    res.status(500).json({ error: 'Failed to fetch proposal history' });
  } finally {
    if (connection) connection.release();
  }
});

const server = app.listen(PORT, async () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${NODE_ENV}`);
  console.log(`✓ CORS origin: ${process.env.CORS_ORIGIN}`);
  await testConnection();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
