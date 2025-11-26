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
    const [rows] = await connection.query('SELECT * FROM deals ORDER BY created_at DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

app.post('/api/deals', async (req, res) => {
  try {
    const { deal_name, stage, deal_value, status } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO deals (deal_name, stage, deal_value, status) VALUES (?, ?, ?, ?)', [deal_name, stage, deal_value, status]);
    connection.release();
    res.json({ message: 'Deal created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
