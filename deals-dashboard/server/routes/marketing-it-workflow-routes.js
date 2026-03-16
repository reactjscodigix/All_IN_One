module.exports = function setupMarketingITWorkflowRoutes(app, pool) {

  // --- IT WORKFLOWS ---

  // Sprints
  app.get('/api/it/sprints', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { project_id } = req.query;
      let query = 'SELECT * FROM sprints';
      let params = [];
      if (project_id) {
        query += ' WHERE project_id = ?';
        params.push(project_id);
      }
      const [sprints] = await connection.query(query, params);
      connection.release();
      res.json(sprints);
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/it/sprints', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { project_id, name, goal, start_date, end_date } = req.body;
      const [result] = await connection.query(
        'INSERT INTO sprints (project_id, name, goal, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
        [project_id, name, goal, start_date, end_date]
      );
      connection.release();
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // Bugs
  app.get('/api/it/bugs', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { project_id, sprint_id } = req.query;
      let query = 'SELECT b.*, u1.first_name as reporter, u2.first_name as assignee FROM bugs b LEFT JOIN users u1 ON b.reported_by = u1.id LEFT JOIN users u2 ON b.assigned_to = u2.id';
      let params = [];
      if (project_id) {
        query += ' WHERE b.project_id = ?';
        params.push(project_id);
      }
      const [bugs] = await connection.query(query, params);
      connection.release();
      res.json(bugs);
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/it/bugs', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { project_id, sprint_id, title, description, severity, priority, reported_by } = req.body;
      const [result] = await connection.query(
        'INSERT INTO bugs (project_id, sprint_id, title, description, severity, priority, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [project_id, sprint_id, title, description, severity, priority, reported_by]
      );
      connection.release();
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // Deployments
  app.post('/api/it/deployments', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { project_id, environment, version, notes, deployed_by } = req.body;
      const [result] = await connection.query(
        'INSERT INTO deployments (project_id, environment, version, notes, deployed_by, status) VALUES (?, ?, ?, ?, ?, "Pending")',
        [project_id, environment, version, notes, deployed_by]
      );
      connection.release();
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // --- MARKETING WORKFLOWS ---

  // Creative Requests
  app.get('/api/marketing/creative-requests', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [requests] = await connection.query('SELECT r.*, u1.first_name as requester, u2.first_name as designer FROM creative_requests r LEFT JOIN users u1 ON r.requested_by = u1.id LEFT JOIN users u2 ON r.assigned_to = u2.id');
      connection.release();
      res.json(requests);
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/marketing/creative-requests', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { project_id, title, description, request_type, priority, requested_by, due_date } = req.body;
      const [result] = await connection.query(
        'INSERT INTO creative_requests (project_id, title, description, request_type, priority, requested_by, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [project_id, title, description, request_type, priority, requested_by, due_date]
      );
      connection.release();
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // Content Calendar
  app.get('/api/marketing/content-calendar', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [calendar] = await connection.query('SELECT * FROM content_calendar ORDER BY scheduled_date ASC');
      connection.release();
      res.json(calendar);
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/marketing/content-calendar', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { project_id, title, content_type, scheduled_date, platform, assigned_to } = req.body;
      const [result] = await connection.query(
        'INSERT INTO content_calendar (project_id, title, content_type, scheduled_date, platform, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
        [project_id, title, content_type, scheduled_date, platform, assigned_to]
      );
      connection.release();
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // SEO Management
  app.get('/api/marketing/seo', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [seo] = await connection.query('SELECT * FROM seo_management');
      connection.release();
      res.json(seo);
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/marketing/seo', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { project_id, keyword, target_url, target_ranking } = req.body;
      const [result] = await connection.query(
        'INSERT INTO seo_management (project_id, keyword, target_url, target_ranking) VALUES (?, ?, ?, ?)',
        [project_id, keyword, target_url, target_ranking]
      );
      connection.release();
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });
};
