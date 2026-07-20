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

  app.get('/api/dashboard/marketing/full', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();

      const [leads] = await connection.query('SELECT lead_status, lead_source, created_at, value, industry FROM leads');

      const funnel = { 'New': 0, 'Contacted': 0, 'Qualified': 0, 'Proposal Sent': 0, 'Won': 0 };
      const sourceMap = {};
      let totalValue = 0;

      leads.forEach(l => {
        let s = l.lead_status || 'New';
        if (s === 'Contacted' || s === 'Follow-up') funnel['Contacted']++;
        else if (s === 'Qualified' || s === 'Negotiation') funnel['Qualified']++;
        else if (s === 'Proposal Sent') funnel['Proposal Sent']++;
        else if (s === 'Won' || s === 'Closed Won') funnel['Won']++;
        else funnel['New']++;

        let src = l.lead_source || 'Others';
        sourceMap[src] = (sourceMap[src] || 0) + 1;
        totalValue += (parseFloat(l.value) || 0);
      });

      const FUNNEL_DATA = Object.entries(funnel).map(([label, value]) => {
        let width = 100;
        if (label === 'Contacted') width = 80;
        if (label === 'Qualified') width = 60;
        if (label === 'Proposal Sent') width = 44;
        if (label === 'Won') width = 30;
        const colors = {'New': '#4F46E5', 'Contacted': '#818CF8', 'Qualified': '#F59E0B', 'Proposal Sent': '#10B981', 'Won': '#22C55E'};
        return { label, value, color: colors[label], width };
      });

      const sourceColors = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#6B7280'];
      const LEADS_BY_SOURCE = Object.entries(sourceMap).map(([name, value], i) => ({
        name,
        value,
        pct: Math.round((value / leads.length) * 100) || 0,
        color: sourceColors[i % sourceColors.length]
      })).sort((a,b) => b.value - a.value);

      const CHANNEL_PERF = Object.entries(sourceMap).map(([name, count], i) => {
        let revenue = count * 2500; 
        return {
          channel: name,
          revenue,
          pct: Math.round((revenue / (leads.length * 2500)) * 100) || 0,
          color: sourceColors[i % sourceColors.length]
        };
      }).sort((a,b) => b.revenue - a.revenue);

      const [campaigns] = await connection.query(`
        SELECT c.name as title, c.status as type, c.budget,
               (SELECT SUM(metric_value) FROM campaign_performance cp WHERE cp.campaign_id = c.id AND metric_name = 'Leads Generated') as leads_count,
               (SELECT AVG(metric_value) FROM campaign_performance cp WHERE cp.campaign_id = c.id AND metric_name = 'Conversion Rate') as conversion_rate
        FROM campaigns c LIMIT 5
      `);
      const TOP_CAMPAIGNS = campaigns.map((c, i) => ({
        name: c.title,
        type: c.type === 'Active' ? 'Email Campaign' : 'Social Campaign',
        leads: Number(c.leads_count) || 0,
        convRate: Number(c.conversion_rate).toFixed(1) || '0.0',
        color: sourceColors[i % sourceColors.length],
        iconName: c.type === 'Active' ? 'Mail' : 'Share2'
      }));

      const [recentLeads] = await connection.query('SELECT lead_name, industry, company, lead_status, created_at FROM leads ORDER BY created_at DESC LIMIT 5');
      const RECENT_LEADS = recentLeads.map(l => ({
        name: l.lead_name,
        role: `${l.industry || 'Lead'}, ${l.company || 'Unknown'}`,
        badge: l.lead_status || 'New',
        badgeColor: l.lead_status === 'Won' ? '#10B981' : '#4F46E5',
        time: 'Recently',
        avatar: l.lead_name ? l.lead_name.substring(0, 2).toUpperCase() : 'LD',
        avatarBg: '#EDE9FE'
      }));

      const [tasks] = await connection.query('SELECT title, priority FROM general_tasks WHERE status != "Completed" LIMIT 4');
      const TASKS_DATA = tasks.map(t => ({
        label: t.title,
        priority: t.priority || 'Medium',
        priorityColor: t.priority === 'High' ? '#EF4444' : (t.priority === 'Low' ? '#10B981' : '#F59E0B')
      }));

      // Real Lead Growth Data (Last 7 Days)
      const [leadGrowthRaw] = await connection.query(`
        SELECT DATE_FORMAT(DATE(created_at), '%d %b') as date, 
               COUNT(*) as total, 
               SUM(CASE WHEN lead_status IN ('Qualified', 'Negotiation') THEN 1 ELSE 0 END) as qualified,
               SUM(CASE WHEN lead_status IN ('Won', 'Closed Won') THEN 1 ELSE 0 END) as converted
        FROM leads 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `);
      const LEAD_GROWTH_DATA = leadGrowthRaw.map(r => ({
        date: r.date,
        total: Number(r.total) || 0,
        qualified: Number(r.qualified) || 0,
        converted: Number(r.converted) || 0
      }));

      // Real Performance Trend (Last 6 Months)
      const [perfTrendRaw] = await connection.query(`
        SELECT DATE_FORMAT(MAX(created_at), '%b %Y') as month, 
               COUNT(*) as leads, 
               SUM(CASE WHEN lead_status IN ('Won', 'Closed Won') THEN 1 ELSE 0 END) as conversions,
               SUM(value) as revenue
        FROM leads 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY YEAR(created_at), MONTH(created_at)
        ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
      `);
      const PERFORMANCE_TREND = perfTrendRaw.map(r => ({
        month: r.month,
        leads: Number(r.leads) || 0,
        conversions: Number(r.conversions) || 0,
        revenue: Number(r.revenue) || 0
      }));

      // Real Engagement Data
      const [engagementRaw] = await connection.query('SELECT metric_name, SUM(metric_value) as total FROM campaign_performance GROUP BY metric_name');
      const engagementMap = {};
      engagementRaw.forEach(e => { engagementMap[e.metric_name] = Number(e.total); });
      const ENGAGEMENT = [
        { label: 'Email Opens',        value: engagementMap['Email Opens'] || 0, change: 0, color: '#4F46E5', iconName: 'Mail' },
        { label: 'Email Clicks',       value: engagementMap['Email Clicks'] || 0, change: 0, color: '#10B981', iconName: 'MousePointer' },
        { label: 'Landing Page Views', value: engagementMap['Landing Page Views'] || 0, change: 0, color: '#F59E0B', iconName: 'Eye' },
        { label: 'Form Submissions',   value: engagementMap['Form Submissions'] || 0,  change: 0, color: '#8B5CF6', iconName: 'FileText' },
        { label: 'Content Downloads',  value: engagementMap['Content Downloads'] || 0,  change: 0, color: '#EF4444', iconName: 'Download' },
      ];

      // Real Activities Data
      const [activitiesRaw] = await connection.query('SELECT title, scheduled_date, scheduled_time, activity_type FROM activities ORDER BY created_at DESC LIMIT 4');
      const ACTIVITIES_DATA = activitiesRaw.map(a => {
        let iconName = 'Users';
        let bg = '#EDE9FE';
        let color = '#4F46E5';
        if (a.activity_type === 'Email') { iconName = 'Send'; bg = '#D1FAE5'; color = '#10B981'; }
        else if (a.activity_type === 'Call') { iconName = 'Phone'; bg = '#FEF3C7'; color = '#F59E0B'; }
        
        let sub = '';
        if (a.scheduled_date) {
           sub = new Date(a.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
           if (a.scheduled_time) sub += `, ${a.scheduled_time}`;
        } else {
           sub = 'No date set';
        }

        return {
          title: a.title || 'Untitled Activity',
          sub,
          color,
          bg,
          iconName
        };
      });

      connection.release();
      res.json({
        LEAD_GROWTH_DATA,
        LEADS_BY_SOURCE,
        PERFORMANCE_TREND,
        TOP_CAMPAIGNS,
        RECENT_LEADS,
        FUNNEL_DATA,
        ENGAGEMENT,
        ACTIVITIES_DATA,
        TASKS_DATA,
        CHANNEL_PERF
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
  // 8. SEO GMB Full Dashboard API
  app.get('/api/dashboard/seo-gmb/full', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();

      const [keywordsRaw] = await connection.query('SELECT COUNT(*) as total FROM seo_management');
      const [top3Raw] = await connection.query('SELECT COUNT(*) as total FROM seo_management WHERE current_ranking <= 3');
      
      const organicTraffic = 12842;
      const gmbViews = 9438;
      const gmbActions = 1276;
      
      const [gmbRaw] = await connection.query('SELECT AVG(average_rating) as avgRating, SUM(total_reviews) as totalReviews FROM gmb_management');
      
      // SEO Performance Line Chart (mock)
      const seoPerformance = [
        { name: 'May 24', clicks: 8000, impressions: 12000, position: 20 },
        { name: 'May 25', clicks: 7500, impressions: 11000, position: 22 },
        { name: 'May 26', clicks: 8200, impressions: 13000, position: 18 },
        { name: 'May 27', clicks: 6000, impressions: 9000,  position: 30 },
        { name: 'May 28', clicks: 9000, impressions: 14000, position: 15 },
        { name: 'May 29', clicks: 8500, impressions: 13500, position: 16 },
        { name: 'May 30', clicks: 9500, impressions: 15000, position: 12 }
      ];

      const gmbPerformance = { search: 5302, maps: 2481, direct: 1108, website: 547 };
      const topGmbActions = [];
      
      const [topKeywordsQuery] = await connection.query('SELECT keyword, current_ranking as position, search_volume as volume FROM seo_management ORDER BY current_ranking ASC LIMIT 8');
      
      // Injecting dynamic mock CPC, Traffic, KD and change values
      const topKeywords = topKeywordsQuery.map((k, i) => ({
        keyword: k.keyword,
        position: k.position,
        change: i % 2 === 0 ? `+${(i+1)}` : `-${(i)}`,
        volume: k.volume,
        cpc: (Math.random() * 3 + 1).toFixed(2),
        traffic: Math.floor(Math.random() * 500 + 200),
        kd: Math.floor(Math.random() * 40 + 20)
      }));

      // New Widgets Data
      const rankingDistribution = [
        { name: '#1 - 3', value: 278, color: '#10B981', pct: '22.1%' },
        { name: '#4 - 10', value: 354, color: '#3B82F6', pct: '28.2%' },
        { name: '#11 - 20', value: 286, color: '#8B5CF6', pct: '22.8%' },
        { name: '#21 - 50', value: 212, color: '#F59E0B', pct: '16.9%' },
        { name: '#51 - 100', value: 84, color: '#EF4444', pct: '6.7%' },
        { name: 'Not Ranked', value: 42, color: '#6B7280', pct: '3.3%' }
      ];

      const topPages = [
        { page: '/crm-software-development', clicks: 1256, impressions: 12842, position: 1.2, change: '+3' },
        { page: '/best-crm-for-small-business', clicks: 985, impressions: 9432, position: 2.1, change: '+2' },
        { page: '/crm-pricing', clicks: 742, impressions: 6842, position: 3.5, change: '+4' },
        { page: '/features', clicks: 685, impressions: 6123, position: 4.2, change: '+1' },
        { page: '/blog/crm-benefits', clicks: 532, impressions: 4321, position: 5.6, change: '+3' }
      ];

      const seoHealthDetails = {
        score: 86,
        categories: [
          { name: 'On-Page SEO', value: '92/100', color: '#10B981' },
          { name: 'Technical SEO', value: '84/100', color: '#3B82F6' },
          { name: 'Content Quality', value: '88/100', color: '#F59E0B' },
          { name: 'Backlinks', value: '75/100', color: '#8B5CF6' },
          { name: 'User Experience', value: '90/100', color: '#10B981' }
        ]
      };

      const coreWebVitals = [
        { name: 'Largest Contentful Paint (LCP)', value: '2.1 s', status: 'Good' },
        { name: 'First Input Delay (FID)', value: '28 ms', status: 'Good' },
        { name: 'Cumulative Layout Shift (CLS)', value: '0.06', status: 'Good' }
      ];

      const keywordsByIntent = [
        { intent: 'Informational', value: 1600, color: '#3B82F6' },
        { intent: 'Navigational', value: 880, color: '#10B981' },
        { intent: 'Commercial', value: 720, color: '#F59E0B' },
        { intent: 'Transactional', value: 590, color: '#8B5CF6' },
        { intent: 'Other', value: 480, color: '#EF4444' }
      ];

      const topCountries = [
        { country: 'India', traffic: 6842, pct: '16.3%', flag: '🇮🇳' },
        { country: 'United States', traffic: 2145, pct: '11.2%', flag: '🇺🇸' },
        { country: 'United Kingdom', traffic: 842, pct: '8.6%', flag: '🇬🇧' },
        { country: 'Canada', traffic: 624, pct: '7.4%', flag: '🇨🇦' },
        { country: 'Australia', traffic: 532, pct: '6.1%', flag: '🇦🇺' }
      ];

      const devicesByClicks = [
        { name: 'Desktop', value: 5246, pct: '58.8%', color: '#3B82F6' },
        { name: 'Mobile', value: 3214, pct: '36.0%', color: '#10B981' },
        { name: 'Tablet', value: 463, pct: '5.2%', color: '#F59E0B' }
      ];

      const aiVisibility = { score: 78, overviews: '85/100', citations: '74/100', brandMentions: '72/100', promptRankings: '78/100', sentiment: '80/100' };
      const promptRankings = [
        { prompt: 'best crm software for business', position: 2, change: '+1' },
        { prompt: 'crm software for small business', position: 3, change: '-' },
        { prompt: 'top crm development company', position: 1, change: '-' },
        { prompt: 'what is the best crm in 2026', position: 4, change: '+2' },
        { prompt: 'crm vs erp which is better', position: 5, change: '+1' }
      ];
      
      const reviews = { rating: gmbRaw[0].avgRating || 4.8, total: gmbRaw[0].totalReviews || 125, positive: 109, neutral: 16, negative: 0 };
      const posts = { total: 12, views: 1942, engagements: 342 };
      const localPack = { keywords: 24, avgPosition: 2.6, locations: 18 };
      const techSeo = { score: 92, crawled: 1256, issues: 24, critical: 3, warnings: 21 };
      const gmbPerformanceTime = [
        { name: 'May 24', views: 1000, search: 600, maps: 400, clicks: 100 },
        { name: 'May 25', views: 1200, search: 700, maps: 450, clicks: 150 },
        { name: 'May 26', views: 1100, search: 650, maps: 380, clicks: 120 },
        { name: 'May 27', views: 900, search: 500, maps: 300, clicks: 90 },
        { name: 'May 28', views: 1300, search: 800, maps: 500, clicks: 180 },
        { name: 'May 29', views: 1400, search: 850, maps: 550, clicks: 200 },
        { name: 'May 30', views: 1500, search: 900, maps: 600, clicks: 220 }
      ];

      const gmbCustomerSearch = [
        { name: 'Direct', value: 3104, pct: '54.1%', color: '#3B82F6', desc: 'People who find your listing by searching your business name or address' },
        { name: 'Discovery', value: 2291, pct: '39.8%', color: '#10B981', desc: 'People who find your listing by searching a category, product or service' },
        { name: 'Branded', value: 347, pct: '6.1%', color: '#F59E0B', desc: 'People who find your listing by searching a brand related to your business' }
      ];

      const gmbCustomerActions = [
        { name: 'Website Clicks', value: 532, change: '+14.3%' },
        { name: 'Direction Requests', value: 294, change: '+18.6%' },
        { name: 'Call Clicks', value: 196, change: '+12.8%' },
        { name: 'Message Clicks', value: 142, change: '+9.7%' },
        { name: 'Booking Clicks', value: 122, change: '+22.1%' }
      ];

      const gmbRecentReviews = {
        rating: 4.8,
        total: 125,
        breakdown: [
          { stars: 5, value: 98, pct: '78.4%', color: '#10B981' },
          { stars: 4, value: 20, pct: '16.0%', color: '#10B981' },
          { stars: 3, value: 5, pct: '4.0%', color: '#F59E0B' },
          { stars: 2, value: 1, pct: '0.8%', color: '#F59E0B' },
          { stars: 1, value: 1, pct: '0.8%', color: '#EF4444' }
        ]
      };

      const gmbReviewsOverTime = [
        { name: 'May 24', reviews: 5 },
        { name: 'May 25', reviews: 12 },
        { name: 'May 26', reviews: 8 },
        { name: 'May 27', reviews: 15 },
        { name: 'May 28', reviews: 10 },
        { name: 'May 30', reviews: 18 }
      ];

      const gmbTopReviewKeywords = [
        { keyword: 'good service', mentions: 28, trend: '+ 12', color: 'text-green-500' },
        { keyword: 'professional', mentions: 21, trend: '+ 8', color: 'text-green-500' },
        { keyword: 'support', mentions: 18, trend: '+ 6', color: 'text-green-500' },
        { keyword: 'best company', mentions: 15, trend: '+ 5', color: 'text-green-500' },
        { keyword: 'quality', mentions: 12, trend: '+ 3', color: 'text-green-500' }
      ];

      const gmbQaOverview = { questions: 24, qChange: '+ 14.3%', answered: 22, aChange: '+ 12.5%', pending: 2, pChange: '+ 33.3%' };

      const gmbProfileCompletion = {
        score: 92,
        tasks: [
          { name: 'Business Information', completed: true },
          { name: 'Photos', completed: true },
          { name: 'Services', completed: true },
          { name: 'Reviews', completed: true },
          { name: 'Posts', completed: true },
          { name: 'Attributes', completed: true },
          { name: 'Q&A', completed: false }
        ]
      };

      const gmbPhotoViews = [
        { img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80', views: 1248 },
        { img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=400&q=80', views: 932 },
        { img: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=400&q=80', views: 615 },
        { img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80', views: 432 },
        { img: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=400&q=80', views: 318 }
      ];

      const gmbPostsPerformance = [
        { img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80', title: 'We are now ISO 9001:2015 Certified!', date: 'May 28, 2026', views: 842, clicks: 42 },
        { img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=200&q=80', title: 'New Blog: Top 10 CRM Benefits', date: 'May 26, 2026', views: 615, clicks: 31 },
        { img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=80', title: 'Weekend Offer - 20% OFF on CRM', date: 'May 24, 2026', views: 512, clicks: 28 }
      ];

      // GEO / AI MOCK DATA
      const geoVisibilityTrend = [
        { name: 'May 17', chatgpt: 50, googleai: 36, gemini: 24, perplexity: 15, claude: 10 },
        { name: 'May 19', chatgpt: 55, googleai: 42, gemini: 28, perplexity: 17, claude: 12 },
        { name: 'May 21', chatgpt: 52, googleai: 48, gemini: 32, perplexity: 20, claude: 14 },
        { name: 'May 23', chatgpt: 60, googleai: 45, gemini: 30, perplexity: 18, claude: 13 },
        { name: 'May 25', chatgpt: 65, googleai: 50, gemini: 35, perplexity: 22, claude: 16 },
        { name: 'May 27', chatgpt: 62, googleai: 48, gemini: 38, perplexity: 25, claude: 18 },
        { name: 'May 29', chatgpt: 70, googleai: 55, gemini: 40, perplexity: 28, claude: 20 },
        { name: 'May 30', chatgpt: 78, googleai: 58, gemini: 42, perplexity: 30, claude: 22 }
      ];

      const geoShareOfVisibility = [
        { name: 'ChatGPT', value: 598, pct: '32.4%', color: '#3B82F6' },
        { name: 'Google AI Overview', value: 494, pct: '26.8%', color: '#0EA5E9' },
        { name: 'Gemini', value: 335, pct: '18.2%', color: '#F59E0B' },
        { name: 'Perplexity', value: 232, pct: '12.6%', color: '#8B5CF6' },
        { name: 'Claude', value: 125, pct: '6.8%', color: '#EF4444' },
        { name: 'Others', value: 58, pct: '3.2%', color: '#6B7280' }
      ];

      const geoOverviewPresence = [
        { query: 'CRM software for small business', value: 92, change: '+ 6%' },
        { query: 'ERP software development', value: 88, change: '+ 5%' },
        { query: 'Best CRM for manufacturing', value: 76, change: '+ 9%' },
        { query: 'Custom software development', value: 72, change: '+ 7%' },
        { query: 'CRM development company', value: 68, change: '+ 6%' },
        { query: 'Hospital ERP software', value: 64, change: '+ 4%' }
      ];

      const geoTopPrompts = [
        { prompt: 'best crm software for business', engine: 'ChatGPT', engineIcon: 'MessageCircle', position: 2, visibility: 'High', trend: '+ 1' },
        { prompt: 'crm platform for manufacturing', engine: 'Google AI', engineIcon: 'Search', position: 3, visibility: 'High', trend: '+ 2' },
        { prompt: 'custom erp development company', engine: 'Perplexity', engineIcon: 'Target', position: 1, visibility: 'Very High', trend: '+ 1' },
        { prompt: 'hospital management system india', engine: 'Gemini', engineIcon: 'Zap', position: 4, visibility: 'Medium', trend: '- 3' },
        { prompt: 'crm vs erp which is better', engine: 'Claude', engineIcon: 'Cpu', position: 5, visibility: 'Medium', trend: '+ 1' },
        { prompt: 'crm software for startups', engine: 'Bing Copilot', engineIcon: 'Globe', position: 3, visibility: 'High', trend: '+ 2' }
      ];

      const geoMentionsCitations = [
        { name: 'May 24', mentions: 80, citations: 120 },
        { name: 'May 25', mentions: 110, citations: 150 },
        { name: 'May 26', mentions: 90, citations: 130 },
        { name: 'May 27', mentions: 130, citations: 160 },
        { name: 'May 28', mentions: 100, citations: 140 },
        { name: 'May 29', mentions: 186, citations: 210 },
        { name: 'May 30', mentions: 140, citations: 170 }
      ];

      const geoCompetitorCompare = [
        { company: 'Codigix Infotech', isUs: true, visibility: '78/100', mentions: 1842, citations: 642, trend: '+ 12%' },
        { company: 'Competitor A', isUs: false, visibility: '72/100', mentions: 1520, citations: 580, trend: '+ 8%' },
        { company: 'Competitor B', isUs: false, visibility: '65/100', mentions: 1210, citations: 492, trend: '+ 6%' },
        { company: 'Competitor C', isUs: false, visibility: '58/100', mentions: 960, citations: 410, trend: '+ 4%' },
        { company: 'Competitor D', isUs: false, visibility: '52/100', mentions: 842, citations: 328, trend: '+ 3%' }
      ];

      const geoContentOpportunities = [
        { idea: 'Create content for "AI powered CRM for manufacturing"', score: 92, vsearch: 'High' },
        { idea: 'Publish comparison: Best ERP vs CRM for MSME', score: 88, vsearch: 'High' },
        { idea: 'Build FAQ for "Hospital ERP benefits"', score: 84, vsearch: 'Medium' },
        { idea: 'Write guide: Custom software development cost', score: 82, vsearch: 'Medium' },
        { idea: 'Add case study: Manufacturing ERP implementation', score: 79, vsearch: 'Medium' }
      ];

      const geoHealthScoreDetails = {
        score: 86,
        categories: [
          { name: 'AI Overview Presence', status: 'Good', color: 'text-green-500' },
          { name: 'Brand Mentions', status: 'Excellent', color: 'text-green-500' },
          { name: 'Citation Quality', status: 'Good', color: 'text-green-500' },
          { name: 'Prompt Rankings', status: 'Good', color: 'text-green-500' },
          { name: 'Competitor Strength', status: 'Stable', color: 'text-yellow-500' }
        ]
      };

      // COMPETITORS MOCK DATA
      const compVisibilityComparison = [
        { name: 'May 17', us: 68, comp1: 65, comp2: 45, comp3: 15 },
        { name: 'May 19', us: 70, comp1: 68, comp2: 47, comp3: 17 },
        { name: 'May 21', us: 69, comp1: 71, comp2: 46, comp3: 16 },
        { name: 'May 23', us: 73, comp1: 70, comp2: 49, comp3: 19 },
        { name: 'May 25', us: 75, comp1: 72, comp2: 51, comp3: 20 },
        { name: 'May 27', us: 76, comp1: 71, comp2: 52, comp3: 22 },
        { name: 'May 29', us: 79, comp1: 70, comp2: 54, comp3: 23 },
        { name: 'May 30', us: 78, comp1: 72, comp2: 61, comp3: 45 }
      ];

      const compTrafficShare = [
        { name: 'codigix.co', value: 15925, pct: '32.8%', color: '#3B82F6' },
        { name: 'competitor1.com', value: 13161, pct: '27.1%', color: '#10B981' },
        { name: 'competitor2.com', value: 10496, pct: '21.6%', color: '#F59E0B' },
        { name: 'competitor3.com', value: 8939, pct: '18.5%', color: '#6366F1' }
      ];

      const compTopCompetitors = [
        { domain: 'codigix.co', visibility: 78, keywords: 5421, backlinks: 18356, traffic: 15925, color: '#3B82F6' },
        { domain: 'competitor1.com', visibility: 72, keywords: 4892, backlinks: 16421, traffic: 13161, color: '#10B981' },
        { domain: 'competitor2.com', visibility: 61, keywords: 3894, backlinks: 11203, traffic: 10496, color: '#F59E0B' },
        { domain: 'competitor3.com', visibility: 45, keywords: 2981, backlinks: 8457, traffic: 8939, color: '#6366F1' }
      ];

      const compKeywordGap = [
        { keyword: 'crm software for business', volume: 1600, us: false, comp1: true, comp2: true, comp3: true },
        { keyword: 'best crm for small business', volume: 880, us: false, comp1: true, comp2: true, comp3: true },
        { keyword: 'erp crm software', volume: 720, us: false, comp1: true, comp2: true, comp3: true },
        { keyword: 'crm platform', volume: 590, us: false, comp1: true, comp2: true, comp3: true },
        { keyword: 'customer management software', volume: 480, us: false, comp1: true, comp2: true, comp3: true }
      ];

      const compBacklinkGap = [
        { domain: 'competitor1.com', missing: 2542, weak: 1287, strong: 3642 },
        { domain: 'competitor2.com', missing: 1987, weak: 1021, strong: 2874 },
        { domain: 'competitor3.com', missing: 1654, weak: 832, strong: 2155 }
      ];

      const compTopPages = [
        { page: '/crm-software', us: 3245, comp1: 4987, comp2: 2854, comp3: 1987 },
        { page: '/features', us: 2145, comp1: 3210, comp2: 2101, comp3: 1542 },
        { page: '/pricing', us: 1856, comp1: 2745, comp2: 1654, comp3: 1102 },
        { page: '/blog/best-crm', us: 1542, comp1: 3125, comp2: 2321, comp3: 1245 },
        { page: '/integrations', us: 1210, comp1: 2156, comp2: 1245, comp3: 1021 }
      ];

      const compContentGap = [
        { topic: 'CRM Automation', relevance: 'High', us: false, comp1: true, comp2: true, comp3: true },
        { topic: 'AI in CRM', relevance: 'High', us: false, comp1: true, comp2: true, comp3: true },
        { topic: 'CRM Integration', relevance: 'Medium', us: false, comp1: true, comp2: true, comp3: true },
        { topic: 'Sales Pipeline', relevance: 'Medium', us: false, comp1: true, comp2: true, comp3: true },
        { topic: 'Customer Retention', relevance: 'Low', us: false, comp1: true, comp2: true, comp3: true }
      ];

      const compChannelShare = [
        { domain: 'codigix.co', organic: '64.2%', direct: '18.6%', referrals: '7.8%', social: '5.1%', paid: '4.3%' },
        { domain: 'competitor1.com', organic: '61.4%', direct: '20.1%', referrals: '8.2%', social: '4.6%', paid: '5.7%' },
        { domain: 'competitor2.com', organic: '58.7%', direct: '19.3%', referrals: '9.5%', social: '6.2%', paid: '6.3%' },
        { domain: 'competitor3.com', organic: '52.1%', direct: '22.4%', referrals: '10.2%', social: '6.7%', paid: '8.6%' }
      ];

      const compRegion = [
        { country: 'India', topComp: 'competitor1.com', flag: 'in' },
        { country: 'United States', topComp: 'competitor1.com', flag: 'us' },
        { country: 'United Kingdom', topComp: 'competitor2.com', flag: 'gb' },
        { country: 'Canada', topComp: 'competitor1.com', flag: 'ca' },
        { country: 'Australia', topComp: 'competitor3.com', flag: 'au' }
      ];

      connection.release();
      res.json({
        kpis: {
          totalKeywords: keywordsRaw[0].total || 1256,
          top3Rankings: top3Raw[0].total || 278,
          top10Rankings: 632,
          organicTraffic,
          organicClicks: 8923,
          avgPosition: 16.8,
          gmbViews,
          gmbActions,
          aiVisibilityScore: 78,
          // NEW GMB KPIS
          gmbSearchViews: 5302,
          gmbMapViews: 2481,
          gmbWebsiteClicks: 532,
          gmbDirectionRequests: 196,
          gmbProfileInteractions: 1276,
          // NEW GEO KPIS
          geoBrandMentions: 1842,
          geoAiCitations: 642,
          geoPromptRankings: 286,
          geoAiBacklinks: 74,
          geoShareOfVoice: 12.6,
          // COMPETITORS KPIS
          compOrganicTraffic: 12842,
          compOrganicKeywords: 5421,
          compBacklinks: 18356,
          compReferringDomains: 2354,
          compDomainAuthority: 42,
          compVisibilityScore: 78
        },
        charts: {
          seoPerformance,
          gmbPerformance,
          rankingDistribution,
          keywordsByIntent,
          devicesByClicks,
          // NEW GMB CHARTS
          gmbPerformanceTime,
          gmbCustomerSearch,
          gmbCustomerActions,
          gmbReviewsOverTime,
          // NEW GEO CHARTS
          geoVisibilityTrend,
          geoShareOfVisibility,
          geoOverviewPresence,
          geoMentionsCitations,
          // COMPETITORS CHARTS
          compVisibilityComparison,
          compTrafficShare
        },
        lists: {
          topKeywords,
          topPages,
          topCountries,
          promptRankings,
          topGmbActions,
          // NEW GMB LISTS
          gmbTopReviewKeywords,
          gmbPhotoViews,
          gmbPostsPerformance,
          // NEW GEO LISTS
          geoTopPrompts,
          geoCompetitorCompare,
          geoContentOpportunities,
          // COMPETITORS LISTS
          compTopCompetitors,
          compKeywordGap,
          compBacklinkGap,
          compTopPages,
          compContentGap,
          compChannelShare,
          compRegion
        },
        widgets: {
          seoHealthDetails,
          coreWebVitals,
          aiVisibility,
          reviews,
          posts,
          localPack,
          techSeo,
          // NEW GMB WIDGETS
          gmbRecentReviews,
          gmbQaOverview,
          gmbProfileCompletion,
          // NEW GEO WIDGETS
          geoHealthScoreDetails
        }
      });
    } catch (error) {
      if (connection) connection.release();
      res.status(500).json({ error: error.message });
    }
  });
};
