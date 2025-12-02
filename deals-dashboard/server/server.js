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

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log('✓ Database connection successful');
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
    
    const { first_name, last_name, email, phone, company_id, position, status } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, email' });
    }

    connection = await pool.getConnection();
    const [result] = await connection.query('INSERT INTO contacts (first_name, last_name, email, phone, company_id, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [first_name, last_name, email, phone, company_id || null, position || '', status || 'Active']);
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
    const { first_name, last_name, email, phone, company_id, position, status } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, email' });
    }

    connection = await pool.getConnection();
    await connection.query(
      'UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ?, company_id = ?, position = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [first_name, last_name, email, phone, company_id || null, position || '', status || 'Active', id]
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
      tags, source, currency, language, description, planName, planType 
    } = req.body;
    
    if (!company_name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields: company_name, email, phone' });
    }
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO companies 
       (company_name, email, email_opt_out, phone, phone2, fax, website, address, account_url, 
        status, industry, city, state, country, reviews, owner, tags, source, 
        currency, language, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [company_name, email, email_opt_out || false, phone, phone2 || null, fax || null, website || null, address || null, 
       account_url || null, status || 'Active', industry || null, city || null, state || null, 
       country || null, reviews || null, owner || null, tags || null, source || null, 
       currency || 'USD', language || 'English', description || null]
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
    const { company_name, email, phone, website, address, account_url, status } = req.body;
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE companies SET company_name = ?, email = ?, phone = ?, website = ?, address = ?, account_url = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [company_name, email, phone, website, address, account_url, status, id]
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
    const connection = await pool.getConnection();
    
    const result = await connection.query(
      'INSERT INTO leads (lead_name, email, phone, company, lead_source, lead_status, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [name, email, phone, company || null, source || 'Website', status || 'Not Contacted', rating || 5, description || null]
    );
    
    connection.release();
    res.json({ 
      id: result[0].insertId,
      name,
      email,
      phone,
      company,
      source: source || 'Website',
      status: status || 'Not Contacted',
      rating: rating || 5,
      message: 'Lead created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create lead' });
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

const PORT = process.env.PORT || 5000;

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
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
