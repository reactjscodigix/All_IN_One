module.exports = function setupCRMRoutes(app, pool) {

  async function getConnection() {
    return pool.getConnection();
  }

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

  // ==================== ACTIVITIES ENDPOINTS ====================
  
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

  // ==================== NOTES ENDPOINTS ====================
  
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

  // ==================== PROJECT TASKS ENDPOINTS ====================
  
  app.post('/api/projects/:projectId/tasks', async (req, res) => {
    let connection;
    try {
      const { projectId } = req.params;
      const { title, description, status, priority, assigned_to, due_date, created_by } = req.body;

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO project_tasks (title, description, project_id, status, priority, assigned_to, due_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, description || null, projectId, status || 'Open', priority || 'Medium', assigned_to || null, due_date || null, created_by || null]);

      res.status(201).json({
        message: 'Task created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create task', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/projects/:projectId/tasks', async (req, res) => {
    let connection;
    try {
      const { projectId } = req.params;
      connection = await getConnection();

      const [tasks] = await connection.query(`
        SELECT t.*,
               u1.first_name as assigned_to_name,
               u2.first_name as created_by_name
        FROM project_tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        WHERE t.project_id = ?
        ORDER BY t.created_at DESC
      `, [projectId]);

      res.json(tasks);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch tasks', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/project-tasks/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { status, description, assigned_to, completed_date } = req.body;

      connection = await getConnection();
      await connection.query(`
        UPDATE project_tasks 
        SET status = ?, description = ?, assigned_to = ?, completed_date = ?, updated_at = NOW()
        WHERE id = ?
      `, [status || null, description || null, assigned_to || null, completed_date || null, id]);

      res.json({ message: 'Task updated successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to update task', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/project-tasks/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM project_tasks WHERE id = ?', [id]);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete task', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // ==================== CONTACT TASKS ENDPOINTS ====================
  
  app.post('/api/contacts/:contactId/tasks', async (req, res) => {
    let connection;
    try {
      const { contactId } = req.params;
      const { title, description, status, priority, assigned_to, due_date, created_by } = req.body;

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO contact_tasks (title, description, contact_id, status, priority, assigned_to, due_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, description || null, contactId, status || 'Open', priority || 'Medium', assigned_to || null, due_date || null, created_by || null]);

      res.status(201).json({
        message: 'Contact task created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create contact task', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/contacts/:contactId/tasks', async (req, res) => {
    let connection;
    try {
      const { contactId } = req.params;
      connection = await getConnection();

      const [tasks] = await connection.query(`
        SELECT t.*,
               u1.first_name as assigned_to_name,
               u2.first_name as created_by_name
        FROM contact_tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        WHERE t.contact_id = ?
        ORDER BY t.due_date ASC
      `, [contactId]);

      res.json(tasks);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch contact tasks', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // ==================== PROJECT TEAM ENDPOINTS ====================
  
  app.post('/api/projects/:projectId/team', async (req, res) => {
    let connection;
    try {
      const { projectId } = req.params;
      const { user_id, role, allocation_percentage } = req.body;

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO project_team (project_id, user_id, role, allocation_percentage)
        VALUES (?, ?, ?, ?)
      `, [projectId, user_id, role || null, allocation_percentage || 100]);

      res.status(201).json({
        message: 'Team member added successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to add team member', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/projects/:projectId/team', async (req, res) => {
    let connection;
    try {
      const { projectId } = req.params;
      connection = await getConnection();

      const [team] = await connection.query(`
        SELECT pt.*, u.first_name, u.last_name, u.email, u.avatar
        FROM project_team pt
        JOIN users u ON pt.user_id = u.id
        WHERE pt.project_id = ?
        ORDER BY pt.joined_at DESC
      `, [projectId]);

      res.json(team);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch project team', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/projects/:projectId/team/:userId', async (req, res) => {
    let connection;
    try {
      const { projectId, userId } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM project_team WHERE project_id = ? AND user_id = ?', [projectId, userId]);
      res.json({ message: 'Team member removed successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to remove team member', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // ==================== PROJECT TIMESHEETS ENDPOINTS ====================
  
  app.post('/api/projects/:projectId/timesheets', async (req, res) => {
    let connection;
    try {
      const { projectId } = req.params;
      const { user_id, work_date, hours_worked, description, created_by } = req.body;

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO project_timesheets (project_id, user_id, work_date, hours_worked, description, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [projectId, user_id, work_date, hours_worked, description || null, created_by || null]);

      res.status(201).json({
        message: 'Timesheet entry created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create timesheet entry', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/projects/:projectId/timesheets', async (req, res) => {
    let connection;
    try {
      const { projectId } = req.params;
      const { user_id, start_date, end_date } = req.query;

      connection = await getConnection();

      let query = `
        SELECT pt.*, u.first_name, u.last_name, u.email
        FROM project_timesheets pt
        JOIN users u ON pt.user_id = u.id
        WHERE pt.project_id = ?
      `;
      const params = [projectId];

      if (user_id) {
        query += ' AND pt.user_id = ?';
        params.push(user_id);
      }
      if (start_date) {
        query += ' AND pt.work_date >= ?';
        params.push(start_date);
      }
      if (end_date) {
        query += ' AND pt.work_date <= ?';
        params.push(end_date);
      }

      query += ' ORDER BY pt.work_date DESC';

      const [timesheets] = await connection.query(query, params);
      res.json(timesheets);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch timesheets', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // ==================== ESTIMATION LINE ITEMS ENDPOINTS ====================
  
  app.post('/api/estimations/:estimationId/items', async (req, res) => {
    let connection;
    try {
      const { estimationId } = req.params;
      const { item_name, description, quantity, rate, discount_percent, tax_percent } = req.body;

      connection = await getConnection();
      const discount_amount = (quantity * rate * (discount_percent || 0)) / 100;
      const subtotal = quantity * rate - discount_amount;
      const tax_amount = (subtotal * (tax_percent || 0)) / 100;
      const total = subtotal + tax_amount;

      const [result] = await connection.query(`
        INSERT INTO estimation_line_items 
        (estimation_id, item_name, description, quantity, rate, discount_percent, discount_amount, tax_percent, tax_amount, subtotal, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [estimationId, item_name, description || null, quantity, rate, discount_percent || 0, discount_amount, tax_percent || 0, tax_amount, subtotal, total]);

      res.status(201).json({
        message: 'Estimation item added successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to add estimation item', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/estimations/:estimationId/items', async (req, res) => {
    let connection;
    try {
      const { estimationId } = req.params;
      connection = await getConnection();

      const [items] = await connection.query(`
        SELECT * FROM estimation_line_items 
        WHERE estimation_id = ?
        ORDER BY created_at ASC
      `, [estimationId]);

      res.json(items);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch estimation items', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/estimation-items/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM estimation_line_items WHERE id = ?', [id]);
      res.json({ message: 'Estimation item deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete estimation item', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // ==================== PIPELINE STAGES ENDPOINTS ====================
  
  app.get('/api/pipeline-stages', async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      const [stages] = await connection.query(`
        SELECT * FROM pipeline_stages 
        ORDER BY position ASC
      `);
      res.json(stages);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch pipeline stages', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/pipeline-stages', async (req, res) => {
    let connection;
    try {
      const { name, pipeline_id, position, description } = req.body;
      connection = await getConnection();

      const [result] = await connection.query(`
        INSERT INTO pipeline_stages (name, pipeline_id, position, description)
        VALUES (?, ?, ?, ?)
      `, [name, pipeline_id || null, position || 0, description || null]);

      res.status(201).json({
        message: 'Pipeline stage created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create pipeline stage', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // ==================== ENTITY FILES ENDPOINTS ====================
  
  app.post('/api/entity-files', async (req, res) => {
    let connection;
    try {
      const { file_id, company_id, deal_id, contact_id, project_id, uploaded_by } = req.body;

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO entity_files (file_id, company_id, deal_id, contact_id, project_id, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [file_id, company_id || null, deal_id || null, contact_id || null, project_id || null, uploaded_by || null]);

      res.status(201).json({
        message: 'File association created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to associate file', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/entity-files', async (req, res) => {
    let connection;
    try {
      const { company_id, deal_id, contact_id, project_id } = req.query;
      connection = await getConnection();

      let query = `
        SELECT ef.*, f.name, f.file_type, f.size_bytes, u.first_name as uploaded_by_name
        FROM entity_files ef
        JOIN files f ON ef.file_id = f.id
        LEFT JOIN users u ON ef.uploaded_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (company_id) {
        query += ' AND ef.company_id = ?';
        params.push(company_id);
      }
      if (deal_id) {
        query += ' AND ef.deal_id = ?';
        params.push(deal_id);
      }
      if (contact_id) {
        query += ' AND ef.contact_id = ?';
        params.push(contact_id);
      }
      if (project_id) {
        query += ' AND ef.project_id = ?';
        params.push(project_id);
      }

      query += ' ORDER BY ef.created_at DESC';

      const [files] = await connection.query(query, params);
      res.json(files);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch entity files', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/entity-files/:id', async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await getConnection();
      await connection.query('DELETE FROM entity_files WHERE id = ?', [id]);
      res.json({ message: 'File association deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete file association', error);
    } finally {
      if (connection) connection.release();
    }
  });

};
