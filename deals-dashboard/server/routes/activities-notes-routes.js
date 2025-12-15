module.exports = function setupActivitiesNotesRoutes(app, pool) {

  async function getConnection() {
    return pool.getConnection();
  }

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

  app.post('/api/activities', async (req, res) => {
    let connection;
    try {
      const {
        activity_type, title, description, status, priority,
        contact_id, deal_id, project_id, company_id,
        assigned_to, created_by, scheduled_date, duration_minutes, meeting_link, notes
      } = req.body;

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO activities (
          activity_type, title, description, status, priority,
          contact_id, deal_id, project_id, company_id,
          assigned_to, created_by, scheduled_date, duration_minutes, meeting_link, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        activity_type || 'Note',
        title,
        description,
        status || 'Pending',
        priority || 'Medium',
        contact_id || null,
        deal_id || null,
        project_id || null,
        company_id || null,
        assigned_to || null,
        created_by || null,
        scheduled_date || null,
        duration_minutes || null,
        meeting_link || null,
        notes || null
      ]);

      res.status(201).json({
        message: 'Activity created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create activity', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/activities', async (req, res) => {
    let connection;
    try {
      const { contact_id, deal_id, project_id, company_id, type } = req.query;
      connection = await getConnection();

      let query = `
        SELECT a.*, 
               c.first_name as contact_name, 
               d.deal_name, 
               p.name as project_name,
               co.company_name,
               u1.first_name as assigned_to_name,
               u2.first_name as created_by_name
        FROM activities a
        LEFT JOIN contacts c ON a.contact_id = c.id
        LEFT JOIN deals d ON a.deal_id = d.id
        LEFT JOIN projects p ON a.project_id = p.id
        LEFT JOIN companies co ON a.company_id = co.id
        LEFT JOIN users u1 ON a.assigned_to = u1.id
        LEFT JOIN users u2 ON a.created_by = u2.id
        WHERE 1=1
      `;
      const params = [];

      if (contact_id) {
        query += ' AND a.contact_id = ?';
        params.push(contact_id);
      }
      if (deal_id) {
        query += ' AND a.deal_id = ?';
        params.push(deal_id);
      }
      if (project_id) {
        query += ' AND a.project_id = ?';
        params.push(project_id);
      }
      if (company_id) {
        query += ' AND a.company_id = ?';
        params.push(company_id);
      }
      if (type) {
        query += ' AND a.activity_type = ?';
        params.push(type);
      }

      query += ' ORDER BY a.created_at DESC LIMIT 100';

      const [activities] = await connection.query(query, params);
      res.json(activities);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch activities', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/activities/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { status, description, completed_date, notes } = req.body;

      connection = await getConnection();
      await connection.query(`
        UPDATE activities 
        SET status = ?, description = ?, completed_date = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `, [status || null, description || null, completed_date || null, notes || null, id]);

      res.json({ message: 'Activity updated successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to update activity', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/activities/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM activities WHERE id = ?', [id]);
      res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete activity', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/notes', async (req, res) => {
    let connection;
    try {
      const { title, description, contact_id, company_id, deal_id, project_id, priority, is_important, created_by } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO entity_notes (title, description, contact_id, company_id, deal_id, project_id, priority, is_important, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, description, contact_id || null, company_id || null, deal_id || null, project_id || null, priority || 'Medium', is_important || false, created_by || null]);

      res.status(201).json({
        message: 'Note created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create note', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/notes', async (req, res) => {
    let connection;
    try {
      const { contact_id, deal_id, project_id, company_id } = req.query;
      connection = await getConnection();

      let query = `
        SELECT n.*,
               c.first_name as contact_name,
               d.deal_name,
               p.name as project_name,
               co.company_name,
               u.first_name as created_by_name
        FROM entity_notes n
        LEFT JOIN contacts c ON n.contact_id = c.id
        LEFT JOIN deals d ON n.deal_id = d.id
        LEFT JOIN projects p ON n.project_id = p.id
        LEFT JOIN companies co ON n.company_id = co.id
        LEFT JOIN users u ON n.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (contact_id) {
        query += ' AND n.contact_id = ?';
        params.push(contact_id);
      }
      if (deal_id) {
        query += ' AND n.deal_id = ?';
        params.push(deal_id);
      }
      if (project_id) {
        query += ' AND n.project_id = ?';
        params.push(project_id);
      }
      if (company_id) {
        query += ' AND n.company_id = ?';
        params.push(company_id);
      }

      query += ' ORDER BY n.is_important DESC, n.created_at DESC LIMIT 100';

      const [notes] = await connection.query(query, params);
      res.json(notes);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch notes', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/notes/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM entity_notes WHERE id = ?', [id]);
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete note', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/activities/unified-feed', async (req, res) => {
    let connection;
    try {
      const { type = null, limit = 500 } = req.query;
      connection = await getConnection();

      const allActivities = [];

      try {
        const contactsQuery = `
          SELECT 'Contact' as activity_source, id, 'Contact Created' as type,
                 CONCAT(first_name, ' ', last_name) as title, email as description,
                 'Active' as status, 'Medium' as priority, created_at, created_at as scheduled_date,
                 CONCAT(first_name, ' ', last_name) as contact_name, '' as company_name, 
                 '' as deal_name, '' as project_name, '' as assigned_to_name, '' as created_by_name,
                 id as contact_id, null as company_id, null as deal_id, null as project_id
          FROM contacts
          ORDER BY created_at DESC LIMIT ${parseInt(limit)}
        `;

        const [contacts] = await connection.query(contactsQuery);
        allActivities.push(...contacts.map(c => ({
          ...c,
          icon: 'User',
          color: 'purple'
        })));
      } catch (e) {
        console.warn('⚠️ Contacts query failed:', e.message);
      }

      try {
        const companiesQuery = `
          SELECT 'Company' as activity_source, id, 'Company Created' as type, company_name as title,
                 industry as description, status as status, 'Medium' as priority, 
                 created_at, created_at as scheduled_date, '' as contact_name, company_name,
                 '' as deal_name, '' as project_name, '' as assigned_to_name, '' as created_by_name,
                 null as contact_id, id as company_id, null as deal_id, null as project_id
          FROM companies
          ORDER BY created_at DESC LIMIT ${parseInt(limit)}
        `;

        const [companies] = await connection.query(companiesQuery);
        allActivities.push(...companies.map(c => ({
          ...c,
          icon: 'Building2',
          color: 'orange'
        })));
      } catch (e) {
        console.warn('⚠️ Companies query failed:', e.message);
      }

      try {
        const dealsQuery = `
          SELECT 'Deal' as activity_source, id, 'Deal Created' as type, deal_name as title,
                 COALESCE(description, stage) as description, status, 'Medium' as priority, created_at,
                 created_at as scheduled_date, '' as contact_name, '' as company_name,
                 deal_name, '' as project_name, '' as assigned_to_name, '' as created_by_name,
                 null as contact_id, null as company_id, id as deal_id, null as project_id
          FROM deals
          ORDER BY created_at DESC LIMIT ${parseInt(limit)}
        `;

        const [deals] = await connection.query(dealsQuery);
        allActivities.push(...deals.map(d => ({
          ...d,
          icon: 'TrendingUp',
          color: 'red'
        })));
      } catch (e) {
        console.warn('⚠️ Deals query failed:', e.message);
      }

      try {
        const leadsQuery = `
          SELECT 'Lead' as activity_source, id, 'Lead Created' as type, 
                 lead_name as title, email as description,
                 lead_status as status, 'Medium' as priority, created_at, created_at as scheduled_date,
                 '' as contact_name, company as company_name, '' as deal_name, '' as project_name,
                 '' as assigned_to_name, '' as created_by_name,
                 null as contact_id, null as company_id, null as deal_id, null as project_id
          FROM leads
          ORDER BY created_at DESC LIMIT ${parseInt(limit)}
        `;

        const [leads] = await connection.query(leadsQuery);
        allActivities.push(...leads.map(l => ({
          ...l,
          icon: 'Star',
          color: 'indigo'
        })));
      } catch (e) {
        console.warn('⚠️ Leads query failed:', e.message);
      }

      try {
        const proposalsQuery = `
          SELECT 'Proposal' as activity_source, id, 'Proposal Sent' as type, name as title,
                 description, status, 'High' as priority,
                 created_at, created_at as scheduled_date, '' as contact_name, '' as company_name,
                 '' as deal_name, '' as project_name, '' as assigned_to_name, '' as created_by_name,
                 null as contact_id, null as company_id, null as deal_id, null as project_id
          FROM proposals
          ORDER BY created_at DESC LIMIT ${parseInt(limit)}
        `;

        const [proposals] = await connection.query(proposalsQuery);
        allActivities.push(...proposals.map(p => ({
          ...p,
          icon: 'FileText',
          color: 'cyan'
        })));
      } catch (e) {
        console.warn('⚠️ Proposals table query failed:', e.message);
      }

      try {
        const invoicesQuery = `
          SELECT 'Invoice' as activity_source, id, 'Invoice Created' as type, invoice_number as title,
                 COALESCE(description, notes) as description, status, 'High' as priority,
                 created_at, created_at as scheduled_date, '' as contact_name, '' as company_name,
                 '' as deal_name, '' as project_name, '' as assigned_to_name, '' as created_by_name,
                 null as contact_id, null as company_id, null as deal_id, null as project_id
          FROM invoices
          ORDER BY created_at DESC LIMIT ${parseInt(limit)}
        `;

        const [invoices] = await connection.query(invoicesQuery);
        allActivities.push(...invoices.map(i => ({
          ...i,
          icon: 'Receipt',
          color: 'green'
        })));
      } catch (e) {
        console.warn('⚠️ Invoices table query failed:', e.message);
      }

      allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (type && type !== 'null') {
        const filtered = allActivities.filter(a => a.type === type || a.activity_source === type);
        res.json(filtered.slice(0, parseInt(limit)));
      } else {
        res.json(allActivities.slice(0, parseInt(limit)));
      }
    } catch (error) {
      responseError(res, 500, 'Failed to fetch unified activity feed', error);
    } finally {
      if (connection) connection.release();
    }
  });

};
