const { requireAuth, requireRole } = require('../middleware/authMiddleware');

module.exports = function(app, pool) {
  
  async function getConnection() {
    return pool.getConnection();
  }

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

  app.get('/api/invoices', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, status, search } = req.query;
      connection = await getConnection();

      let query = `SELECT 
        i.*,
        c.company_name,
        c.company_name AS client_name,
        c.email AS company_email,
        c.phone AS company_phone,
        d.due_date as deal_due_date,
        d.expected_close_date as deal_expected_close_date
      FROM invoices i 
      LEFT JOIN companies c ON i.client_id = c.id 
      LEFT JOIN deals d ON i.deal_id = d.id
      WHERE 1=1`;
      const params = [];

      if (status) {
        query += ' AND i.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (i.invoice_number LIKE ? OR c.company_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY i.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [invoices] = await connection.query(query, params);
      connection.release();

      console.log('📊 Raw invoices from DB:', JSON.stringify(invoices.slice(0, 2), null, 2));

      const processedInvoices = invoices.map(inv => {
        const processed = {
          ...inv,
          amount: inv.amount !== null && inv.amount !== undefined ? parseFloat(inv.amount) : 0,
          total: inv.total !== null && inv.total !== undefined ? parseFloat(inv.total) : (inv.amount !== null && inv.amount !== undefined ? parseFloat(inv.amount) : 0),
          amount_paid: inv.amount_paid !== null && inv.amount_paid !== undefined ? parseFloat(inv.amount_paid) : 0,
          open_till: inv.open_till || inv.deal_due_date || inv.deal_expected_close_date || null,
          invoice_date: inv.invoice_date || new Date().toISOString().split('T')[0]
        };
        return processed;
      });

      console.log('✅ Processed invoices (sample):', JSON.stringify(processedInvoices.slice(0, 2), null, 2));

      return res.json(processedInvoices);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch invoices', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/invoices', async (req, res) => {
    let connection;
    try {
      const { invoice_number, client_id, bill_to, ship_to, project_id, amount, currency, invoice_date, open_till, payment_method, status, description, subtotal, discount_percentage, tax_percentage, notes } = req.body;

      if (!invoice_number || !client_id) {
        return res.status(400).json({ error: 'Invoice number and client ID required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO invoices (invoice_number, client_id, bill_to, ship_to, project_id, amount, currency, invoice_date, open_till, payment_method, status, description, subtotal, discount_percentage, tax_percentage, notes, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoice_number, client_id, bill_to || null, ship_to || null, project_id || null, amount || 0, currency || 'USD', invoice_date || null, open_till || null, payment_method || null, status || 'Draft', description || null, subtotal || 0, discount_percentage || 0, tax_percentage || 0, notes || null, amount || 0]
      );

      const [invoice] = await connection.query(
        `SELECT i.*, c.company_name AS client_name, c.email AS company_email, c.phone AS company_phone 
         FROM invoices i 
         LEFT JOIN companies c ON i.client_id = c.id 
         WHERE i.id = ?`,
        [result.insertId]
      );
      connection.release();

      return res.status(201).json(invoice[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create invoice', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/invoices/metrics/summary', async (req, res) => {
    let connection;
    try {
      connection = await getConnection();

      const [metrics] = await connection.query(
        'SELECT COUNT(*) as total_invoices, SUM(amount) as total_amount, AVG(amount) as avg_amount FROM invoices'
      );

      const [byStatus] = await connection.query(
        'SELECT status, COUNT(*) as count, SUM(amount) as total FROM invoices GROUP BY status'
      );

      connection.release();

      return res.json({
        summary: metrics[0],
        byStatus: byStatus
      });
    } catch (err) {
      responseError(res, 500, 'Failed to fetch invoice metrics', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/invoices/status/breakdown', async (req, res) => {
    let connection;
    try {
      connection = await getConnection();

      const [breakdown] = await connection.query(
        'SELECT status, COUNT(*) as count, SUM(amount) as total FROM invoices GROUP BY status'
      );

      connection.release();

      return res.json(breakdown);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch invoice breakdown', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/invoices/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;

      connection = await getConnection();
      
      await connection.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
      await connection.query('DELETE FROM invoices WHERE id = ?', [id]);

      connection.release();

      return res.json({ message: 'Invoice deleted successfully' });
    } catch (err) {
      responseError(res, 500, 'Failed to delete invoice', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/invoices/:id/refund', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { refund_amount, refund_date, reason } = req.body;

      if (!refund_amount) {
        return res.status(400).json({ error: 'Refund amount required' });
      }

      connection = await getConnection();
      
      const [invoice] = await connection.query('SELECT * FROM invoices WHERE id = ?', [id]);
      if (!invoice.length) {
        connection.release();
        return res.status(404).json({ error: 'Invoice not found' });
      }

      await connection.query(
        'UPDATE invoices SET status = ?, amount_paid = ?, payment_date = ? WHERE id = ?',
        ['Refunded', refund_amount * -1, refund_date || new Date(), id]
      );

      const [updatedInvoice] = await connection.query(
        'SELECT i.*, c.company_name as client_name FROM invoices i LEFT JOIN companies c ON i.client_id = c.id WHERE i.id = ?',
        [id]
      );

      connection.release();

      return res.json(updatedInvoice[0] || {});
    } catch (err) {
      responseError(res, 500, 'Failed to process refund', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/invoices/:invoiceId/link-to-deal/:dealId', async (req, res) => {
    let connection;
    try {
      const { invoiceId, dealId } = req.params;

      connection = await getConnection();
      await connection.query(
        'UPDATE invoices SET project_id = ? WHERE id = ?',
        [dealId, invoiceId]
      );

      const [invoice] = await connection.query(
        'SELECT i.*, c.company_name as client_name FROM invoices i LEFT JOIN companies c ON i.client_id = c.id WHERE i.id = ?',
        [invoiceId]
      );

      connection.release();

      return res.json(invoice[0] || {});
    } catch (err) {
      responseError(res, 500, 'Failed to link invoice to deal', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/invoices/:invoiceId/link-to-client/:clientId', async (req, res) => {
    let connection;
    try {
      const { invoiceId, clientId } = req.params;

      connection = await getConnection();
      await connection.query(
        'UPDATE invoices SET client_id = ? WHERE id = ?',
        [clientId, invoiceId]
      );

      const [invoice] = await connection.query(
        'SELECT i.*, c.company_name as client_name FROM invoices i LEFT JOIN companies c ON i.client_id = c.id WHERE i.id = ?',
        [invoiceId]
      );

      connection.release();

      return res.json(invoice[0] || {});
    } catch (err) {
      responseError(res, 500, 'Failed to link invoice to client', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/companies/:companyId/invoices', async (req, res) => {
    let connection;
    try {
      const { companyId } = req.params;
      const { skip = 0, limit = 50, status } = req.query;

      connection = await getConnection();

      let query = 'SELECT i.*, c.company_name as client_name FROM invoices i LEFT JOIN companies c ON i.client_id = c.id WHERE i.client_id = ?';
      const params = [companyId];

      if (status) {
        query += ' AND i.status = ?';
        params.push(status);
      }

      query += ' ORDER BY i.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [invoices] = await connection.query(query, params);
      connection.release();

      return res.json(invoices);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch company invoices', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/deals/:dealId/invoices', async (req, res) => {
    let connection;
    try {
      const { dealId } = req.params;
      const { skip = 0, limit = 50, status } = req.query;

      connection = await getConnection();

      let query = 'SELECT i.*, c.company_name as client_name FROM invoices i LEFT JOIN companies c ON i.client_id = c.id WHERE i.project_id = ?';
      const params = [dealId];

      if (status) {
        query += ' AND i.status = ?';
        params.push(status);
      }

      query += ' ORDER BY i.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [invoices] = await connection.query(query, params);
      connection.release();

      return res.json(invoices);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch deal invoices', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/invoices/:id/items', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [items] = await connection.query(
        'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC',
        [id]
      );
      connection.release();

      return res.json(items || []);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch invoice items', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/invoices/:id/items', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { item_name, description, quantity, rate, price, discount, discount_percentage, tax, tax_percentage } = req.body;

      if (!item_name && !description) {
        return res.status(400).json({ error: 'Item name or description required' });
      }

      const itemPrice = rate || price || 0;
      const itemQuantity = quantity || 1;
      const itemAmount = itemPrice * itemQuantity;

      connection = await getConnection();
      const [result] = await connection.query(
        'INSERT INTO invoice_items (invoice_id, item_name, description, quantity, price, discount_percentage, tax_percentage, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, item_name || null, description || null, itemQuantity, itemPrice, discount_percentage || 0, tax_percentage || 0, itemAmount]
      );

      const [item] = await connection.query('SELECT * FROM invoice_items WHERE id = ?', [result.insertId]);
      connection.release();

      return res.status(201).json(item[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create invoice item', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/invoices/:invoiceId/items/:itemId', async (req, res) => {
    let connection;
    try {
      const { invoiceId, itemId } = req.params;
      const { item_name, description, quantity, rate, price, discount_percentage, tax_percentage } = req.body;

      const itemPrice = rate || price || 0;
      const itemQuantity = quantity || 1;
      const itemAmount = itemPrice * itemQuantity;

      connection = await getConnection();
      await connection.query(
        'UPDATE invoice_items SET item_name = ?, description = ?, quantity = ?, price = ?, discount_percentage = ?, tax_percentage = ?, amount = ? WHERE id = ? AND invoice_id = ?',
        [item_name || null, description || null, itemQuantity, itemPrice, discount_percentage || 0, tax_percentage || 0, itemAmount, itemId, invoiceId]
      );

      const [item] = await connection.query('SELECT * FROM invoice_items WHERE id = ?', [itemId]);
      connection.release();

      return res.json(item[0] || {});
    } catch (err) {
      responseError(res, 500, 'Failed to update invoice item', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/invoices/:invoiceId/items/:itemId', async (req, res) => {
    let connection;
    try {
      const { invoiceId, itemId } = req.params;

      connection = await getConnection();
      await connection.query('DELETE FROM invoice_items WHERE id = ? AND invoice_id = ?', [itemId, invoiceId]);
      connection.release();

      return res.json({ message: 'Invoice item deleted successfully' });
    } catch (err) {
      responseError(res, 500, 'Failed to delete invoice item', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/invoices/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [invoices] = await connection.query(
        `SELECT i.*, c.company_name, c.company_name as client_name, c.email as company_email, c.phone as company_phone,
                d.due_date as deal_due_date, d.expected_close_date as deal_expected_close_date
         FROM invoices i 
         LEFT JOIN companies c ON i.client_id = c.id 
         LEFT JOIN deals d ON i.deal_id = d.id
         WHERE i.id = ?`,
        [id]
      );
      connection.release();

      if (invoices.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      const invoice = invoices[0];
      const processedInvoice = {
        ...invoice,
        amount: invoice.amount !== null && invoice.amount !== undefined ? parseFloat(invoice.amount) : 0,
        total: invoice.total !== null && invoice.total !== undefined ? parseFloat(invoice.total) : (invoice.amount !== null && invoice.amount !== undefined ? parseFloat(invoice.amount) : 0),
        amount_paid: invoice.amount_paid !== null && invoice.amount_paid !== undefined ? parseFloat(invoice.amount_paid) : 0,
        open_till: invoice.open_till || invoice.deal_due_date || invoice.deal_expected_close_date || null,
        invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0]
      };

      return res.json(processedInvoice);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch invoice', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/invoices/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { bill_to, ship_to, amount, status, payment_method, notes, amount_paid, payment_date, total, open_till, deal_id } = req.body;
      
      connection = await getConnection();
      await connection.query(
        'UPDATE invoices SET bill_to = ?, ship_to = ?, amount = ?, status = ?, payment_method = ?, notes = ?, amount_paid = ?, payment_date = ?, total = ?, open_till = ?, deal_id = ?, updated_at = NOW() WHERE id = ?',
        [bill_to || null, ship_to || null, amount || null, status || null, payment_method || null, notes || null, amount_paid || null, payment_date || null, total || amount || null, open_till || null, deal_id || null, id]
      );

      const [invoice] = await connection.query(
        `SELECT i.*, c.company_name as client_name, c.email as company_email, c.phone as company_phone,
                d.due_date as deal_due_date, d.expected_close_date as deal_expected_close_date
         FROM invoices i 
         LEFT JOIN companies c ON i.client_id = c.id 
         LEFT JOIN deals d ON i.deal_id = d.id
         WHERE i.id = ?`,
        [id]
      );
      connection.release();

      if (invoice.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      const inv = invoice[0];
      const processedInvoice = {
        ...inv,
        amount: inv.amount !== null && inv.amount !== undefined ? parseFloat(inv.amount) : 0,
        total: inv.total !== null && inv.total !== undefined ? parseFloat(inv.total) : (inv.amount !== null && inv.amount !== undefined ? parseFloat(inv.amount) : 0),
        amount_paid: inv.amount_paid !== null && inv.amount_paid !== undefined ? parseFloat(inv.amount_paid) : 0,
        open_till: inv.open_till || inv.deal_due_date || inv.deal_expected_close_date || null,
        invoice_date: inv.invoice_date || new Date().toISOString().split('T')[0]
      };

      return res.json(processedInvoice);
    } catch (err) {
      responseError(res, 500, 'Failed to update invoice', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/campaigns', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, status, search } = req.query;
      connection = await getConnection();

      let query = 'SELECT c.*, u.first_name as created_by_name FROM campaigns c LEFT JOIN users u ON c.created_by = u.id WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND c.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND c.name LIKE ?';
        const searchTerm = `%${search}%`;
        params.push(searchTerm);
      }

      query += ' ORDER BY c.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [campaigns] = await connection.query(query, params);
      connection.release();

      return res.json(campaigns);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch campaigns', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/campaigns', async (req, res) => {
    let connection;
    try {
      const { name, description, status, start_date, end_date, budget, currency, created_by } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Campaign name required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO campaigns (name, description, status, start_date, end_date, budget, currency, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, description || null, status || 'Draft', start_date || null, end_date || null, budget || null, currency || 'USD', created_by || null]
      );

      const [campaign] = await connection.query(
        'SELECT c.*, u.first_name as created_by_name FROM campaigns c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?',
        [result.insertId]
      );
      connection.release();

      return res.status(201).json(campaign[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create campaign', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/campaigns/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [campaigns] = await connection.query(
        'SELECT c.*, u.first_name as created_by_name FROM campaigns c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?',
        [id]
      );
      connection.release();

      if (campaigns.length === 0) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      return res.json(campaigns[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch campaign', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/campaigns/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { name, description, status, start_date, end_date, budget } = req.body;
      
      connection = await getConnection();
      await connection.query(
        'UPDATE campaigns SET name = ?, description = ?, status = ?, start_date = ?, end_date = ?, budget = ? WHERE id = ?',
        [name || null, description || null, status || null, start_date || null, end_date || null, budget || null, id]
      );

      const [campaign] = await connection.query(
        'SELECT c.*, u.first_name as created_by_name FROM campaigns c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?',
        [id]
      );
      connection.release();

      return res.json(campaign[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to update campaign', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/call-history', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 100, call_type, call_direction, search } = req.query;
      connection = await getConnection();

      let query = 'SELECT * FROM call_history WHERE 1=1';
      const params = [];

      if (call_type) {
        query += ' AND call_type = ?';
        params.push(call_type);
      }

      if (call_direction) {
        query += ' AND call_direction = ?';
        params.push(call_direction);
      }

      if (search) {
        query += ' AND (caller_name LIKE ? OR phone_number LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [calls] = await connection.query(query, params);
      connection.release();

      return res.json(calls);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch call history', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/call-history', async (req, res) => {
    let connection;
    try {
      const { caller_name, caller_email, phone_number, call_type, call_direction, duration, started_at, ended_at, meeting_link, notes, created_by } = req.body;

      if (!caller_name || !phone_number) {
        return res.status(400).json({ error: 'Caller name and phone number required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO call_history (caller_name, caller_email, phone_number, call_type, call_direction, duration, started_at, ended_at, meeting_link, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [caller_name, caller_email || null, phone_number, call_type || 'Audio Call', call_direction || 'Outgoing', duration || 0, started_at || null, ended_at || null, meeting_link || null, notes || null, created_by || null]
      );

      const [call] = await connection.query('SELECT * FROM call_history WHERE id = ?', [result.insertId]);
      connection.release();

      return res.status(201).json(call[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create call history', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/call-history/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [calls] = await connection.query('SELECT * FROM call_history WHERE id = ?', [id]);
      connection.release();

      if (calls.length === 0) {
        return res.status(404).json({ error: 'Call history not found' });
      }

      return res.json(calls[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch call history', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/contracts', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, status, search } = req.query;
      connection = await getConnection();

      let query = 'SELECT c.*, co.company_name as client_name, u.first_name as created_by_name FROM contracts c LEFT JOIN companies co ON c.client_id = co.id LEFT JOIN users u ON c.created_by = u.id WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND c.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (c.subject LIKE ? OR co.company_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY c.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [contracts] = await connection.query(query, params);
      connection.release();

      return res.json(contracts);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch contracts', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/contracts', async (req, res) => {
    let connection;
    try {
      const { subject, start_date, end_date, client_id, contract_type, contract_value, description, status, created_by } = req.body;

      if (!subject || !client_id || !contract_type) {
        return res.status(400).json({ error: 'Subject, client ID, and contract type required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO contracts (subject, start_date, end_date, client_id, contract_type, contract_value, description, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [subject, start_date || null, end_date || null, client_id, contract_type, contract_value || 0, description || null, status || 'Draft', created_by || null]
      );

      const [contract] = await connection.query(
        'SELECT c.*, co.company_name as client_name, u.first_name as created_by_name FROM contracts c LEFT JOIN companies co ON c.client_id = co.id LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?',
        [result.insertId]
      );
      connection.release();

      return res.status(201).json(contract[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create contract', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/contracts/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [contracts] = await connection.query(
        'SELECT c.*, co.company_name as client_name, u.first_name as created_by_name FROM contracts c LEFT JOIN companies co ON c.client_id = co.id LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?',
        [id]
      );
      connection.release();

      if (contracts.length === 0) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      return res.json(contracts[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch contract', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/contracts/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { subject, start_date, end_date, contract_type, contract_value, description, status } = req.body;
      
      connection = await getConnection();
      await connection.query(
        'UPDATE contracts SET subject = ?, start_date = ?, end_date = ?, contract_type = ?, contract_value = ?, description = ?, status = ? WHERE id = ?',
        [subject || null, start_date || null, end_date || null, contract_type || null, contract_value || null, description || null, status || null, id]
      );

      const [contract] = await connection.query(
        'SELECT c.*, co.company_name as client_name, u.first_name as created_by_name FROM contracts c LEFT JOIN companies co ON c.client_id = co.id LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?',
        [id]
      );
      connection.release();

      return res.json(contract[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to update contract', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/contracts/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM contracts WHERE id = ?', [id]);
      connection.release();
      return res.json({ message: 'Contract deleted successfully' });
    } catch (err) {
      responseError(res, 500, 'Failed to delete contract', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/contracts/:id/convert-to-estimation', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;

      connection = await getConnection();
      
      const [contract] = await connection.query('SELECT * FROM contracts WHERE id = ?', [id]);
      if (!contract.length) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      const contractData = contract[0];
      const estimationNumber = `EST-${Date.now()}`;
      const estimateDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const amount = contractData.contract_value || 0;

      const [result] = await connection.query(
        `INSERT INTO estimations (estimation_number, client_id, amount, currency, estimate_date, expiry_date, status)
         VALUES (?, ?, ?, 'USD', ?, ?, 'Draft')`,
        [estimationNumber, contractData.client_id, amount, estimateDate, expiryDate]
      );

      connection.release();
      return res.status(201).json({ message: 'Contract converted to estimation successfully', id: result.insertId });
    } catch (err) {
      responseError(res, 500, 'Failed to convert contract to estimation', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/estimations', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, status, search } = req.query;
      connection = await getConnection();

      let query = 'SELECT e.*, c.company_name as client_name FROM estimations e LEFT JOIN companies c ON e.client_id = c.id WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND e.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (e.estimation_number LIKE ? OR c.company_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY e.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [estimations] = await connection.query(query, params);
      connection.release();

      return res.json(estimations);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch estimations', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/estimations', async (req, res) => {
    let connection;
    try {
      const { estimation_number, client_id, contact_id, project_id, amount, currency, estimate_date, expiry_date, status, description } = req.body;

      if (!estimation_number || !client_id) {
        return res.status(400).json({ error: 'Estimation number and client ID required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO estimations (estimation_number, client_id, contact_id, project_id, amount, currency, estimate_date, expiry_date, status, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [estimation_number, client_id, contact_id || null, project_id || null, amount || 0, currency || 'USD', estimate_date || null, expiry_date || null, status || 'Draft', description || null]
      );

      const [estimation] = await connection.query(
        'SELECT e.*, c.company_name as client_name FROM estimations e LEFT JOIN companies c ON e.client_id = c.id WHERE e.id = ?',
        [result.insertId]
      );
      connection.release();

      return res.status(201).json(estimation[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create estimation', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/estimations/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [estimations] = await connection.query(
        'SELECT e.*, c.company_name as client_name FROM estimations e LEFT JOIN companies c ON e.client_id = c.id WHERE e.id = ?',
        [id]
      );
      connection.release();

      if (estimations.length === 0) {
        return res.status(404).json({ error: 'Estimation not found' });
      }

      return res.json(estimations[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch estimation', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/estimations/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { amount, status, description, expiry_date } = req.body;
      
      connection = await getConnection();
      await connection.query(
        'UPDATE estimations SET amount = ?, status = ?, description = ?, expiry_date = ? WHERE id = ?',
        [amount || null, status || null, description || null, expiry_date || null, id]
      );

      const [estimation] = await connection.query(
        'SELECT e.*, c.company_name as client_name FROM estimations e LEFT JOIN companies c ON e.client_id = c.id WHERE e.id = ?',
        [id]
      );
      connection.release();

      return res.json(estimation[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to update estimation', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/estimations/:id/send', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      
      await connection.query('UPDATE estimations SET status = ? WHERE id = ?', ['Sent', id]);
      const [estimation] = await connection.query('SELECT * FROM estimations WHERE id = ?', [id]);
      
      connection.release();
      return res.json({ message: 'Estimation sent successfully', data: estimation[0] });
    } catch (err) {
      responseError(res, 500, 'Failed to send estimation', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/estimations/:id/convert-to-invoice', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { invoice_number } = req.body;

      connection = await getConnection();
      
      const [estimation] = await connection.query('SELECT * FROM estimations WHERE id = ?', [id]);
      if (!estimation.length) {
        return res.status(404).json({ error: 'Estimation not found' });
      }

      const estimationData = estimation[0];
      const [result] = await connection.query(
        `INSERT INTO invoices (invoice_number, client_id, bill_to, ship_to, project_id, contact_id, amount, currency, invoice_date, open_till, status, description, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?)`,
        [
          invoice_number || `INV-${Date.now()}`,
          estimationData.client_id,
          estimationData.bill_to || null,
          estimationData.ship_to || null,
          estimationData.project_id || null,
          estimationData.contact_id || null,
          estimationData.amount,
          estimationData.currency,
          estimationData.estimate_date || null,
          estimationData.expiry_date || null,
          estimationData.description || null,
          estimationData.amount
        ]
      );

      const [invoice] = await connection.query(
        `SELECT i.*, c.company_name AS client_name, c.email AS company_email, c.phone AS company_phone 
         FROM invoices i 
         LEFT JOIN companies c ON i.client_id = c.id 
         WHERE i.id = ?`,
        [result.insertId]
      );

      connection.release();
      return res.status(201).json({ message: 'Estimation converted to invoice successfully', invoiceNumber: invoice[0].invoice_number, id: result.insertId });
    } catch (err) {
      responseError(res, 500, 'Failed to convert estimation to invoice', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/proposals', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, status, search } = req.query;
      connection = await getConnection();

      let query = 'SELECT p.*, c.company_name as client_name FROM proposals p LEFT JOIN companies c ON p.client_id = c.id WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (p.proposal_number LIKE ? OR p.title LIKE ? OR c.company_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [proposals] = await connection.query(query, params);
      connection.release();

      return res.json(proposals);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch proposals', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/proposals', async (req, res) => {
    let connection;
    try {
      const { proposal_number, title, client_id, contact_id, deal_id, amount, currency, proposal_date, validity_date, status, description, created_by } = req.body;

      if (!proposal_number || !client_id) {
        return res.status(400).json({ error: 'Proposal number and client ID required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO proposals (proposal_number, title, client_id, contact_id, deal_id, total_amount, currency, proposal_date, validity_date, status, description, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [proposal_number, title || null, client_id, contact_id || null, deal_id || null, amount || 0, currency || 'USD', proposal_date || null, validity_date || null, status || 'Draft', description || null, created_by || null]
      );

      const [proposal] = await connection.query(
        'SELECT p.*, c.company_name as client_name FROM proposals p LEFT JOIN companies c ON p.client_id = c.id WHERE p.id = ?',
        [result.insertId]
      );
      connection.release();

      return res.status(201).json(proposal[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create proposal', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/proposals/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [proposals] = await connection.query(
        'SELECT p.*, c.company_name as client_name FROM proposals p LEFT JOIN companies c ON p.client_id = c.id WHERE p.id = ?',
        [id]
      );
      connection.release();

      if (proposals.length === 0) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      return res.json(proposals[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch proposal', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/proposals/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { title, amount, status, validity_date, description } = req.body;
      
      connection = await getConnection();
      await connection.query(
        'UPDATE proposals SET title = ?, total_amount = ?, status = ?, validity_date = ?, description = ? WHERE id = ?',
        [title || null, amount || null, status || null, validity_date || null, description || null, id]
      );

      const [proposal] = await connection.query(
        'SELECT p.*, c.company_name as client_name FROM proposals p LEFT JOIN companies c ON p.client_id = c.id WHERE p.id = ?',
        [id]
      );
      connection.release();

      return res.json(proposal[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to update proposal', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/proposals/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM proposals WHERE id = ?', [id]);
      connection.release();
      return res.json({ message: 'Proposal deleted successfully' });
    } catch (err) {
      responseError(res, 500, 'Failed to delete proposal', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/proposals/:id/status', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      connection = await getConnection();
      await connection.query(
        'UPDATE proposals SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      const [proposal] = await connection.query(
        'SELECT p.*, c.company_name as client_name FROM proposals p LEFT JOIN companies c ON p.client_id = c.id WHERE p.id = ?',
        [id]
      );
      connection.release();

      return res.json({
        message: `Proposal status updated to ${status}`,
        proposal: proposal[0]
      });
    } catch (err) {
      responseError(res, 500, 'Failed to update proposal status', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/proposals/:id/send', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { client_email } = req.body;

      connection = await getConnection();
      
      const [proposal] = await connection.query(
        'SELECT * FROM proposals WHERE id = ?',
        [id]
      );

      if (proposal.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Proposal not found' });
      }

      await connection.query(
        'UPDATE proposals SET status = ?, updated_at = NOW() WHERE id = ?',
        ['Sent', id]
      );

      console.log(`✓ Proposal ${proposal[0].proposal_number} marked as sent`);
      connection.release();

      return res.json({
        message: 'Proposal sent successfully',
        proposal_number: proposal[0].proposal_number
      });
    } catch (err) {
      responseError(res, 500, 'Failed to send proposal', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/proposals/:id/convert-to-invoice', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { total_amount } = req.body;

      connection = await getConnection();
      
      const [proposal] = await connection.query(
        'SELECT * FROM proposals WHERE id = ?',
        [id]
      );

      if (proposal.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Proposal not found' });
      }

      const proposalData = proposal[0];

      if (!['Sent', 'Approved', 'Accepted'].includes(proposalData.status)) {
        connection.release();
        return res.status(400).json({ 
          error: 'Invalid proposal status',
          message: `Proposal must be Sent, Approved, or Accepted to convert. Current status: ${proposalData.status}`
        });
      }

      const invoiceNumber = `INV-${Date.now()}`;
      const invoiceDate = new Date().toISOString().split('T')[0];
      const openTill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const invoiceAmount = total_amount !== undefined ? total_amount : (proposalData.total_amount || 0);

      await connection.query(
        `INSERT INTO invoices (invoice_number, client_id, amount, currency, invoice_date, open_till, status, description, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoiceNumber,
          proposalData.client_id || null,
          invoiceAmount,
          proposalData.currency || 'USD',
          invoiceDate,
          openTill,
          'Draft',
          proposalData.description || null,
          invoiceAmount
        ]
      );

      await connection.query(
        'UPDATE proposals SET status = ? WHERE id = ?',
        ['Accepted', id]
      );

      console.log(`✓ Invoice ${invoiceNumber} created from proposal ${proposalData.proposal_number}`);
      connection.release();

      return res.json({
        message: 'Invoice created successfully from proposal',
        invoiceNumber,
        proposalId: id
      });
    } catch (err) {
      responseError(res, 500, 'Failed to convert proposal to invoice', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/proposals/:id/convert-to-contract', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'];

      connection = await getConnection();
      
      const [proposal] = await connection.query(
        'SELECT * FROM proposals WHERE id = ?',
        [id]
      );

      if (proposal.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Proposal not found' });
      }

      const proposalData = proposal[0];

      if (!['Sent', 'Approved', 'Accepted'].includes(proposalData.status)) {
        connection.release();
        return res.status(400).json({ 
          error: 'Invalid proposal status',
          message: `Proposal must be Sent, Approved, or Accepted to convert. Current status: ${proposalData.status}`
        });
      }

      const [existingContracts] = await connection.query(
        'SELECT id FROM contracts WHERE proposal_id = ?',
        [id]
      );

      if (existingContracts.length > 0) {
        connection.release();
        return res.status(409).json({ 
          error: 'Conflict - Contract already exists for this proposal',
          message: `A contract has already been created from proposal ${proposalData.proposal_number}`
        });
      }

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await connection.query(
        `INSERT INTO contracts (subject, start_date, end_date, client_id, contract_type, contract_value, description, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          proposalData.title || 'Contract from Proposal',
          startDate,
          endDate,
          proposalData.client_id || null,
          'Proposal-Based Contract',
          proposalData.total_amount || 0,
          proposalData.description || null,
          'Draft',
          userId || null
        ]
      );

      await connection.query(
        'UPDATE proposals SET status = ? WHERE id = ?',
        ['Accepted', id]
      );

      console.log(`✓ Contract created from proposal ${proposalData.proposal_number}`);
      connection.release();

      return res.json({
        message: 'Contract created successfully from proposal',
        contractSubject: proposalData.title || 'Contract from Proposal',
        proposalId: id
      });
    } catch (err) {
      responseError(res, 500, 'Failed to convert proposal to contract', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/estimations/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM estimations WHERE id = ?', [id]);
      connection.release();
      return res.json({ message: 'Estimation deleted successfully' });
    } catch (err) {
      responseError(res, 500, 'Failed to delete estimation', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/plans', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 10, status, search, planType, sortBy = 'created_at', order = 'DESC', page = 1 } = req.query;
      connection = await getConnection();

      let query = 'SELECT * FROM plans WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND plan_name LIKE ?';
        const searchTerm = `%${search}%`;
        params.push(searchTerm);
      }

      if (planType) {
        query += ' AND plan_type = ?';
        params.push(planType);
      }

      query += ` ORDER BY ${sortBy} ${order}`;
      
      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
      const offset = (pageNum - 1) * pageSize;
      
      query += ' LIMIT ?, ?';
      params.push(offset, pageSize);

      const [plans] = await connection.query(query, params);
      
      const countParams = [];
      let countQuery = 'SELECT COUNT(*) as total FROM plans WHERE 1=1';
      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      if (search) {
        countQuery += ' AND plan_name LIKE ?';
        countParams.push(`%${search}%`);
      }
      if (planType) {
        countQuery += ' AND plan_type = ?';
        countParams.push(planType);
      }
      
      const [countResult] = await connection.query(countQuery, countParams);
      
      connection.release();

      const total = countResult[0].total;
      const pages = Math.ceil(total / pageSize);

      return res.json({
        data: plans,
        pagination: {
          total,
          pages,
          page: pageNum,
          limit: pageSize
        }
      });
    } catch (err) {
      responseError(res, 500, 'Failed to fetch plans', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/plans', async (req, res) => {
    let connection;
    try {
      const { name, type, description, price, status, features } = req.body;

      if (!name || !price) {
        return res.status(400).json({ error: 'Plan name and price required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO plans (plan_name, plan_type, description, price, status, features, currency)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, type || null, description || null, price, status || 'Active', features ? JSON.stringify(features) : null, 'USD']
      );

      const [plan] = await connection.query('SELECT * FROM plans WHERE id = ?', [result.insertId]);
      connection.release();

      return res.status(201).json(plan[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create plan', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/plans/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [plans] = await connection.query('SELECT * FROM plans WHERE id = ?', [id]);
      connection.release();

      if (plans.length === 0) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      return res.json(plans[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch plan', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/plans/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { name, type, description, price, status, features } = req.body;
      
      connection = await getConnection();
      await connection.query(
        'UPDATE plans SET plan_name = ?, plan_type = ?, description = ?, price = ?, status = ?, features = ? WHERE id = ?',
        [name || null, type || null, description || null, price || null, status || null, features ? JSON.stringify(features) : null, id]
      );

      const [plan] = await connection.query('SELECT * FROM plans WHERE id = ?', [id]);
      connection.release();

      return res.json(plan[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to update plan', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/plans/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM plans WHERE id = ?', [id]);
      connection.release();
      return res.json({ message: 'Plan deleted successfully' });
    } catch (err) {
      responseError(res, 500, 'Failed to delete plan', err);
    } finally {
      if (connection) connection.release();
    }
  });

};
