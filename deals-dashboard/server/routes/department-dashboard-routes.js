const { checkPermission } = require('../middleware/helpers');

module.exports = function setupDepartmentDashboardRoutes(app, pool) {

  // 1. Admin Dashboard API
  app.get('/api/dashboard/admin', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      
      // Get system stats
      const [userStats] = await connection.query('SELECT COUNT(*) as totalUsers, SUM(CASE WHEN status = "Active" THEN 1 ELSE 0 END) as activeUsers FROM users');
      const [deptStats] = await connection.query('SELECT COUNT(*) as totalDepts FROM departments');
      const [leadStats] = await connection.query('SELECT COUNT(*) as totalLeads FROM leads');
      const [dealStats] = await connection.query('SELECT COUNT(*) as totalDeals, SUM(deal_value) as totalValue FROM deals');
      const [projectStats] = await connection.query('SELECT COUNT(*) as totalProjects FROM projects');
      const [pendingApprovals] = await connection.query('SELECT COUNT(*) as count FROM approvals WHERE status = "Pending"');
      
      // Get recent system activities (placeholders for now)
      const [recentActivities] = await connection.query('SELECT * FROM activities ORDER BY created_at DESC LIMIT 10');
      
      // Get health metrics
      const [serverStatus] = await connection.query('SELECT "Healthy" as status, "100%" as uptime, "45ms" as latency');

      connection.release();
      res.json({
        stats: {
          users: userStats[0],
          departments: deptStats[0].totalDepts,
          leads: leadStats[0].totalLeads,
          deals: dealStats[0],
          projects: projectStats[0].totalProjects,
          pendingApprovals: pendingApprovals[0].count
        },
        recentActivities,
        systemHealth: serverStatus[0]
      });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Leads Dashboard API
  app.get('/api/dashboard/leads', async (req, res) => {
    let connection;
    try {
      const { userId, viewType = 'executive' } = req.query;
      connection = await pool.getConnection();
      
      let whereClause = '';
      let params = [];
      
      if (viewType === 'executive' && userId) {
        whereClause = ' WHERE created_by = ? OR assigned_to = ?'; // Placeholder logic
        params = [userId, userId];
      }

      // Lead Pipeline Stats
      const [pipelineStats] = await connection.query(`
        SELECT lead_status, COUNT(*) as count 
        FROM leads 
        ${whereClause} 
        GROUP BY lead_status
      `, params);

      // Lead Sources
      const [sourceStats] = await connection.query(`
        SELECT lead_source, COUNT(*) as count 
        FROM leads 
        ${whereClause} 
        GROUP BY lead_source
      `, params);

      // Recent Leads
      const [recentLeads] = await connection.query(`
        SELECT * FROM leads 
        ${whereClause} 
        ORDER BY created_at DESC LIMIT 10
      `, params);

      // Manager View: Conversion Analytics & Distribution
      let managerData = {};
      if (viewType === 'manager') {
        const [conversion] = await connection.query('SELECT COUNT(*) as total, SUM(CASE WHEN lead_status = "Qualified" THEN 1 ELSE 0 END) as qualified FROM leads');
        const [distribution] = await connection.query(`
          SELECT u.first_name, u.last_name, COUNT(l.id) as leadCount 
          FROM users u 
          LEFT JOIN leads l ON l.assigned_to = u.id 
          GROUP BY u.id, u.first_name, u.last_name
        `);
        managerData = { conversion, distribution };
      }

      connection.release();
      res.json({
        pipeline: pipelineStats,
        sources: sourceStats,
        recentLeads,
        ...managerData
      });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Deals Dashboard API
  app.get('/api/dashboard/deals', async (req, res) => {
    let connection;
    try {
      const { userId, viewType = 'executive' } = req.query;
      connection = await pool.getConnection();
      
      let whereClause = '';
      let params = [];
      
      if (viewType === 'executive' && userId) {
        whereClause = ' WHERE assignee_id = ?';
        params = [userId];
      }

      // Deal Stages
      const [stageStats] = await connection.query(`
        SELECT deal_stage, COUNT(*) as count, SUM(deal_value) as totalValue 
        FROM deals 
        ${whereClause} 
        GROUP BY deal_stage
      `, params);

      // Revenue Forecast (Simple)
      const [forecast] = await connection.query(`
        SELECT SUM(deal_value * probability / 100) as weightedValue 
        FROM deals 
        ${whereClause}
      `, params);

      // Recent Deals
      const [recentDeals] = await connection.query(`
        SELECT d.*, c.company_name 
        FROM deals d 
        LEFT JOIN companies c ON d.company_id = c.id 
        ${whereClause ? 'WHERE d.assignee_id = ?' : ''} 
        ORDER BY d.created_at DESC LIMIT 10
      `, params);

      // Manager View: Discount Approvals & Allocation
      let managerData = {};
      if (viewType === 'manager') {
        const [pendingDiscounts] = await connection.query('SELECT COUNT(*) as count FROM deals WHERE discount_status = "Pending"');
        const [allocation] = await connection.query(`
          SELECT u.first_name, u.last_name, SUM(d.deal_value) as totalValue 
          FROM users u 
          LEFT JOIN deals d ON d.assignee_id = u.id 
          GROUP BY u.id, u.first_name, u.last_name
        `);
        managerData = { pendingDiscounts: pendingDiscounts[0].count, allocation };
      }

      connection.release();
      res.json({
        stages: stageStats,
        forecast: forecast[0].weightedValue,
        recentDeals,
        ...managerData
      });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Sales Dashboard API
  app.get('/api/dashboard/sales', async (req, res) => {
    let connection;
    try {
      const { userId, viewType = 'executive' } = req.query;
      connection = await pool.getConnection();
      
      // Personal Metrics (Executive)
      const [personalStats] = await connection.query(`
        SELECT 
          COUNT(CASE WHEN deal_stage = 'Won' THEN 1 END) as wonDeals,
          SUM(CASE WHEN deal_stage = 'Won' THEN deal_value ELSE 0 END) as totalRevenue,
          COUNT(CASE WHEN deal_stage != 'Won' AND deal_stage != 'Lost' THEN 1 END) as activeDeals
        FROM deals 
        WHERE assignee_id = ?
      `, [userId]);

      const [commissions] = await connection.query('SELECT SUM(amount) as total FROM commissions WHERE user_id = ? AND status = "Paid"', [userId]);
      const [targets] = await connection.query('SELECT metric_value as target FROM kpi_metrics WHERE metric_name = "Sales Target" AND period_start <= NOW() AND period_end >= NOW()');

      // Pipeline Data for Charts
      const [pipelineData] = await connection.query(`
        SELECT deal_stage as name, COUNT(*) as count, SUM(deal_value) as value
        FROM deals
        ${userId ? 'WHERE assignee_id = ?' : ''}
        GROUP BY deal_stage
      `, userId ? [userId] : []);

      // Task/Activity stats for the dashboard
      const [taskStats] = await connection.query(`
        SELECT 
          COUNT(CASE WHEN status = 'Open' OR status = 'Pending' THEN 1 END) as pendingTasks,
          COUNT(CASE WHEN activity_type = 'Calls' AND status = 'Completed' THEN 1 END) as callsMade,
          COUNT(CASE WHEN activity_type = 'Meeting' AND status = 'Pending' THEN 1 END) as meetingsScheduled
        FROM activities
        WHERE assigned_to = ? AND (scheduled_date >= CURDATE() OR created_at >= CURDATE())
      `, [userId]);

      // Manager View: Team Performance
      let managerData = {};
      if (viewType === 'manager') {
        const [teamStats] = await connection.query(`
          SELECT u.first_name, u.last_name, 
                 COUNT(d.id) as dealsCount, 
                 SUM(CASE WHEN d.deal_stage = 'Won' THEN d.deal_value ELSE 0 END) as revenue 
          FROM users u 
          LEFT JOIN deals d ON d.assignee_id = u.id 
          WHERE u.department = 'Sales Department' 
          GROUP BY u.id
        `);
        managerData = { teamPerformance: teamStats };
      }

      connection.release();
      res.json({
        personal: personalStats[0],
        commissions: commissions[0].total || 0,
        target: targets[0]?.target || 0,
        pipeline: pipelineData,
        tasks: taskStats[0],
        ...managerData
      });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Marketing Dashboard API
  app.get('/api/dashboard/marketing', async (req, res) => {
    let connection;
    try {
      const { userId, viewType = 'executive' } = req.query;
      connection = await pool.getConnection();
      
      // Projects & Campaigns
      const [projectStats] = await connection.query('SELECT status, COUNT(*) as count FROM marketing_projects GROUP BY status');
      const [activeCampaigns] = await connection.query('SELECT COUNT(*) as count FROM campaigns WHERE is_active = 1');
      
      // Content Calendar (Recent/Upcoming)
      const [calendar] = await connection.query('SELECT * FROM content_calendar WHERE scheduled_date >= NOW() ORDER BY scheduled_date ASC LIMIT 5');
      
      // SEO Insights
      const [seoStats] = await connection.query('SELECT COUNT(*) as keywords, AVG(current_ranking) as avgRanking FROM seo_management');

      // Manager View: Creative Approvals & Resource Allocation
      let managerData = {};
      if (viewType === 'manager') {
        const [pendingRequests] = await connection.query('SELECT COUNT(*) as count FROM creative_requests WHERE status = "Requested"');
        const [campaignPerformance] = await connection.query('SELECT metric_name, AVG(metric_value) as avgValue FROM campaign_performance GROUP BY metric_name');
        managerData = { pendingApprovals: pendingRequests[0].count, campaignPerformance };
      }

      connection.release();
      res.json({
        projects: projectStats,
        activeCampaigns: activeCampaigns[0].count,
        upcomingContent: calendar,
        seo: seoStats[0],
        ...managerData
      });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // 6. IT Dashboard API
  app.get('/api/dashboard/it', async (req, res) => {
    let connection;
    try {
      const { userId, viewType = 'executive' } = req.query;
      connection = await pool.getConnection();
      
      // Project & Sprint Stats
      const [itProjects] = await connection.query('SELECT status, COUNT(*) as count FROM it_projects GROUP BY status');
      const [activeSprints] = await connection.query('SELECT * FROM sprints WHERE status = "Active"');
      
      // Bug Tracking
      const [bugStats] = await connection.query('SELECT status, COUNT(*) as count FROM bugs GROUP BY status');
      const [criticalBugs] = await connection.query('SELECT COUNT(*) as count FROM bugs WHERE severity = "Critical" AND status != "Resolved"');
      
      // Deployments
      const [recentDeployments] = await connection.query('SELECT * FROM deployments ORDER BY created_at DESC LIMIT 5');

      // Manager View: Sprint Planning & Deployment Approvals
      let managerData = {};
      if (viewType === 'manager') {
        const [pendingDeployments] = await connection.query('SELECT COUNT(*) as count FROM deployments WHERE status = "Pending"');
        const [resourceUsage] = await connection.query('SELECT "85%" as cpu, "62%" as memory, "1.2TB" as storage'); // Mock DevOps
        managerData = { pendingDeployments: pendingDeployments[0].count, devOps: resourceUsage[0] };
      }

      connection.release();
      res.json({
        projects: itProjects,
        activeSprints,
        bugs: { stats: bugStats, critical: criticalBugs[0].count },
        deployments: recentDeployments,
        ...managerData
      });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Accounting Dashboard API
  app.get('/api/dashboard/accounting', async (req, res) => {
    let connection;
    try {
      const { userId, viewType = 'executive' } = req.query;
      connection = await pool.getConnection();
      
      // Invoices & Payments
      const [invoiceStats] = await connection.query('SELECT status, COUNT(*) as count, SUM(amount) as total FROM invoices GROUP BY status');
      const [pendingPayments] = await connection.query('SELECT SUM(amount) as total FROM invoices WHERE status = "Unpaid" OR status = "Partially Paid"');
      const [overdueInvoices] = await connection.query('SELECT COUNT(*) as count, SUM(amount) as total FROM invoices WHERE status = "Overdue"');
      
      // Commissions
      const [pendingCommissions] = await connection.query('SELECT SUM(amount) as total FROM commissions WHERE status = "Pending"');

      // Manager View: Financial Forecast & Audit Logs
      let managerData = {};
      if (viewType === 'manager') {
        const [profitAndLoss] = await connection.query('SELECT 150000 as revenue, 45000 as expenses, 105000 as profit'); // Mock Financials
        const [recentAudit] = await connection.query('SELECT * FROM activities WHERE activity_type = "Invoice" ORDER BY created_at DESC LIMIT 5');
        managerData = { financials: profitAndLoss[0], audit: recentAudit };
      }

      connection.release();
      res.json({
        invoices: invoiceStats,
        receivables: pendingPayments[0].total || 0,
        overdue: overdueInvoices[0],
        commissionsPending: pendingCommissions[0].total || 0,
        ...managerData
      });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });
};
