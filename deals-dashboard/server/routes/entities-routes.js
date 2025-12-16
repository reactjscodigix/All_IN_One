module.exports = function setupEntitiesRoutes(app, pool) {

  async function getConnection() {
    return pool.getConnection();
  }

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

  app.get('/api/contacts', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, search } = req.query;
      connection = await getConnection();

      let query = `SELECT 
        ct.id,
        ct.first_name,
        ct.last_name,
        ct.email,
        ct.phone,
        ct.company_id,
        ct.position,
        ct.status,
        ct.created_at,
        ct.updated_at,
        c.company_name,
        c.city AS location,
        c.address
      FROM contacts ct
      LEFT JOIN companies c ON ct.company_id = c.id
      WHERE 1=1`;
      const params = [];

      if (search) {
        query += ' AND (ct.first_name LIKE ? OR ct.last_name LIKE ? OR ct.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY ct.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [contacts] = await connection.query(query, params);
      connection.release();

      return res.json(contacts);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch contacts', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/contacts', async (req, res) => {
    let connection;
    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        company_id,
        position,
        department,
        address,
        city,
        state,
        country,
        source,
        status,
        notes,
        avatar
      } = req.body;

      if (!first_name) {
        return res.status(400).json({ error: 'First name required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO contacts (
          first_name, last_name, email, phone, company_id,
          position, department, address, city, state, country, source,
          status, notes, avatar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name,
          last_name || null,
          email || null,
          phone || null,
          company_id || null,
          position || null,
          department || null,
          address || null,
          city || null,
          state || null,
          country || null,
          source || null,
          status || 'Active',
          notes || null,
          avatar || null
        ]
      );

      const [contact] = await connection.query('SELECT * FROM contacts WHERE id = ?', [result.insertId]);
      connection.release();

      return res.status(201).json(contact[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create contact', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/contacts/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const {
        first_name,
        last_name,
        email,
        phone,
        company_id,
        position,
        department,
        address,
        city,
        state,
        country,
        source,
        status,
        notes,
        avatar
      } = req.body;

      connection = await getConnection();
      await connection.query(
        `UPDATE contacts SET
          first_name = ?, last_name = ?, email = ?, phone = ?,
          company_id = ?, position = ?, department = ?, address = ?, city = ?,
          state = ?, country = ?, source = ?, status = ?, notes = ?, avatar = ?,
          updated_at = NOW()
         WHERE id = ?`,
        [
          first_name || null,
          last_name || null,
          email || null,
          phone || null,
          company_id || null,
          position || null,
          department || null,
          address || null,
          city || null,
          state || null,
          country || null,
          source || null,
          status || 'Active',
          notes || null,
          avatar || null,
          id
        ]
      );

      const [contact] = await connection.query('SELECT * FROM contacts WHERE id = ?', [id]);
      connection.release();

      return res.json(contact[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to update contact', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/companies', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, search } = req.query;
      connection = await getConnection();

      let query = `SELECT 
        c.id,
        c.company_name,
        c.email,
        c.phone,
        c.website,
        c.industry,
        c.status,
        c.created_at,
        COUNT(ct.id) AS contact_count
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id
      WHERE 1=1`;
      const params = [];

      if (search) {
        query += ' AND (c.company_name LIKE ? OR c.industry LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' GROUP BY c.id ORDER BY c.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [companies] = await connection.query(query, params);
      connection.release();

      return res.json(companies);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch companies', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/companies/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      const [companies] = await connection.query('SELECT * FROM companies WHERE id = ?', [id]);
      connection.release();

      if (companies.length === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }

      return res.json(companies[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch company', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/companies', async (req, res) => {
    let connection;
    try {
      const { 
        company_name, email, phone, website, industry, address, city, state, country, 
        status, description, created_by 
      } = req.body;

      if (!company_name) {
        return res.status(400).json({ error: 'Company name required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        `INSERT INTO companies (company_name, email, phone, website, industry, address, city, state, country, status, description, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_name, email || null, phone || null, website || null, industry || null, address || null, city || null, state || null, country || null, status || 'Active', description || null, created_by || null]
      );

      const [company] = await connection.query('SELECT * FROM companies WHERE id = ?', [result.insertId]);
      connection.release();

      return res.status(201).json(company[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create company', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/companies/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { 
        company_name, email, phone, website, industry, address, city, state, country, 
        status, description 
      } = req.body;

      if (!company_name) {
        return res.status(400).json({ error: 'Company name required' });
      }

      connection = await getConnection();
      await connection.query(
        `UPDATE companies SET company_name = ?, email = ?, phone = ?, website = ?, industry = ?, address = ?, city = ?, state = ?, country = ?, status = ?, description = ? WHERE id = ?`,
        [company_name, email || null, phone || null, website || null, industry || null, address || null, city || null, state || null, country || null, status || 'Active', description || null, id]
      );

      const [company] = await connection.query('SELECT * FROM companies WHERE id = ?', [id]);
      connection.release();

      return res.json(company[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to update company', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/companies/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();

      await connection.query('DELETE FROM companies WHERE id = ?', [id]);
      connection.release();

      return res.json({ success: true, message: 'Company deleted successfully' });
    } catch (err) {
      responseError(res, 500, 'Failed to delete company', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/users', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, search } = req.query;
      connection = await getConnection();

      let query = 'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE 1=1';
      const params = [];

      if (search) {
        query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY u.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [users] = await connection.query(query, params);
      connection.release();

      const usersWithoutPassword = users.map(u => {
        const { password, ...user } = u;
        return user;
      });

      return res.json(usersWithoutPassword);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch users', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/deals', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, search, status } = req.query;
      connection = await getConnection();

      let query = `SELECT 
        d.*,
        c.company_name,
        ct.email AS contact_email,
        ct.phone AS contact_phone,
        ct.first_name AS contact_first_name,
        ct.last_name AS contact_last_name,
        u.first_name AS assignee_first_name,
        u.last_name AS assignee_last_name
      FROM deals d 
      LEFT JOIN companies c ON d.company_id = c.id 
      LEFT JOIN contacts ct ON d.contact_id = ct.id 
      LEFT JOIN users u ON d.assignee_id = u.id 
      WHERE 1=1`;
      const params = [];

      if (search) {
        query += ' AND d.deal_name LIKE ?';
        params.push(`%${search}%`);
      }

      if (status) {
        query += ' AND d.status = ?';
        params.push(status);
      }

      query += ' ORDER BY d.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [deals] = await connection.query(query, params);
      connection.release();

      return res.json(deals);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch deals', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/deals', async (req, res) => {
    let connection;
    try {
      const {
        deal_name,
        description,
        deal_value,
        currency,
        status,
        company_id,
        contact_id,
        assignee_id,
        pipeline,
        deal_stage,
        probability,
        expected_close_date,
        due_date,
        follow_up_date,
        source,
        priority,
        period,
        period_value,
        tags
      } = req.body;

      if (!deal_name) {
        return res.status(400).json({ error: 'Deal name required' });
      }

      connection = await getConnection();
      
      const createCompanyId = company_id ? parseInt(company_id, 10) : null;
      const createContactId = contact_id ? parseInt(contact_id, 10) : null;
      const createAssigneeId = assignee_id ? parseInt(assignee_id, 10) : null;
      
      if (createCompanyId && !isNaN(createCompanyId)) {
        const [companyCheck] = await connection.query(
          'SELECT id FROM companies WHERE id = ?',
          [createCompanyId]
        );
        if (companyCheck.length === 0) {
          connection.release();
          return res.status(400).json({
            error: 'Invalid company ID',
            details: `Company with ID ${createCompanyId} does not exist`
          });
        }
      }
      
      let finalProbability = probability;
      
      if (!finalProbability && pipeline) {
        const [stage] = await connection.query(
          'SELECT probability FROM pipeline_stages WHERE name = ? AND status = ?',
          [pipeline, 'Active']
        );
        if (stage.length > 0) {
          finalProbability = stage[0].probability;
        } else {
          finalProbability = 10;
        }
      }
      
      if (!finalProbability) {
        finalProbability = 10;
      }

      const [result] = await connection.query(
        `INSERT INTO deals (
          deal_name, description, deal_value, currency, status, company_id,
          contact_id, assignee_id, pipeline, deal_stage, probability,
          expected_close_date, due_date, follow_up_date, source, priority,
          period, period_value, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deal_name,
          description || null,
          deal_value || 0,
          currency || 'USD',
          status || 'Open',
          createCompanyId,
          createContactId,
          createAssigneeId,
          pipeline || null,
          deal_stage || null,
          finalProbability,
          expected_close_date || null,
          due_date || null,
          follow_up_date || null,
          source || null,
          priority || 'Medium',
          period || null,
          period_value || null,
          tags ? (Array.isArray(tags) ? tags.join(',') : tags) : null
        ]
      );

      const [deal] = await connection.query('SELECT * FROM deals WHERE id = ?', [result.insertId]);
      connection.release();

      return res.status(201).json(deal[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create deal', err);
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
        description,
        deal_value,
        currency,
        status,
        company_id,
        contact_id,
        assignee_id,
        pipeline,
        deal_stage,
        probability,
        expected_close_date,
        due_date,
        follow_up_date,
        source,
        priority,
        period,
        period_value,
        tags
      } = req.body;

      console.log(`📝 Updating deal ${id} with company_id: ${company_id} (type: ${typeof company_id})`);

      connection = await getConnection();
      
      const finalCompanyId = company_id ? parseInt(company_id, 10) : null;
      const finalContactId = contact_id ? parseInt(contact_id, 10) : null;
      const finalAssigneeId = assignee_id ? parseInt(assignee_id, 10) : null;
      
      if (finalCompanyId && !isNaN(finalCompanyId)) {
        const [companyCheck] = await connection.query(
          'SELECT id FROM companies WHERE id = ?',
          [finalCompanyId]
        );
        if (companyCheck.length === 0) {
          connection.release();
          return res.status(400).json({
            error: 'Invalid company ID',
            details: `Company with ID ${finalCompanyId} does not exist`
          });
        }
      }
      
      let finalProbability = probability;
      
      if (!finalProbability && pipeline) {
        const [stage] = await connection.query(
          'SELECT probability FROM pipeline_stages WHERE name = ? AND status = ?',
          [pipeline, 'Active']
        );
        if (stage.length > 0) {
          finalProbability = stage[0].probability;
        } else {
          finalProbability = 10;
        }
      }
      
      if (!finalProbability) {
        finalProbability = null;
      }
      
      let autoProposal = false;
      if (pipeline === 'Won') {
        autoProposal = true;
      }

      await connection.query(
        `UPDATE deals SET
          deal_name = ?, description = ?, deal_value = ?, currency = ?, status = ?,
          company_id = ?, contact_id = ?, assignee_id = ?, pipeline = ?,
          deal_stage = ?, probability = ?, expected_close_date = ?,
          due_date = ?, follow_up_date = ?, source = ?, priority = ?,
          period = ?, period_value = ?, tags = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          deal_name || null,
          description || null,
          deal_value || 0,
          currency || 'USD',
          status || null,
          finalCompanyId,
          finalContactId,
          finalAssigneeId,
          pipeline || null,
          deal_stage || null,
          finalProbability,
          expected_close_date || null,
          due_date || null,
          follow_up_date || null,
          source || null,
          priority || 'Medium',
          period || null,
          period_value || null,
          tags ? (Array.isArray(tags) ? tags.join(',') : tags) : null,
          id
        ]
      );
      
      if (autoProposal) {
        const [existingProposal] = await connection.query(
          'SELECT id, proposal_number FROM proposals WHERE deal_id = ? LIMIT 1',
          [id]
        );
        
        let proposalId = null;
        let proposalNumber = null;
        
        if (existingProposal.length === 0) {
          proposalNumber = `PROP-${Date.now()}`;
          const proposalDate = new Date().toISOString().split('T')[0];
          const validityDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          const [proposalResult] = await connection.query(
            `INSERT INTO proposals (
              proposal_number, title, description, client_id, contact_id, deal_id,
              created_by, status, proposal_date, validity_date, total_amount, currency
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              proposalNumber,
              deal_name || 'Proposal',
              description || null,
              company_id || null,
              contact_id || null,
              id,
              assignee_id || null,
              'Draft',
              proposalDate,
              validityDate,
              deal_value || 0,
              currency || 'USD'
            ]
          );
          proposalId = proposalResult.insertId;
          console.log(`✓ Auto-created proposal ${proposalNumber} (ID: ${proposalId}) for deal ${id}`);
        } else {
          proposalId = existingProposal[0].id;
          proposalNumber = existingProposal[0].proposal_number;
          console.log(`⚠️ Proposal ${proposalNumber} already exists for deal ${id}, skipping creation`);
        }
        
        const [existingProject] = await connection.query(
          'SELECT id, name FROM projects WHERE deal_id = ? LIMIT 1',
          [id]
        );
        
        let projectId = null;
        
        if (existingProject.length === 0) {
          const [projectResult] = await connection.query(
            `INSERT INTO projects (
              name, title, description, deal_id, company_id, contact_id,
              budget, currency, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              deal_name || 'Project',
              deal_name || 'New Project',
              description || null,
              id,
              company_id || null,
              contact_id || null,
              deal_value || 0,
              currency || 'USD',
              'Planning',
              assignee_id || null
            ]
          );
          projectId = projectResult.insertId;
          console.log(`✓ Auto-created project (ID: ${projectId}) for deal ${id}`);
        } else {
          projectId = existingProject[0].id;
          console.log(`⚠️ Project "${existingProject[0].name}" already exists for deal ${id}, skipping creation`);
        }
      }

      const [deal] = await connection.query('SELECT * FROM deals WHERE id = ?', [id]);
      connection.release();

      return res.json(deal[0]);
    } catch (err) {
      console.error('❌ Deal update error:', err.message);
      if (err.message && err.message.includes('foreign key constraint')) {
        return responseError(res, 400, 'Failed to update deal - Invalid company or contact', err);
      }
      responseError(res, 500, 'Failed to update deal', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/projects', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, search, status } = req.query;
      connection = await getConnection();

      let query = 'SELECT p.*, c.company_name FROM projects p LEFT JOIN companies c ON p.company_id = c.id WHERE 1=1';
      const params = [];

      if (search) {
        query += ' AND p.title LIKE ?';
        params.push(`%${search}%`);
      }

      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [projects] = await connection.query(query, params);
      connection.release();

      return res.json(projects);
    } catch (err) {
      responseError(res, 500, 'Failed to fetch projects', err);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/projects', async (req, res) => {
    let connection;
    try {
      const { title, description, status, company_id } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Project title required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(
        'INSERT INTO projects (title, description, status, company_id) VALUES (?, ?, ?, ?)',
        [title, description || null, status || 'Planning', company_id || null]
      );

      const [project] = await connection.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
      connection.release();

      return res.status(201).json(project[0]);
    } catch (err) {
      responseError(res, 500, 'Failed to create project', err);
    } finally {
      if (connection) connection.release();
    }
  });

};
