module.exports = function setupTasksProjectsRoutes(app, pool) {

  async function getConnection() {
    return pool.getConnection();
  }

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

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

  app.get('/api/tasks', async (req, res) => {
    let connection;
    try {
      const { skip = 0, limit = 50, status, search } = req.query;
      connection = await getConnection();

      let query = 'SELECT gt.* FROM general_tasks gt WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND gt.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (gt.title LIKE ? OR gt.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY gt.due_date ASC, gt.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [tasks] = await connection.query(query, params);
      res.json(tasks);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch tasks', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/tasks', async (req, res) => {
    let connection;
    try {
      const { title, description, status, priority, assigned_to, due_date, tags } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Task title required' });
      }

      connection = await getConnection();
      const [result] = await connection.query(`
        INSERT INTO general_tasks (title, description, status, priority, assigned_to, due_date, tags, linked_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'General')
      `, [
        title,
        description || null,
        status || 'Open',
        priority || 'Medium',
        assigned_to ? JSON.stringify(assigned_to) : null,
        due_date || null,
        tags ? JSON.stringify(tags) : null
      ]);

      const [task] = await connection.query('SELECT * FROM general_tasks WHERE id = ?', [result.insertId]);
      res.status(201).json(task[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to create task', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.get('/api/tasks/:taskId', async (req, res) => {
    let connection;
    try {
      const { taskId } = req.params;
      connection = await getConnection();

      const [tasks] = await connection.query('SELECT * FROM general_tasks WHERE id = ?', [taskId]);

      if (tasks.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(tasks[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch task', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.put('/api/tasks/:taskId', async (req, res) => {
    let connection;
    try {
      const { taskId } = req.params;
      const { title, description, status, priority, assigned_to, due_date, tags } = req.body;

      connection = await getConnection();
      await connection.query(`
        UPDATE general_tasks 
        SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?, tags = ?, updated_at = NOW()
        WHERE id = ?
      `, [
        title || null,
        description || null,
        status || null,
        priority || null,
        assigned_to ? JSON.stringify(assigned_to) : null,
        due_date || null,
        tags ? JSON.stringify(tags) : null,
        taskId
      ]);

      const [task] = await connection.query('SELECT * FROM general_tasks WHERE id = ?', [taskId]);
      res.json(task[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to update task', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete('/api/tasks/:taskId', async (req, res) => {
    let connection;
    try {
      const { taskId } = req.params;
      connection = await getConnection();

      await connection.query('DELETE FROM general_tasks WHERE id = ?', [taskId]);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete task', error);
    } finally {
      if (connection) connection.release();
    }
  });

};
