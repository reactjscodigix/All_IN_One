const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(cors());
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
    const [rows] = await connection.query('SELECT * FROM companies ORDER BY created_at DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { company_name, industry, email, phone, website, address, city, state, country, employee_count, annual_revenue, status } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO companies (company_name, industry, email, phone, website, address, city, state, country, employee_count, annual_revenue, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [company_name, industry, email, phone, website, address, city, state, country, employee_count, annual_revenue, status]
    );
    connection.release();
    res.json({ message: 'Company created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create company' });
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
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
