const express = require('express');
const router = express.Router();

module.exports = function(app, pool) {
  
  app.get('/api/leads', async (req, res) => {
    let connection;
    try {
      const { status, source, skip = 0, limit = 50 } = req.query;
      connection = await pool.getConnection();
      
      let query = 'SELECT * FROM leads WHERE 1=1';
      const params = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      if (source) {
        query += ' AND source = ?';
        params.push(source);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));
      
      const [leads] = await connection.query(query, params);
      connection.release();
      
      return res.json({ success: true, data: leads, total: leads.length });
    } catch (err) {
      console.error('Error fetching leads:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/leads', async (req, res) => {
    let connection;
    try {
      const { first_name, last_name, email, phone, company_name, source, status, notes, created_by } = req.body;
      
      if (!first_name) {
        return res.status(400).json({ success: false, error: 'First name required' });
      }
      
      connection = await pool.getConnection();
      const [result] = await connection.query(
        `INSERT INTO leads (first_name, last_name, email, phone, company_name, source, status, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name || null, email || null, phone || null, company_name || null, source || 'Other', status || 'New', notes || null, created_by || null]
      );
      
      const [lead] = await connection.query('SELECT * FROM leads WHERE id = ?', [result.insertId]);
      connection.release();
      
      return res.status(201).json({ success: true, data: lead[0] });
    } catch (err) {
      console.error('Error creating lead:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/leads/:id', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [leads] = await connection.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
      connection.release();
      
      if (!leads.length) return res.status(404).json({ success: false, error: 'Lead not found' });
      return res.json({ success: true, data: leads[0] });
    } catch (err) {
      console.error('Error fetching lead:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/leads/:id', async (req, res) => {
    let connection;
    try {
      const { first_name, last_name, email, phone, company_name, source, status, notes } = req.body;
      connection = await pool.getConnection();
      
      const updateFields = [];
      const params = [];
      
      if (first_name !== undefined) { updateFields.push('first_name = ?'); params.push(first_name); }
      if (last_name !== undefined) { updateFields.push('last_name = ?'); params.push(last_name); }
      if (email !== undefined) { updateFields.push('email = ?'); params.push(email); }
      if (phone !== undefined) { updateFields.push('phone = ?'); params.push(phone); }
      if (company_name !== undefined) { updateFields.push('company_name = ?'); params.push(company_name); }
      if (source !== undefined) { updateFields.push('source = ?'); params.push(source); }
      if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
      if (notes !== undefined) { updateFields.push('notes = ?'); params.push(notes); }
      
      if (!updateFields.length) return res.status(400).json({ success: false, error: 'No fields to update' });
      
      updateFields.push('updated_at = NOW()');
      params.push(req.params.id);
      
      await connection.query(`UPDATE leads SET ${updateFields.join(', ')} WHERE id = ?`, params);
      const [lead] = await connection.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
      connection.release();
      
      return res.json({ success: true, data: lead[0] });
    } catch (err) {
      console.error('Error updating lead:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/leads/:id/convert', async (req, res) => {
    let connection;
    try {
      const { converted_company_id, converted_contact_id, converted_deal_id } = req.body;
      connection = await pool.getConnection();
      
      await connection.query(
        `UPDATE leads SET status = 'Converted', converted_company_id = ?, converted_contact_id = ?, converted_deal_id = ?, updated_at = NOW()
         WHERE id = ?`,
        [converted_company_id || null, converted_contact_id || null, converted_deal_id || null, req.params.id]
      );
      
      const [lead] = await connection.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
      connection.release();
      
      return res.json({ success: true, data: lead[0] });
    } catch (err) {
      console.error('Error converting lead:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/deals/:dealId/contacts', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [contacts] = await connection.query(
        `SELECT dc.*, c.* FROM deal_contacts dc
         JOIN contacts c ON dc.contact_id = c.id
         WHERE dc.deal_id = ? ORDER BY dc.is_primary DESC`,
        [req.params.dealId]
      );
      connection.release();
      
      return res.json({ success: true, data: contacts });
    } catch (err) {
      console.error('Error fetching deal contacts:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/deals/:dealId/contacts', async (req, res) => {
    let connection;
    try {
      const { contact_id, role, is_primary } = req.body;
      
      if (!contact_id) {
        return res.status(400).json({ success: false, error: 'Contact ID required' });
      }
      
      connection = await pool.getConnection();
      
      const [result] = await connection.query(
        `INSERT INTO deal_contacts (deal_id, contact_id, role, is_primary)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE role = ?, is_primary = ?`,
        [req.params.dealId, contact_id, role || null, is_primary ? 1 : 0, role || null, is_primary ? 1 : 0]
      );
      
      const [dealContact] = await connection.query(
        `SELECT dc.*, c.* FROM deal_contacts dc
         JOIN contacts c ON dc.contact_id = c.id
         WHERE dc.deal_id = ? AND dc.contact_id = ?`,
        [req.params.dealId, contact_id]
      );
      
      connection.release();
      return res.status(201).json({ success: true, data: dealContact[0] });
    } catch (err) {
      console.error('Error adding contact to deal:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/deals/:dealId/contacts/:contactId', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.query(
        'DELETE FROM deal_contacts WHERE deal_id = ? AND contact_id = ?',
        [req.params.dealId, req.params.contactId]
      );
      connection.release();
      
      return res.json({ success: true, message: 'Contact removed from deal' });
    } catch (err) {
      console.error('Error removing contact from deal:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/roles', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [roles] = await connection.query('SELECT * FROM roles ORDER BY name');
      connection.release();
      
      return res.json({ success: true, data: roles });
    } catch (err) {
      console.error('Error fetching roles:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/roles', async (req, res) => {
    let connection;
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, error: 'Role name required' });
      }
      
      connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [name, description || null]
      );
      
      const [role] = await connection.query('SELECT * FROM roles WHERE id = ?', [result.insertId]);
      connection.release();
      
      return res.status(201).json({ success: true, data: role[0] });
    } catch (err) {
      console.error('Error creating role:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/roles/:roleId/permissions', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [permissions] = await connection.query(
        'SELECT * FROM role_permissions WHERE role_id = ? ORDER BY module_name, permission_name',
        [req.params.roleId]
      );
      connection.release();
      
      return res.json({ success: true, data: permissions });
    } catch (err) {
      console.error('Error fetching role permissions:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/roles/:roleId/permissions', async (req, res) => {
    let connection;
    try {
      const { permission_name, module_name, can_create, can_read, can_update, can_delete, description } = req.body;
      
      if (!permission_name) {
        return res.status(400).json({ success: false, error: 'Permission name required' });
      }
      
      connection = await pool.getConnection();
      const [result] = await connection.query(
        `INSERT INTO role_permissions (role_id, permission_name, module_name, can_create, can_read, can_update, can_delete, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.params.roleId, permission_name, module_name || null, can_create || false, can_read || false, can_update || false, can_delete || false, description || null]
      );
      
      const [permission] = await connection.query('SELECT * FROM role_permissions WHERE id = ?', [result.insertId]);
      connection.release();
      
      return res.status(201).json({ success: true, data: permission[0] });
    } catch (err) {
      console.error('Error adding role permission:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/roles/:roleId/permissions/:permissionId', async (req, res) => {
    let connection;
    try {
      const { can_create, can_read, can_update, can_delete } = req.body;
      connection = await pool.getConnection();
      
      await connection.query(
        `UPDATE role_permissions SET can_create = ?, can_read = ?, can_update = ?, can_delete = ? WHERE id = ? AND role_id = ?`,
        [can_create || false, can_read || false, can_update || false, can_delete || false, req.params.permissionId, req.params.roleId]
      );
      
      const [permission] = await connection.query('SELECT * FROM role_permissions WHERE id = ?', [req.params.permissionId]);
      connection.release();
      
      return res.json({ success: true, data: permission[0] });
    } catch (err) {
      console.error('Error updating permission:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/users/:userId/roles', async (req, res) => {
    let connection;
    try {
      const { role_id, assigned_by } = req.body;
      
      if (!role_id) {
        return res.status(400).json({ success: false, error: 'Role ID required' });
      }
      
      connection = await pool.getConnection();
      const [result] = await connection.query(
        `INSERT INTO user_roles (user_id, role_id, assigned_by)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE assigned_by = ?, assigned_at = NOW()`,
        [req.params.userId, role_id, assigned_by || null, assigned_by || null]
      );
      
      const [userRole] = await connection.query(
        `SELECT ur.*, r.name as role_name FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = ? AND ur.role_id = ?`,
        [req.params.userId, role_id]
      );
      
      connection.release();
      return res.status(201).json({ success: true, data: userRole[0] });
    } catch (err) {
      console.error('Error assigning role to user:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/users/:userId/roles', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [roles] = await connection.query(
        `SELECT ur.*, r.* FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [req.params.userId]
      );
      connection.release();
      
      return res.json({ success: true, data: roles });
    } catch (err) {
      console.error('Error fetching user roles:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/users/:userId/permissions', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [permissions] = await connection.query(
        `SELECT DISTINCT rp.* FROM user_roles ur
         JOIN role_permissions rp ON ur.role_id = rp.role_id
         WHERE ur.user_id = ?`,
        [req.params.userId]
      );
      connection.release();
      
      return res.json({ success: true, data: permissions });
    } catch (err) {
      console.error('Error fetching user permissions:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/users/:userId/roles/:roleId', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.query(
        'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
        [req.params.userId, req.params.roleId]
      );
      connection.release();
      
      return res.json({ success: true, message: 'Role removed from user' });
    } catch (err) {
      console.error('Error removing role from user:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/activities/mentions', async (req, res) => {
    let connection;
    try {
      const { activity_id, mentioned_user_ids } = req.body;
      
      if (!activity_id || !mentioned_user_ids || !Array.isArray(mentioned_user_ids)) {
        return res.status(400).json({ success: false, error: 'Activity ID and user IDs array required' });
      }
      
      connection = await pool.getConnection();
      
      const mentions = [];
      for (const userId of mentioned_user_ids) {
        await connection.query(
          'INSERT INTO activity_mentions (activity_id, mentioned_user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE mentioned_user_id = ?',
          [activity_id, userId, userId]
        );
        mentions.push({ activity_id, mentioned_user_id: userId });
      }
      
      connection.release();
      return res.status(201).json({ success: true, data: mentions });
    } catch (err) {
      console.error('Error adding activity mentions:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/activities/:activityId/mentions', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [mentions] = await connection.query(
        `SELECT am.*, u.* FROM activity_mentions am
         JOIN users u ON am.mentioned_user_id = u.id
         WHERE am.activity_id = ?`,
        [req.params.activityId]
      );
      connection.release();
      
      return res.json({ success: true, data: mentions });
    } catch (err) {
      console.error('Error fetching activity mentions:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

};
