module.exports = function setupTasksProjectsRoutes(app, pool) {

  // Use pool.query directly for better connection management
  // This automatically acquires and releases connections from the pool
  const db = {
    query: (sql, params) => pool.query(sql, params)
  };

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

  app.post('/api/projects/:projectId/tasks', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { title, description, status, priority, assigned_to, due_date, created_by } = req.body;

      const [result] = await db.query(`
        INSERT INTO project_tasks (title, description, project_id, status, priority, assigned_to, due_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, description || null, projectId, status || 'Open', priority || 'Medium', assigned_to || null, due_date || null, created_by || null]);

      res.status(201).json({
        message: 'Task created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create task', error);
    }
  });

  app.get('/api/projects/:projectId/tasks', async (req, res) => {
    try {
      const { projectId } = req.params;
      const [tasks] = await db.query(`
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
    }
  });

  app.put('/api/project-tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, description, assigned_to, completed_date } = req.body;

      await db.query(`
        UPDATE project_tasks 
        SET status = ?, description = ?, assigned_to = ?, completed_date = ?, updated_at = NOW()
        WHERE id = ?
      `, [status || null, description || null, assigned_to || null, completed_date || null, id]);

      res.json({ message: 'Task updated successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to update task', error);
    }
  });

  app.delete('/api/project-tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM project_tasks WHERE id = ?', [id]);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete task', error);
    }
  });

  app.post('/api/contacts/:contactId/tasks', async (req, res) => {
    try {
      const { contactId } = req.params;
      const { title, description, status, priority, assigned_to, due_date, created_by } = req.body;

      const [result] = await db.query(`
        INSERT INTO contact_tasks (title, description, contact_id, status, priority, assigned_to, due_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, description || null, contactId, status || 'Open', priority || 'Medium', assigned_to || null, due_date || null, created_by || null]);

      res.status(201).json({
        message: 'Contact task created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create contact task', error);
    }
  });

  app.get('/api/contacts/:contactId/tasks', async (req, res) => {
    try {
      const { contactId } = req.params;
      const [tasks] = await db.query(`
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
    }
  });

  app.post('/api/projects/:projectId/team', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { user_id, role, allocation_percentage } = req.body;

      const [result] = await db.query(`
        INSERT INTO project_team (project_id, user_id, role, allocation_percentage)
        VALUES (?, ?, ?, ?)
      `, [projectId, user_id, role || null, allocation_percentage || 100]);

      res.status(201).json({
        message: 'Team member added successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to add team member', error);
    }
  });

  app.get('/api/projects/:projectId/team', async (req, res) => {
    try {
      const { projectId } = req.params;
      const [team] = await db.query(`
        SELECT pt.*, u.first_name, u.last_name, u.email, u.avatar
        FROM project_team pt
        JOIN users u ON pt.user_id = u.id
        WHERE pt.project_id = ?
        ORDER BY pt.joined_at DESC
      `, [projectId]);

      res.json(team);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch project team', error);
    }
  });

  app.delete('/api/projects/:projectId/team/:userId', async (req, res) => {
    try {
      const { projectId, userId } = req.params;
      await db.query('DELETE FROM project_team WHERE project_id = ? AND user_id = ?', [projectId, userId]);
      res.json({ message: 'Team member removed successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to remove team member', error);
    }
  });

  app.post('/api/projects/:projectId/timesheets', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { user_id, work_date, hours_worked, description, created_by } = req.body;

      const [result] = await db.query(`
        INSERT INTO project_timesheets (project_id, user_id, work_date, hours_worked, description, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [projectId, user_id, work_date, hours_worked, description || null, created_by || null]);

      res.status(201).json({
        message: 'Timesheet entry created successfully',
        id: result.insertId
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create timesheet entry', error);
    }
  });

  app.get('/api/projects/:projectId/timesheets', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { user_id, start_date, end_date } = req.query;

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

      const [timesheets] = await db.query(query, params);
      res.json(timesheets);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch timesheets', error);
    }
  });

  app.get('/api/tasks', async (req, res) => {
    try {
      const { skip = 0, limit = 50, status, search } = req.query;

      let query = `
        SELECT 
          gt.*, 
          u.first_name as assigned_by_name,
          CASE 
            WHEN gt.project_id IS NOT NULL THEN p_id.name
            WHEN gt.linked_type = 'Project' THEN p.name
            WHEN gt.linked_type = 'Deal' THEN d.deal_name
            WHEN gt.linked_type = 'Lead' THEN l.project_name
            ELSE NULL
          END as project_name,
          CASE 
            WHEN gt.project_id IS NOT NULL THEN c_pid.company_name
            WHEN gt.linked_type = 'Project' THEN c_p.company_name
            WHEN gt.linked_type = 'Deal' THEN c_d.company_name
            WHEN gt.linked_type = 'Lead' THEN l.lead_name
            ELSE NULL
          END as client_name
        FROM general_tasks gt 
        LEFT JOIN users u ON gt.created_by = u.id 
        LEFT JOIN projects p_id ON gt.project_id = p_id.id
        LEFT JOIN projects p ON gt.linked_type = 'Project' AND gt.linked_id = p.id
        LEFT JOIN deals d ON gt.linked_type = 'Deal' AND gt.linked_id = d.id
        LEFT JOIN leads l ON gt.linked_type = 'Lead' AND gt.linked_id = l.id
        LEFT JOIN companies c_pid ON p_id.company_id = c_pid.id
        LEFT JOIN companies c_p ON p.company_id = c_p.id
        LEFT JOIN companies c_d ON d.company_id = c_d.id
        WHERE 1=1
      `;
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

      query += ' ORDER BY gt.due_date ASC, gt.due_time ASC, gt.created_at DESC LIMIT ?, ?';
      params.push(parseInt(skip), parseInt(limit));

      const [tasks] = await db.query(query, params);
      res.json(tasks);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch tasks', error);
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const { 
        title, description, status, priority, assigned_to, due_date, due_time, 
        tags, linked_type, linked_id, created_by, task_type, next_followup_date,
        internal_notes, reminder_date, category, sub_type, project_id,
        workflow_type, department_id
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Task title required' });
      }

      const [result] = await db.query(`
        INSERT INTO general_tasks (
          title, description, status, priority, assigned_to, due_date, due_time, 
          tags, linked_type, linked_id, created_by, task_type, next_followup_date,
          internal_notes, reminder_date, category, sub_type, project_id,
          workflow_type, department_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title,
        description || null,
        status || 'Open',
        priority || 'Medium',
        assigned_to ? JSON.stringify(assigned_to) : null,
        due_date || null,
        due_time || null,
        tags ? JSON.stringify(tags) : null,
        linked_type || 'General',
        linked_id || null,
        created_by || null,
        task_type || 'General',
        next_followup_date || null,
        internal_notes || null,
        reminder_date || null,
        category || null,
        sub_type || null,
        project_id || null,
        workflow_type || null,
        department_id || null
      ]);

      const taskId = result.insertId;

      // Create activity log
      if (linked_type && linked_id) {
        let lead_id = linked_type === 'Lead' ? linked_id : null;
        let deal_id = linked_type === 'Deal' ? linked_id : null;
        
        await db.query(`
          INSERT INTO activities (title, description, activity_type, lead_id, deal_id, task_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          `Task Created: ${title}`,
          description || `New task created and linked to ${linked_type}`,
          'Task',
          lead_id,
          deal_id,
          taskId,
          'Completed'
        ]);
      }

      // Handle "Converted to Deal" status for new tasks
      if (status === 'Converted to Deal' && linked_type === 'Lead' && linked_id) {
        try {
          const leadId = linked_id;
          const [leads] = await db.query('SELECT * FROM leads WHERE id = ?', [leadId]);
          
          if (leads.length > 0) {
            const leadData = leads[0];
            
            if (leadData.lead_status !== 'Qualified') {
              let finalCompanyId = leadData.company_id;
              
              if (!finalCompanyId) {
                const [companies] = await db.query('SELECT id FROM companies LIMIT 1');
                if (companies.length > 0) {
                  finalCompanyId = companies[0].id;
                } else {
                  const [companyResult] = await db.query(
                    'INSERT INTO companies (company_name, status) VALUES (?, ?)',
                    [`${leadData.lead_name || 'Unknown'} Company`, 'Active']
                  );
                  finalCompanyId = companyResult.insertId;
                }
              }
              
              let stageId = 'New';
              try {
                const [defaultPipeline] = await db.query(
                  "SELECT id FROM pipelines WHERE status = 'Active' ORDER BY id LIMIT 1"
                );
                if (defaultPipeline.length > 0) {
                  const [defaultStage] = await db.query(
                    "SELECT id FROM pipeline_stages WHERE pipeline_id = ? ORDER BY sequence ASC LIMIT 1",
                    [defaultPipeline[0].id]
                  );
                  if (defaultStage.length > 0) stageId = defaultStage[0].id;
                }
              } catch (e) { /* ignore pipeline table errors */ }

              await db.query(
                `INSERT INTO deals (
                  deal_name, description, deal_value, currency, status,
                  company_id, service_category_id, pipeline, deal_stage, probability, 
                  department_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                  leadData.lead_name || 'New Deal from Task',
                  leadData.notes || 'Converted from new task with converted status',
                  leadData.value || 0,
                  leadData.currency || 'USD',
                  'Open',
                  finalCompanyId,
                  leadData.service_category_id || null,
                  'Converted Lead',
                  stageId,
                  10,
                  leadData.department_id || null
                ]
              );
              
              await db.query(
                "UPDATE leads SET lead_status = 'Qualified', updated_at = NOW() WHERE id = ?",
                [leadId]
              );
              console.log(`✓ New task triggered lead ${leadId} conversion to deal`);
            }
          }
        } catch (convError) {
          console.error('Failed to auto-convert lead to deal from new task:', convError);
        }
      }

      const [task] = await db.query('SELECT * FROM general_tasks WHERE id = ?', [taskId]);
      res.status(201).json(task[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to create task', error);
    }
  });

  app.get('/api/tasks/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      const [tasks] = await db.query('SELECT * FROM general_tasks WHERE id = ?', [taskId]);

      if (tasks.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(tasks[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch task', error);
    }
  });

  app.put('/api/tasks/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      const { title, description, status, priority, assigned_to, due_date, due_time, tags, linked_type, linked_id, created_by, task_type, next_followup_date } = req.body;

      await db.query(`
        UPDATE general_tasks 
        SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?, due_time = ?, tags = ?, linked_type = ?, linked_id = ?, task_type = ?, next_followup_date = ?, updated_at = NOW()
        WHERE id = ?
      `, [
        title || null,
        description || null,
        status || null,
        priority || null,
        assigned_to ? JSON.stringify(assigned_to) : null,
        due_date || null,
        due_time || null,
        tags ? JSON.stringify(tags) : null,
        linked_type || null,
        linked_id || null,
        task_type || null,
        next_followup_date || null,
        taskId
      ]);

      // Create activity log for status change
      if (status) {
        let lead_id = linked_type === 'Lead' ? linked_id : null;
        let deal_id = linked_type === 'Deal' ? linked_id : null;

        await db.query(`
          INSERT INTO activities (title, description, activity_type, lead_id, deal_id, task_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          `Task Updated: ${title}`,
          `Task status updated to ${status}`,
          'Task',
          lead_id,
          deal_id,
          taskId,
          'Completed'
        ]);
      }

      // Handle "Converted to Deal" status
      if (status === 'Converted to Deal' && linked_type === 'Lead' && linked_id) {
        try {
          const leadId = linked_id;
          const [leads] = await db.query('SELECT * FROM leads WHERE id = ?', [leadId]);
          
          if (leads.length > 0) {
            const leadData = leads[0];
            
            // Check if already converted to avoid duplicates
            if (leadData.lead_status !== 'Qualified') {
              let finalCompanyId = leadData.company_id;
              
              if (!finalCompanyId) {
                const [companies] = await db.query('SELECT id FROM companies LIMIT 1');
                if (companies.length > 0) {
                  finalCompanyId = companies[0].id;
                } else {
                  const [companyResult] = await db.query(
                    'INSERT INTO companies (company_name, status) VALUES (?, ?)',
                    [`${leadData.lead_name || 'Unknown'} Company`, 'Active']
                  );
                  finalCompanyId = companyResult.insertId;
                }
              }
              
              let stageId = 'New';
              try {
                const [defaultPipeline] = await db.query(
                  "SELECT id FROM pipelines WHERE status = 'Active' ORDER BY id LIMIT 1"
                );
                if (defaultPipeline.length > 0) {
                  const [defaultStage] = await db.query(
                    "SELECT id FROM pipeline_stages WHERE pipeline_id = ? ORDER BY sequence ASC LIMIT 1",
                    [defaultPipeline[0].id]
                  );
                  if (defaultStage.length > 0) stageId = defaultStage[0].id;
                }
              } catch (e) { /* ignore pipeline table errors */ }

              const [dealResult] = await db.query(
                `INSERT INTO deals (
                  deal_name, description, deal_value, currency, status,
                  company_id, service_category_id, pipeline, deal_stage, probability, 
                  department_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                  leadData.lead_name || 'New Deal from Task',
                  leadData.notes || 'Converted from task status change',
                  leadData.value || 0,
                  leadData.currency || 'USD',
                  'Open',
                  finalCompanyId,
                  leadData.service_category_id || null,
                  'Converted Lead',
                  stageId,
                  10,
                  leadData.department_id || null
                ]
              );
              
              await db.query(
                "UPDATE leads SET lead_status = 'Qualified', updated_at = NOW() WHERE id = ?",
                [leadId]
              );
              
              console.log(`✓ Task status change triggered lead ${leadId} conversion to deal ${dealResult.insertId}`);
            }
          }
        } catch (convError) {
          console.error('Failed to auto-convert lead to deal from task status change:', convError);
        }
      }

      const [task] = await db.query('SELECT * FROM general_tasks WHERE id = ?', [taskId]);
      res.json(task[0]);
    } catch (error) {
      responseError(res, 500, 'Failed to update task', error);
    }
  });

  app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      
      // Perform a cascading delete for related records
      await db.query('DELETE FROM activities WHERE task_id = ?', [taskId]);
      await db.query('DELETE FROM entity_notes WHERE task_id = ?', [taskId]);
      await db.query('DELETE FROM files WHERE task_id = ?', [taskId]);
      
      // Finally delete the task itself
      const [result] = await db.query('DELETE FROM general_tasks WHERE id = ?', [taskId]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json({ message: 'Task and all related records deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete task and related records', error);
    }
  });

  app.post('/api/deals/:dealId/convert-to-project', async (req, res) => {
    try {
      const { dealId } = req.params;
      const { name, budget, start_date, end_date, workflow_type, department_id } = req.body;

      const [deal] = await db.query('SELECT * FROM deals WHERE id = ?', [dealId]);
      if (deal.length === 0) return res.status(404).json({ error: 'Deal not found' });

      const [projectResult] = await db.query(`
        INSERT INTO projects (name, deal_id, company_id, budget, status, start_date, end_date, workflow_type, department_id, created_at)
        VALUES (?, ?, ?, ?, 'Planning', ?, ?, ?, ?, NOW())
      `, [name || deal[0].deal_name, dealId, deal[0].company_id, budget || deal[0].deal_value, start_date || null, end_date || null, workflow_type || 'Standard', department_id || null]);

      const projectId = projectResult.insertId;

      // Create department-specific project entry if needed
      if (workflow_type === 'Marketing') {
        await db.query('INSERT INTO marketing_projects (project_id, status) VALUES (?, "Planning")', [projectId]);
      } else if (workflow_type === 'IT') {
        await db.query('INSERT INTO it_projects (project_id, status) VALUES (?, "Backlog")', [projectId]);
      }

      await db.query('UPDATE deals SET status = "Project Created" WHERE id = ?', [dealId]);

      res.status(201).json({ success: true, projectId });
    } catch (error) {
      responseError(res, 500, 'Failed to convert deal to project', error);
    }
  });

};
