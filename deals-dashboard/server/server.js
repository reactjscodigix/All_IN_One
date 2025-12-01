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
app.use(bodyParser.json());

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

app.get('/api/deals', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, c.company_name, ct.first_name, ct.last_name 
      FROM deals d 
      LEFT JOIN companies c ON d.company_id = c.id 
      LEFT JOIN contacts ct ON d.contact_id = ct.id 
      ORDER BY d.created_at DESC
    `);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

app.post('/api/deals', async (req, res) => {
  try {
    const { deal_name, stage, deal_value, status, company_id, contact_id } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO deals (deal_name, stage, deal_value, status, company_id, contact_id) VALUES (?, ?, ?, ?, ?, ?)', 
      [deal_name, stage, deal_value, status, company_id, contact_id]);
    connection.release();
    res.json({ message: 'Deal created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create deal' });
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

app.post('/api/contacts', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, company_id, position, status } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO contacts (first_name, last_name, email, phone, company_id, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [first_name, last_name, email, phone, company_id, position, status]);
    connection.release();
    res.json({ message: 'Contact created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows, fields] = await connection.query(`
      SELECT c.*, cs.plan_name, cs.plan_type, cs.currency, cs.language, cs.price, cs.registered_date, cs.expiring_on
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      ORDER BY c.created_at DESC
    `);
    connection.release();
    const fs = require('fs');
    const logMsg = `Fields: ${fields.map(f => f.name).join(', ')}\nFirst row keys: ${Object.keys(rows[0] || {}).join(', ')}\nFirst row: ${JSON.stringify(rows[0])}\n`;
    fs.appendFileSync('./api.log', logMsg);
    res.json(rows);
  } catch (error) {
    console.error('Error in /api/companies:', error.message, error.sql);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT c.*, cs.plan_name, cs.plan_type, cs.currency, cs.language, cs.price, cs.registered_date, cs.expiring_on
      FROM companies c
      LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'Active'
      WHERE c.id = ?
    `, [id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { company_name, email, phone, website, address, account_url, status, planName, planType, currency, language } = req.body;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO companies (company_name, email, phone, website, address, account_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [company_name, email, phone, website, address, account_url, status || 'Active']
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
    console.error(error);
    res.status(500).json({ error: 'Failed to create company' });
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

    await connection.query(
      `INSERT INTO company_plans 
      (plan_name, plan_type, plan_position, plan_currency, plan_currency_free, discount_type, discount, 
       limitations_invoices, max_customers, product, supplier, modules, access_trial, trial_days, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        planName,
        planType,
        planPosition || null,
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
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Failed to create plan' });
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
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { lead_name, email, phone, company, lead_source, lead_status, rating, notes } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO leads (lead_name, email, phone, company, lead_source, lead_status, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [lead_name, email, phone, company, lead_source, lead_status, rating, notes]
    );
    connection.release();
    res.json({ message: 'Lead created successfully' });
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

const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${NODE_ENV}`);
  console.log(`✓ CORS origin: ${process.env.CORS_ORIGIN}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
