const OpenAI = require('openai');
const nodemailer = require('nodemailer');

module.exports = function setupItKanbanRoutes(app, pool) {
  const db = {
    query: (sql, params) => pool.query(sql, params)
  };

  const getAssigneeEmail = async (assigneeName) => {
    if (!assigneeName || assigneeName === 'Unassigned') return null;
    if (assigneeName.includes('@')) return assigneeName;
    try {
      const [users] = await db.query(
        "SELECT email FROM users WHERE CONCAT(first_name, ' ', last_name) = ? OR first_name = ? OR email = ?",
        [assigneeName, assigneeName, assigneeName]
      );
      if (users.length > 0) return users[0].email;
    } catch (e) {
      console.error('Failed to get assignee email:', e);
    }
    return null;
  };

  const sendAssignmentEmail = async (assigneeEmail, assigneeName, ticketKey, ticketTitle, ticketType, ticketDescription, ticketStatus, ticketPriority) => {
    const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
    const SMTP_PORT = process.env.SMTP_PORT || '587';
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;

    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('⚠️ SMTP credentials missing. Cannot send assignment notification email.');
      return false;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: SMTP_PORT == 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });

      const link = `http://localhost:3001/it/employee/it/tasks?ticketKey=${ticketKey}`;

      const mailOptions = {
        from: `"CRM Notifications" <${SMTP_USER}>`,
        to: assigneeEmail,
        subject: `[CRM Notification] New Task Assigned: ${ticketTitle} (${ticketKey})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="background-color: #3b82f6; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
              <h2 style="color: white; margin: 0; font-size: 18px;">New Task Assigned</h2>
            </div>
            <div style="padding: 20px; color: #333333; line-height: 1.6;">
              <p>Hello <strong>${assigneeName}</strong>,</p>
              <p>You have been assigned a new task/issue in the IT Operations Dashboard:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Task Key</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketKey}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Title</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Type</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketType || 'Task'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Priority</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; color: ${ticketPriority === 'High' ? '#ef4444' : '#f97316'}; font-weight: bold;">${ticketPriority || 'Medium'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Status</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><span style="background-color: #eff6ff; color: #1e3a8a; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #bfdbfe;">${ticketStatus || 'TO DO'}</span></td>
                </tr>
              </table>

              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #4b5563; text-transform: ;">Description</h4>
                <p style="margin: 0; font-size: 13px; color: #1f2937;">${ticketDescription || 'No description provided.'}</p>
              </div>

              <div style="text-align: center;">
                <a href="${link}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">View Task in Portal</a>
              </div>
            </div>
            <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 11px; color: #6b7280; border-radius: 0 0 6px 6px;">
              This is an automated notification. Please do not reply to this email.
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ Assignment notification email sent successfully to ${assigneeEmail}:`, info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send assignment notification email:', error.message);
      return false;
    }
  };

  // ── AI Provider Configuration (supports DeepSeek, OpenAI & Gemini) ──
  const aiProvider = (process.env.AI_PROVIDER || 'deepseek').toLowerCase();

  let aiClient, aiModel, aiModelReasoning;
  if (aiProvider === 'deepseek') {
    aiClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY
    });
    aiModel = 'deepseek-chat';           // Fast general model
    aiModelReasoning = 'deepseek-reasoner'; // R1 deep reasoning model
    console.log('🤖 AI Provider: DeepSeek (deepseek-chat / deepseek-reasoner)');
  } else if (aiProvider === 'gemini') {
    aiClient = new OpenAI({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    });
    aiModel = 'gemini-1.5-flash';
    aiModelReasoning = 'gemini-1.5-flash';
    console.log('🤖 AI Provider: Gemini (gemini-1.5-flash via OpenAI SDK)');
  } else {
    aiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    aiModel = 'gpt-4o';
    aiModelReasoning = 'gpt-4o';
    console.log('🤖 AI Provider: OpenAI (gpt-4o)');
  }

  // Helper: check if the active provider's API key exists
  const hasApiKey = () => {
    if (aiProvider === 'deepseek') return !!process.env.DEEPSEEK_API_KEY;
    if (aiProvider === 'gemini') return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    return !!process.env.OPENAI_API_KEY;
  };

  // Helper: safe JSON parse from AI response (DeepSeek may wrap in markdown)
  const safeParseJSON = (text) => {
    // Strip markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return JSON.parse(cleaned.trim());
  };

  const responseError = (res, statusCode, message, error) => {
    console.error(`Error: ${message}`, error?.message || error);
    return res.status(statusCode).json({ error: message, details: error?.message || error });
  };

  const generateSmartFallback = (title = '', description = '', fallbackType = 'description', key = 'WR-101', developers = []) => {
    const devList = developers.length > 0 ? developers : ['Olivia Taylor', 'Michael Brown', 'Sophia Davis', 'Emma Johnson'];

    // Clean title and description of HTML tags and formatting
    const cleanTitle = title.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim() || 'Issue';
    let cleanDesc = (description || '')
      .split(/<hr[^>]*>/i)[0]
      .split(/✨|AI Assist|AI Enterprise|AI improved|Local Engine/i)[0]
      .replace(/<\/?[^>]+(>|$)/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanDesc || cleanDesc === 'Add a description...' || cleanDesc === 'None') {
      cleanDesc = `Implement the requirements specified in the title: "${cleanTitle}".`;
    }

    // Extract sentences from cleanDesc to use as dynamic context
    const sentences = cleanDesc
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && !s.toLowerCase().includes('generated via') && !s.toLowerCase().includes('local engine'));

    // Categorization keyword checks
    const combinedText = `${cleanTitle} ${cleanDesc}`.toLowerCase();
    let category = 'General';
    if (combinedText.includes('testing') || combinedText.includes('test ') || combinedText.includes('qa') || combinedText.includes('verification')) {
      category = 'Testing';
    } else if (combinedText.includes('database') || combinedText.includes('db ') || combinedText.includes('schema') || combinedText.includes('sql') || combinedText.includes('migration') || combinedText.includes('table')) {
      category = 'Database';
    } else if (combinedText.includes('login') || combinedText.includes('auth') || combinedText.includes('mfa') || combinedText.includes('signup') || combinedText.includes('credential')) {
      category = 'Authentication';
    } else if (combinedText.includes('api') || combinedText.includes('endpoint') || combinedText.includes('route') || combinedText.includes('controller') || combinedText.includes('backend')) {
      category = 'Backend API';
    } else if (combinedText.includes('file') || combinedText.includes('upload') || combinedText.includes('download') || combinedText.includes('pdf') || combinedText.includes('image')) {
      category = 'Document Management';
    } else if (combinedText.includes('frontend') || combinedText.includes('ui') || combinedText.includes('ux') || combinedText.includes('component') || combinedText.includes('form') || combinedText.includes('view') || combinedText.includes('css')) {
      category = 'Frontend UI';
    }

    if (fallbackType === 'description') {
      // Dynamic Description Generator
      const overview = `This task implements and delivers the required features, configurations, and bug fixes for the <strong>"${cleanTitle}"</strong> component within the IT module.`;

      const userStory = `As an active CRM system user, I want the feature <strong>"${cleanTitle}"</strong> to function correctly, so that I can perform my work tasks efficiently and avoid project bottlenecks.`;

      // Build dynamic functional requirements from sentences or defaults
      const requirements = [];
      if (sentences.length > 0) {
        sentences.forEach(s => {
          requirements.push(`Configure and implement system logic supporting: "${s}"`);
        });
      } else {
        requirements.push(`Design the interactive interface and user workflow bindings for "${cleanTitle}".`);
        requirements.push(`Configure backend services and database transactions to support "${cleanTitle}".`);
        requirements.push(`Establish thorough model level schema constraints and business rule validations.`);
      }

      // Build dynamic acceptance criteria
      const acceptanceCriteria = [];
      if (sentences.length > 0) {
        acceptanceCriteria.push(`Given the "${cleanTitle}" dashboard panel is active, When a user actions "${sentences[0]}", Then the system state updates correctly.`);
        if (sentences[1]) {
          acceptanceCriteria.push(`Given validation rules are enforced, When input data does not satisfy: "${sentences[1]}", Then the system shows a friendly error message.`);
        }
      } else {
        acceptanceCriteria.push(`Given the user is on the IT Kanban board page, When they view the details for "${cleanTitle}", Then the specific ticket details and status load immediately.`);
        acceptanceCriteria.push(`Given changes are persisted, When the form is submitted with valid fields, Then the issue updates are saved successfully in the database.`);
      }

      const technicalNotes = [
        `Component: Custom configurations mapping to "${cleanTitle}".`,
        `Database: Schema verification checks in <code>it_kanban_issues</code> table.`,
        `Validation: Ensure parameter validation logic is applied on incoming payloads.`
      ];

      const edgeCases = [
        `Handle empty or invalid draft input values for "${cleanTitle}" gracefully without causing script crashes.`,
        `Prevent multiple rapid button clicks from triggering duplicate actions.`
      ];

      const testingScenarios = [
        `Verify UI elements for "${cleanTitle}" render correctly on mobile, tablet, and desktop screens.`,
        `Confirm integration tests succeed for core workflows associated with: "${cleanTitle}".`
      ];

      return `
        <p>${cleanDesc}</p>
        <hr class="my-3 border-gray-200" />
        <h3 class=" text-sm text-indigo-700">✨ AI Enterprise Improvements (Local Fallback Engine):</h3>
        <h4 class=" text-xs mt-2 text-gray-800">📋 Overview</h4>
        <p>${overview}</p>
        <h4 class=" text-xs mt-2 text-gray-800">👤 User Story</h4>
        <p><em>${userStory}</em></p>
        <h4 class=" text-xs mt-2 text-gray-800">✅ Functional Requirements</h4>
        <ul class="list-disc pl-4 space-y-1 text-gray-700">
          ${requirements.map(req => `<li>${req}</li>`).join('')}
        </ul>
        <h4 class=" text-xs mt-2 text-gray-800">🎯 Acceptance Criteria</h4>
        <ol class="list-decimal pl-4 space-y-1 text-gray-700">
          ${acceptanceCriteria.map(ac => `<li>${ac}</li>`).join('')}
        </ol>
        <h4 class=" text-xs mt-2 text-gray-800">🔧 Technical Notes</h4>
        <ul class="list-disc pl-4 space-y-1 text-gray-700">
          ${technicalNotes.map(n => `<li>${n}</li>`).join('')}
        </ul>
        <h4 class=" text-xs mt-2 text-gray-800">⚠️ Edge Cases</h4>
        <ul class="list-disc pl-4 space-y-1 text-gray-700">
          ${edgeCases.map(ec => `<li>${ec}</li>`).join('')}
        </ul>
        <h4 class=" text-xs mt-2 text-gray-800">🧪 Testing Scenarios</h4>
        <ul class="list-disc pl-4 space-y-1 text-gray-700">
          ${testingScenarios.map(ts => `<li>${ts}</li>`).join('')}
        </ul>
        <p class="text-xs text-gray-400 mt-4"><em>(Generated dynamically based on "${cleanTitle}" using CRM local engine rules)</em></p>
      `.trim();
    }

    if (fallbackType === 'subtasks') {
      const subtaskTitles = [];

      // If sentences are found, convert each sentence into an actionable subtask title
      if (sentences.length > 0) {
        sentences.forEach(s => {
          let cleanS = s.replace(/<\/?[^>]+(>|$)/g, "").trim();
          if (cleanS) {
            subtaskTitles.push(cleanS.charAt(0).toUpperCase() + cleanS.slice(1));
          }
        });
      }

      // Ensure we have a complete set of 4-5 customized subtasks
      if (subtaskTitles.length < 1) {
        subtaskTitles.push(`Define user requirements & scope layout for "${cleanTitle}"`);
      }
      if (subtaskTitles.length < 2) {
        subtaskTitles.push(`Design UI screens and mock views for "${cleanTitle}"`);
      }
      if (subtaskTitles.length < 3) {
        subtaskTitles.push(`Create database fields, schema index configs & tables supporting "${cleanTitle}"`);
      }
      if (subtaskTitles.length < 4) {
        subtaskTitles.push(`Develop API router logic, validation checks & endpoint integrations for "${cleanTitle}"`);
      }
      if (subtaskTitles.length < 5) {
        subtaskTitles.push(`Perform manual and automated QA verify assertions on mobile and desktop layout rules for "${cleanTitle}"`);
      }

      return subtaskTitles.map((stTitle, idx) => {
        const categories = ['Design', 'Database', 'Backend API', 'Frontend UI', 'Testing'];
        const selectedCat = categories[idx % categories.length];
        return {
          title: stTitle.length > 80 ? stTitle.substring(0, 77) + '...' : stTitle,
          description: `Implement, execute and verify the specifications regarding "${stTitle}" for the overall feature "${cleanTitle}".`,
          estimated_hours: [4, 6, 8, 4, 6][idx % 5],
          priority: ['High', 'Medium', 'Low'][idx % 3],
          suggested_assignee: devList[idx % devList.length],
          dependencies: idx === 0 ? 'None' : subtaskTitles[idx - 1].substring(0, 50),
          labels: [selectedCat],
          sprint: 'Sprint 1',
          complexity: [4, 6, 8, 4, 6][idx % 5] > 6 ? 'High' : ([4, 6, 8, 4, 6][idx % 5] > 4 ? 'Medium' : 'Low'),
          category: selectedCat
        };
      });
    }

    if (fallbackType === 'docs') {
      let plan = '';
      let qa = '';
      let deploy = '';
      let rollback = '';
      let apiDoc = '';
      let userDoc = '';

      if (category === 'auth') {
        plan = `<ol class="list-decimal pl-4 space-y-1"><li>Draft user tables containing hashed password attributes.</li><li>Create auth routers wrapping jsonwebtoken.</li><li>Design Login page components.</li></ol>`;
        qa = `<ul class="list-disc pl-4 space-y-1"><li>Assert invalid emails fail form verification.</li><li>Verify token cookies cannot be read by browser script injection.</li></ul>`;
        deploy = `<ul class="list-disc pl-4 space-y-1"><li>Run db migrations to deploy user credentials attributes.</li><li>Restart production backend service.</li></ul>`;
        rollback = `<ul class="list-disc pl-4 space-y-1"><li>Run migration rollback script.</li><li>Restore backup configurations files.</li></ul>`;
        apiDoc = `<p><strong>POST /api/auth/login</strong></p><p>Returns user token cookie upon verification.</p>`;
        userDoc = `<p>Click sign-in button in top navigation. Input email and credentials to enter CRM panel.</p>`;
      } else if (category === 'frontend') {
        plan = `<ol class="list-decimal pl-4 space-y-1"><li>Establish component code files structures.</li><li>Connect state selectors loading parent models.</li><li>Design responsive grid borders.</li></ol>`;
        qa = `<ul class="list-disc pl-4 space-y-1"><li>Confirm interactive buttons trigger actions.</li><li>Validate layout borders adjust on mobile screens.</li></ul>`;
        deploy = `<ul class="list-disc pl-4 space-y-1"><li>Rebuild client static output artifacts.</li><li>Publish bundle files to frontend host.</li></ul>`;
        rollback = `<ul class="list-disc pl-4 space-y-1"><li>Deploy stable build bundle matching last Git tag commit.</li></ul>`;
        apiDoc = `<p>Does not contain backend routes changes.</p>`;
        userDoc = `<p>Component updates directly on corresponding screen. View statistics layout on main sidebar link.</p>`;
      } else if (category === 'database') {
        plan = `<ol class="list-decimal pl-4 space-y-1"><li>Draft schema ERD layout diagrams.</li><li>Initialize migration files directory.</li><li>Configure relational table indexing rules.</li></ol>`;
        qa = `<ul class="list-disc pl-4 space-y-1"><li>Assert foreign keys fail invalid insertions.</li><li>Measure index lookup speeds.</li></ul>`;
        deploy = `<ul class="list-disc pl-4 space-y-1"><li>Connect production DB console.</li><li>Apply upgrade database migration files.</li></ul>`;
        rollback = `<ul class="list-disc pl-4 space-y-1"><li>Run db downgrade migration scripts.</li></ul>`;
        apiDoc = `<p>Updates tables columns definitions. Verify models files in backend.</p>`;
        userDoc = `<p>Maintains persistent CRM lists. Works automatically in database background.</p>`;
      } else if (category === 'api') {
        plan = `<ol class="list-decimal pl-4 space-y-1"><li>Generate backend routes controllers.</li><li>Construct validation schema models.</li><li>Configure express server routes endpoints mapping.</li></ol>`;
        qa = `<ul class="list-disc pl-4 space-y-1"><li>Test API routes return 400 when keys are missing.</li><li>Verify CRUD operation payloads match DB types.</li></ul>`;
        deploy = `<ul class="list-disc pl-4 space-y-1"><li>Merge code changes to main trunk.</li><li>Restart production application servers.</li></ul>`;
        rollback = `<ul class="list-disc pl-4 space-y-1"><li>Revert API code changes commit to stable checkout.</li></ul>`;
        apiDoc = `<p><strong>POST /api/it-kanban/issues</strong></p><p>Creates new ticket with title and status parameters.</p>`;
        userDoc = `<p>Provides network API interfaces. Used directly by client applications.</p>`;
      } else if (category === 'document') {
        plan = `<ol class="list-decimal pl-4 space-y-1"><li>Import multer middleware.</li><li>Configure upload folder file paths.</li><li>Build attachment components views.</li></ol>`;
        qa = `<ul class="list-disc pl-4 space-y-1"><li>Test uploading file sizes larger than 10MB fails.</li><li>Verify files save to correct disk pathways.</li></ul>`;
        deploy = `<ul class="list-disc pl-4 space-y-1"><li>Create storage directories on target host server.</li><li>Deploy backend changes.</li></ul>`;
        rollback = `<ul class="list-disc pl-4 space-y-1"><li>Restore client panel components to previous commit.</li></ul>`;
        apiDoc = `<p><strong>POST /api/documents/upload</strong></p><p>Payload: multipart/form-data. Returns file path string.</p>`;
        userDoc = `<p>Drag and drop files onto client screens directly to upload files. Click files lists to view attachments.</p>`;
      } else {
        plan = `<ol class="list-decimal pl-4 space-y-1"><li>Read task details requirements.</li><li>Build client widgets and server API.</li><li>Conduct verification checks.</li></ol>`;
        qa = `<ul class="list-disc pl-4 space-y-1"><li>Verify main user scenarios succeed without errors.</li></ul>`;
        deploy = `<ul class="list-disc pl-4 space-y-1"><li>Push commit changes to repository production branch.</li></ul>`;
        rollback = `<ul class="list-disc pl-4 space-y-1"><li>Revert to last stable release commit state.</li></ul>`;
        apiDoc = `<p>No routing changes introduced.</p>`;
        userDoc = `<p>Feature integrates on IT Operations Kanban board. Access parent card to view details.</p>`;
      }

      return {
        summary: `<p>A comprehensive task resolving issue <strong>"${title}"</strong> to secure operations.</p>`,
        implementation_plan: plan,
        qa_checklist: qa,
        deployment_checklist: deploy,
        rollback_checklist: rollback,
        api_documentation: apiDoc,
        user_documentation: userDoc
      };
    }
  };

  // GET all kanban issues
  app.get('/api/it-kanban/issues', async (req, res) => {
    try {
      const [issues] = await db.query('SELECT * FROM it_kanban_issues ORDER BY created_at DESC');

      // Parse JSON fields back to objects for the frontend
      const formattedIssues = issues.map(issue => ({
        ...issue,
        subtasks: typeof issue.subtasks === 'string' ? JSON.parse(issue.subtasks) : (issue.subtasks || []),
        linked_issues: typeof issue.linked_issues === 'string' ? JSON.parse(issue.linked_issues) : (issue.linked_issues || []),
        comments: typeof issue.comments === 'string' ? JSON.parse(issue.comments) : (issue.comments || [])
      }));

      res.json(formattedIssues);
    } catch (error) {
      responseError(res, 500, 'Failed to fetch IT Kanban issues', error);
    }
  });

  // POST create a new issue
  app.post('/api/it-kanban/issues', async (req, res) => {
    try {
      const { title, type, priority, status, assignee, description } = req.body;

      // Generate a new key (e.g., WR-XXX). Simple logic: find max WR ID and increment
      const [maxKeyResult] = await db.query("SELECT issue_key FROM it_kanban_issues WHERE issue_key LIKE 'WR-%' ORDER BY id DESC LIMIT 1");
      let nextNum = 101;
      if (maxKeyResult.length > 0) {
        const parts = maxKeyResult[0].issue_key.split('-');
        if (parts.length === 2 && !isNaN(parts[1])) {
          nextNum = parseInt(parts[1]) + 1;
        }
      }
      const newKey = `WR-${nextNum}`;

      const [result] = await db.query(`
        INSERT INTO it_kanban_issues (issue_key, title, type, priority, status, assignee, description, subtasks, linked_issues, comments, progress, original_estimate, remaining_estimate, time_spent, components, environment, vulnerability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '0h', '0h', '0h', '', '', '')
      `, [
        newKey,
        title,
        type || 'Task',
        priority || 'Medium',
        status || 'TO DO',
        assignee || 'Unassigned',
        description || '',
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([])
      ]);

      // Send assignment email notification asynchronously
      if (assignee && assignee !== 'Unassigned') {
        getAssigneeEmail(assignee).then(email => {
          if (email) {
            sendAssignmentEmail(email, assignee, newKey, title, type, description, status, priority);
          }
        }).catch(err => console.error('Failed to trigger email notify:', err));
      }

      res.status(201).json({
        message: 'Issue created successfully',
        id: result.insertId,
        issue_key: newKey
      });
    } catch (error) {
      responseError(res, 500, 'Failed to create IT Kanban issue', error);
    }
  });

  // PUT update an issue by key
  app.put('/api/it-kanban/issues/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const updates = req.body; // e.g. { status: 'IN PROGRESS', title: 'New Title' }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const updateFields = [];
      const updateValues = [];

      // Only allow updating these specific fields
      const allowedFields = ['title', 'description', 'type', 'priority', 'status', 'assignee', 'reporter', 'sprint', 'due_date', 'start_date', 'progress', 'original_estimate', 'remaining_estimate', 'time_spent', 'components', 'environment', 'vulnerability'];
      const jsonFields = ['subtasks', 'linked_issues', 'comments'];

      for (const [field, value] of Object.entries(updates)) {
        if (allowedFields.includes(field)) {
          updateFields.push(`${field} = ?`);
          updateValues.push(value);
        } else if (jsonFields.includes(field)) {
          updateFields.push(`${field} = ?`);
          updateValues.push(typeof value === 'object' ? JSON.stringify(value) : value);
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided to update' });
      }

      updateValues.push(key);

      // Check if assignee is updated
      if (updates.assignee) {
        try {
          const [currentIssues] = await db.query(
            "SELECT title, assignee, description, priority, type, status FROM it_kanban_issues WHERE issue_key = ?",
            [key]
          );
          if (currentIssues.length > 0) {
            const currentIssue = currentIssues[0];
            const newAssignee = updates.assignee;
            if (newAssignee !== currentIssue.assignee && newAssignee !== 'Unassigned') {
              getAssigneeEmail(newAssignee).then(email => {
                if (email) {
                  sendAssignmentEmail(
                    email,
                    newAssignee,
                    key,
                    updates.title || currentIssue.title,
                    updates.type || currentIssue.type,
                    updates.description || currentIssue.description,
                    updates.status || currentIssue.status,
                    updates.priority || currentIssue.priority
                  );
                }
              }).catch(err => console.error('Failed to trigger email notify on update:', err));
            }
          }
        } catch (dbErr) {
          console.error('Failed to query current issue state for assignee check:', dbErr);
        }
      }

      const [result] = await db.query(`
        UPDATE it_kanban_issues
        SET ${updateFields.join(', ')}
        WHERE issue_key = ?
      `, updateValues);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      res.json({ message: 'Issue updated successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to update IT Kanban issue', error);
    }
  });

  // DELETE an issue by key
  app.delete('/api/it-kanban/issues/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const [result] = await db.query('DELETE FROM it_kanban_issues WHERE issue_key = ?', [key]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
      responseError(res, 500, 'Failed to delete IT Kanban issue', error);
    }
  });

  // ── AI STAR ASSIST ENDPOINTS ──

  // 1. Improve Description
  app.post('/api/it-kanban/issues/:key/ai/improve-description', async (req, res) => {
    const { key } = req.params;
    try {
      const [rows] = await db.query('SELECT title, description FROM it_kanban_issues WHERE issue_key = ?', [key]);
      if (rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
      const issue = rows[0];

      let improvedDescription = '';
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: `You are a senior software architect and business analyst. Your job is to read the task title and description VERY carefully, understand the EXACT feature/bug/requirement being described, and then rewrite the description into a comprehensive, professional specification.

IMPORTANT RULES:
- Read every word of the original description. Understand what the user actually wants to build or fix.
- Do NOT produce generic filler text. Every sentence must be SPECIFIC to this exact task.
- Extract actual requirements, screens, components, APIs, database tables, user flows mentioned or implied.
- Organize the improved description using these sections (skip any that don't apply):

1. **Overview** - A clear 2-3 sentence summary of what this task accomplishes, referencing actual feature names, pages, or modules.
2. **User Story** - Write as "As a [specific role], I want [specific action on specific page/feature], so that [specific business value]."
3. **Functional Requirements** - Bullet list of SPECIFIC things the system must do. Reference actual UI elements, API endpoints, database fields, business rules.
4. **Acceptance Criteria** - Numbered checklist using Given/When/Then format with REAL scenarios from the description.
5. **Technical Implementation Notes** - Mention specific technologies, files, components, database tables, API routes relevant to THIS task.
6. **Edge Cases & Error Handling** - List specific edge cases relevant to THIS feature.
7. **Dependencies** - Other tasks, APIs, or systems this depends on.
8. **Testing Scenarios** - Specific test cases for THIS feature.

Format using clean HTML tags (<p>, <strong>, <ul>, <li>, <ol>, <h4>, <em>, <code>). Respond ONLY with HTML content.`
            },
            {
              role: "user",
              content: `Task Title: ${issue.title}\n\nOriginal Description:\n${issue.description || 'No description provided - analyze the title and create a detailed specification based on what the title implies.'}`
            }
          ]
        });

        improvedDescription = response.choices[0].message.content.trim();
      } catch (aiErr) {
        console.warn('AI Call failed, falling back to local description expander:', aiErr.message);
        improvedDescription = generateSmartFallback(issue.title, issue.description || '', 'description', key);
      }

      // Update the DB
      await db.query('UPDATE it_kanban_issues SET description = ? WHERE issue_key = ?', [improvedDescription, key]);

      res.json({ description: improvedDescription });
    } catch (error) {
      responseError(res, 500, 'AI Description generation failed', error);
    }
  });

  // 2. Link Confluence Content
  app.post('/api/it-kanban/issues/:key/ai/link-confluence', async (req, res) => {
    const { key } = req.params;
    try {
      const [rows] = await db.query('SELECT title, description, linked_issues FROM it_kanban_issues WHERE issue_key = ?', [key]);
      if (rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
      const issue = rows[0];

      let suggestions = [];
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: "You are an AI IT knowledge management assistant. Based on the issue title and description, suggest 2-3 Confluence pages or documentation items that would be helpful for resolving this ticket. Return the suggestions as a JSON array inside a JSON object with key 'suggestions', where each suggestion object has: 'title' (e.g. 'VPN Configuration Guide'), 'url' (e.g. 'https://confluence.internal/vpn-config'), and 'relation' (use 'Confluence'). Respond ONLY in valid JSON format. Example format: { \"suggestions\": [ { \"title\": \"VPN Guide\", \"url\": \"https://confluence.internal/vpn\", \"relation\": \"Confluence\" } ] }"
            },
            {
              role: "user",
              content: `Title: ${issue.title}\nDescription: ${issue.description || 'None'}`
            }
          ],
        });

        const data = safeParseJSON(response.choices[0].message.content);
        suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      } catch (aiErr) {
        console.warn('AI Call failed, falling back to local confluence link generator:', aiErr.message);
        suggestions = [
          {
            title: `IT Runbook - ${issue.title} Resolution Playbook`,
            url: `https://confluence.internal/wiki/spaces/IT/pages/Runbook-${key}`,
            relation: 'Confluence'
          },
          {
            title: "Database Indexing & Query Tuning Guidelines",
            url: "https://confluence.internal/wiki/spaces/DEV/pages/DB-Guidelines",
            relation: 'Confluence'
          }
        ];
      }

      // Append these suggestions to linked_issues
      let currentLinked = [];
      if (issue.linked_issues) {
        currentLinked = typeof issue.linked_issues === 'string' ? JSON.parse(issue.linked_issues) : issue.linked_issues;
      }

      const newLinked = [...currentLinked, ...suggestions];

      // Save to database
      await db.query('UPDATE it_kanban_issues SET linked_issues = ? WHERE issue_key = ?', [JSON.stringify(newLinked), key]);

      res.json({ linked_issues: newLinked });
    } catch (error) {
      responseError(res, 500, 'AI Confluence suggestion failed', error);
    }
  });

  // 3. Summarize Comments
  app.post('/api/it-kanban/issues/:key/ai/summarize-comments', async (req, res) => {
    const { key } = req.params;
    try {
      const [rows] = await db.query('SELECT comments FROM it_kanban_issues WHERE issue_key = ?', [key]);
      if (rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
      const issue = rows[0];

      let comments = [];
      if (issue.comments) {
        comments = typeof issue.comments === 'string' ? JSON.parse(issue.comments) : issue.comments;
      }

      if (comments.length === 0) {
        return res.json({ summary: "No comments available to summarize." });
      }

      let summary = '';
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const commentsText = comments.map(c => `${c.author || 'User'}: ${c.text}`).join('\n');

        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: "You are an AI comment summarization assistant. Summarize the following comments on this issue/ticket. Provide a short, bulleted summary of key points and any action items discussed in the comments. Respond in plain text with clean formatting."
            },
            {
              role: "user",
              content: `Comments:\n${commentsText}`
            }
          ]
        });

        summary = response.choices[0].message.content.trim();
      } catch (aiErr) {
        console.warn('AI Call failed, falling back to local comment summarizer:', aiErr.message);
        summary = `
Comment Summary for ${key} (Local Fallback):
- Discussion mostly focuses on task prioritization and testing workflows.
- There are ${comments.length} comment(s) registered on this ticket.
- Action Item: Verify implementation and confirm with assignee.
        `.trim();
      }

      res.json({ summary });
    } catch (error) {
      responseError(res, 500, 'AI Comment summarization failed', error);
    }
  });

  // 4. Suggest Subtasks (Child Work Items)
  app.post('/api/it-kanban/issues/:key/ai/suggest-subtasks', async (req, res) => {
    const { key } = req.params;
    const { title: reqTitle, description: reqDescription } = req.body;
    try {
      const [rows] = await db.query('SELECT title, description FROM it_kanban_issues WHERE issue_key = ?', [key]);
      const issue = rows.length > 0 ? rows[0] : {};
      const title = reqTitle || issue.title || 'Task';
      const description = reqDescription !== undefined ? reqDescription : (issue.description || '');

      let subtasks = [];
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: "You are an IT project management assistant. Based on the issue title and description, suggest a list of 3-5 subtasks (child work items) needed to complete this ticket. Return the suggestions as a JSON array inside a JSON object with key 'subtasks', where each subtask object has: 'title' (e.g. 'Add database indexes') and 'completed' (boolean, false). Respond ONLY in valid JSON format. Example format: { \"subtasks\": [ { \"title\": \"Define key user flows\", \"completed\": false } ] }"
            },
            {
              role: "user",
              content: `Title: ${title}\nDescription: ${description || 'None'}`
            }
          ],
        });

        const data = safeParseJSON(response.choices[0].message.content);
        subtasks = Array.isArray(data.subtasks) ? data.subtasks : [];
      } catch (aiErr) {
        console.warn('AI Call failed, falling back to local description-based subtask generator:', aiErr.message);

        // Generate dynamic fallback subtasks
        const fallbackTasks = generateSmartFallback(title, description, 'subtasks', key);
        subtasks = fallbackTasks.map(t => ({
          title: t.title,
          completed: false
        }));
      }

      res.json({ subtasks });
    } catch (error) {
      responseError(res, 500, 'AI Subtask suggestion failed', error);
    }
  });

  // 5. Link Similar Work Items
  app.post('/api/it-kanban/issues/:key/ai/link-similar', async (req, res) => {
    const { key } = req.params;
    try {
      const [rows] = await db.query('SELECT title, description, linked_issues FROM it_kanban_issues WHERE issue_key = ?', [key]);
      if (rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
      const currentIssue = rows[0];

      const [allIssues] = await db.query('SELECT issue_key, title, description FROM it_kanban_issues WHERE issue_key != ?', [key]);

      let suggestions = [];
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        if (allIssues.length === 0) throw new Error('No other issues exist');

        const issuesListText = allIssues.map(i => `Key: ${i.issue_key}, Title: ${i.title}`).join('\n');

        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: "You are an AI assistant for matching software engineering issues. Based on the target issue, find the 2-3 most similar or related issues from the list of existing issues. Return a JSON array inside a JSON object with key 'similar', where each suggestion object has: 'key' (the issue key, e.g. 'WR-102'), 'title' (the issue title), and 'relation' (use 'is related to'). Respond ONLY in valid JSON format. Example format: { \"similar\": [ { \"key\": \"WR-102\", \"title\": \"Setup VPN\", \"relation\": \"is related to\" } ] }"
            },
            {
              role: "user",
              content: `Target Issue Title: ${currentIssue.title}\nTarget Issue Description: ${currentIssue.description || 'None'}\n\nExisting Issues:\n${issuesListText}`
            }
          ],
        });

        const data = safeParseJSON(response.choices[0].message.content);
        suggestions = Array.isArray(data.similar) ? data.similar : [];
      } catch (aiErr) {
        console.warn('AI Call failed, falling back to local similar issues matcher:', aiErr.message);
        if (allIssues.length > 0) {
          suggestions = allIssues.slice(0, 2).map(iss => ({
            key: iss.issue_key,
            title: iss.title,
            relation: 'is related to'
          }));
        }
      }

      // Append suggestions to current linked_issues
      let currentLinked = [];
      if (currentIssue.linked_issues) {
        currentLinked = typeof currentIssue.linked_issues === 'string' ? JSON.parse(currentIssue.linked_issues) : currentIssue.linked_issues;
      }

      // Avoid duplicates
      const newLinked = [...currentLinked];
      suggestions.forEach(suggest => {
        if (!newLinked.some(item => item.key === suggest.key)) {
          newLinked.push(suggest);
        }
      });

      // Save to database
      await db.query('UPDATE it_kanban_issues SET linked_issues = ? WHERE issue_key = ?', [JSON.stringify(newLinked), key]);

      res.json({ linked_issues: newLinked });
    } catch (error) {
      responseError(res, 500, 'AI Similar issues linking failed', error);
    }
  });

  // 6. Side-by-side description improvement
  app.post('/api/it-kanban/issues/:key/ai/generate-improved-description', async (req, res) => {
    const { key } = req.params;
    const { description } = req.body;
    try {
      const [rows] = await db.query('SELECT title FROM it_kanban_issues WHERE issue_key = ?', [key]);
      const title = rows.length > 0 ? rows[0].title : 'Issue';

      let improved = '';
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: `You are a senior enterprise business analyst reviewing a task description for a CRM/Project Management system. Read the description WORD BY WORD and understand the EXACT feature, module, or bug being described.

Your job is to improve THIS SPECIFIC description by:
1. Fixing grammar, spelling, and sentence structure while keeping the original meaning.
2. Adding SPECIFIC technical details that are implied but not written (e.g., if it mentions "add a form", specify what fields, validations, API calls are needed).
3. Breaking vague requirements into CONCRETE, actionable specifications.
4. Adding acceptance criteria that reference the ACTUAL feature described.
5. Identifying missing requirements, security considerations, and edge cases SPECIFIC to this task.

Structure the output as:
- <h4>📋 Overview</h4> - What this task does (be specific, name the actual module/page/component)
- <h4>👤 User Story</h4> - As a [role], I want [this specific thing], so that [this specific benefit]
- <h4>✅ Functional Requirements</h4> - Detailed bullet list of EXACTLY what needs to be built
- <h4>🎯 Acceptance Criteria</h4> - Numbered Given/When/Then scenarios
- <h4>🔧 Technical Notes</h4> - API endpoints, DB tables, components involved
- <h4>⚠️ Edge Cases</h4> - What could go wrong specific to THIS feature
- <h4>🧪 Testing Scenarios</h4> - How to test THIS specific feature

Do NOT produce generic boilerplate. Every line must relate to the actual task content.
Format using clean HTML (<p>, <strong>, <ul>, <li>, <ol>, <h4>, <code>). Respond ONLY with the HTML.`
            },
            {
              role: "user",
              content: `Task Title: ${title}\n\nCurrent Description to Improve:\n${description || 'No description provided - analyze the title and create a detailed specification.'}`
            }
          ]
        });
        improved = response.choices[0].message.content.trim();
      } catch (err) {
        console.warn('AI generate-improved-description failed, running fallback:', err.message);
        improved = generateSmartFallback(title, description || '', 'description', key);
      }

      res.json({ improvedDescription: improved });
    } catch (error) {
      responseError(res, 500, 'AI Description analysis failed', error);
    }
  });

  // 6.5. Improve description draft (before ticket creation)
  app.post('/api/it-kanban/ai/improve-description-draft', async (req, res) => {
    const { title, description } = req.body;
    try {
      let improved = '';
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: `You are a senior enterprise business analyst reviewing a task description for a CRM/Project Management system. Read the description WORD BY WORD and understand the EXACT feature, module, or bug being described.

Your job is to improve THIS SPECIFIC description by:
1. Fixing grammar, spelling, and sentence structure while keeping the original meaning.
2. Adding SPECIFIC technical details that are implied but not written (e.g., if it mentions "add a form", specify what fields, validations, API calls are needed).
3. Breaking vague requirements into CONCRETE, actionable specifications.
4. Adding acceptance criteria that reference the ACTUAL feature described.
5. Identifying missing requirements, security considerations, and edge cases SPECIFIC to this task.

Structure the output as:
- <h4>📋 Overview</h4> - What this task does (be specific, name the actual module/page/component)
- <h4>👤 User Story</h4> - As a [role], I want [this specific thing], so that [this specific benefit]
- <h4>✅ Functional Requirements</h4> - Detailed bullet list of EXACTLY what needs to be built
- <h4>🎯 Acceptance Criteria</h4> - Numbered Given/When/Then scenarios
- <h4>🔧 Technical Notes</h4> - API endpoints, DB tables, components involved
- <h4>⚠️ Edge Cases</h4> - What could go wrong specific to THIS feature
- <h4>🧪 Testing Scenarios</h4> - How to test THIS specific feature

Do NOT produce generic boilerplate. Every line must relate to the actual task content.
Format using clean HTML (<p>, <strong>, <ul>, <li>, <ol>, <h4>, <code>). Respond ONLY with the HTML.`
            },
            {
              role: "user",
              content: `Task Title: ${title || 'New Task'}\n\nCurrent Description to Improve:\n${description || 'No description provided - analyze the title and create a detailed specification.'}`
            }
          ]
        });
        improved = response.choices[0].message.content.trim();
      } catch (err) {
        console.warn('AI improve-description-draft failed, running fallback:', err.message);
        improved = generateSmartFallback(title || 'New Task', description || '', 'description', 'WR-NEW');
      }

      res.json({ improvedDescription: improved });
    } catch (error) {
      responseError(res, 500, 'AI Description analysis failed', error);
    }
  });

  // 7. Detailed subtasks generation
  app.post('/api/it-kanban/issues/:key/ai/generate-subtasks-detailed', async (req, res) => {
    const { key } = req.params;
    const { title: reqTitle, description: reqDescription } = req.body;
    try {
      const [rows] = await db.query('SELECT title, description FROM it_kanban_issues WHERE issue_key = ?', [key]);
      const issue = rows.length > 0 ? rows[0] : {};
      const title = reqTitle || issue.title || 'Task';
      const description = reqDescription !== undefined ? reqDescription : (issue.description || '');

      // Fetch team users for assigning suggestions
      const [teamUsers] = await db.query('SELECT id, first_name, last_name FROM users');
      const developers = teamUsers.map(u => `${u.first_name} ${u.last_name}`);

      let subtasks = [];
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: `You are an expert Scrum Master and Technical Lead. Read the task title and description VERY CAREFULLY. Understand the COMPLETE workflow, all the screens, APIs, database changes, validations, and user interactions described.

Then break this task down into 5-8 SPECIFIC, ACTIONABLE subtasks that follow the actual implementation flow described in the ticket. Each subtask must be DIRECTLY derived from the description content.

RULES:
- DO NOT create generic subtasks like "UI Design" or "Database Design" unless the description specifically mentions them.
- Each subtask title must reference the ACTUAL component, page, feature, API, or module mentioned in the description.
- Order subtasks in the logical implementation sequence (what must be built first → what depends on it).
- Estimate hours realistically based on the complexity described.
- The subtask titles should be so specific that a developer can understand exactly what to build without reading the parent ticket.

Examples of GOOD subtask titles (specific to the actual task):
- "Create /api/invoices POST endpoint with validation for amount, due_date, client_id"
- "Build InvoiceFormModal component with line items, tax calculation, and preview"
- "Add invoice_items table with foreign key to invoices and product_id columns"
- "Implement PDF generation for invoice with company letterhead template"
- "Write integration tests for invoice CRUD operations and edge cases"

Examples of BAD subtask titles (too generic):
- "UI Design & Wireframe"
- "Backend Development"
- "Database Schema Design"
- "Testing"

Return a JSON object with key 'subtasks'. Each subtask: { 'title' (specific string), 'description' (2-3 sentence detail of what exactly to implement), 'estimated_hours' (number), 'priority' ('High'|'Medium'|'Low'), 'suggested_assignee' (from developer list), 'dependencies' (which other subtask must finish first, or 'None'), 'labels' (array), 'sprint' (string), 'complexity' ('High'|'Medium'|'Low'), 'category' (e.g. 'Backend API', 'Frontend UI', 'Database', 'Testing', 'DevOps') }.
Respond ONLY in valid JSON format.`
            },
            {
              role: "user",
              content: `Task Title: ${title}\n\nFull Description:\n${(description || 'No description').replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim()}\n\nAvailable Developers: ${developers.join(', ')}`
            }
          ],
        });
        const data = safeParseJSON(response.choices[0].message.content);
        subtasks = Array.isArray(data.subtasks) ? data.subtasks : [];
      } catch (err) {
        console.warn('AI generate-subtasks-detailed failed, running fallback:', err.message);
        subtasks = generateSmartFallback(title, description, 'subtasks', key, developers);
      }

      res.json({ subtasks });
    } catch (error) {
      responseError(res, 500, 'AI Subtasks suggestion failed', error);
    }
  });

  // 8. Nested subtask AI suggestion
  app.post('/api/it-kanban/issues/:key/ai/subtask/:index/improve', async (req, res) => {
    const { key, index } = req.params;
    const { subtaskTitle } = req.body;
    try {
      // Fetch parent issue for full context
      const [parentRows] = await db.query('SELECT title, description FROM it_kanban_issues WHERE issue_key = ?', [key]);
      const parentTitle = parentRows.length > 0 ? parentRows[0].title : '';
      const parentDesc = parentRows.length > 0 ? (parentRows[0].description || '').replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim() : '';

      let improvement = {};
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: `You are a senior tech lead creating a detailed spec sheet for a subtask. You have the parent issue context and the subtask title. Generate a SPECIFIC specification that references the actual technology, components, and implementation details relevant to this subtask.

DO NOT produce generic specs. Every item must be specific to what "${subtaskTitle}" actually involves.

Return a JSON object with these keys:
- 'acceptance_criteria': (HTML string) 3-5 specific criteria using Given/When/Then format referencing actual components/APIs
- 'developer_checklist': (array of strings) 4-6 specific implementation steps a developer must follow
- 'testing_checklist': (array of strings) 3-5 specific test scenarios with expected outcomes
- 'estimated_effort': (string) realistic estimate like '4h' or '12h'
- 'required_skills': (array of strings) specific technologies needed
- 'risk_analysis': (HTML string) what could go wrong specific to this subtask
- 'dependency_mapping': (string) what must be completed before this subtask
- 'implementation_notes': (HTML string) step-by-step technical approach
- 'tags': (array of strings) relevant labels
- 'priority': ('High'|'Medium'|'Low')
- 'story_points': (number 1-13)
- 'sprint': (string)
- 'due_date': (string YYYY-MM-DD, ~1 week from now)

Respond ONLY in valid JSON format.`
            },
            {
              role: "user",
              content: `Parent Issue: ${parentTitle} (${key})\nParent Description: ${parentDesc}\n\nSubtask to Specify: ${subtaskTitle}`
            }
          ],
        });
        improvement = safeParseJSON(response.choices[0].message.content);
      } catch (err) {
        console.warn('AI subtask improve failed, running fallback:', err.message);
        improvement = {
          acceptance_criteria: `
            <ul class="list-disc pl-4 space-y-1">
              <li>Subtask implementation is clean and adheres to guidelines.</li>
              <li>Unit tests verify basic operations without logic error regressions.</li>
              <li>UI flows match mobile/desktop layouts nicely.</li>
            </ul>
          `.trim(),
          developer_checklist: [
            'Setup boilerplate codes and files structures.',
            'Connect state hooks and props parameters.',
            'Refactor logic functions to maintain reusability.'
          ],
          testing_checklist: [
            'Test empty / null states in inputs.',
            'Verify responsive wrapper grids on multiple window dimensions.',
            'Confirm callback dispatch fires accurately.'
          ],
          estimated_effort: '6h',
          required_skills: ['React.js', 'TailwindCSS', 'REST APIs'],
          risk_analysis: '<p class="text-xs text-red-600"><strong>Low Risk:</strong> Verify API formats align exactly with DB indexes to avoid transaction failures.</p>',
          dependency_mapping: 'Requires backend migrations completion.',
          implementation_notes: '<p class="text-xs">Follow standard style system parameters. Keep callbacks lightweight.</p>',
          tags: ['Feature', 'Frontend'],
          priority: 'Medium',
          story_points: 3,
          sprint: 'Sprint 1',
          due_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
        };
      }

      res.json({ improvement });
    } catch (error) {
      responseError(res, 500, 'AI Subtask improve failed', error);
    }
  });

  // 9. Duplicate issue check
  app.post('/api/it-kanban/issues/:key/ai/check-duplicates', async (req, res) => {
    const { key } = req.params;
    const { title } = req.body;
    try {
      const [rows] = await db.query('SELECT issue_key, title, status FROM it_kanban_issues WHERE issue_key != ?', [key]);

      const duplicates = [];
      rows.forEach(row => {
        let matchScore = 0;
        const words1 = title.toLowerCase().split(/\s+/);
        const words2 = row.title.toLowerCase().split(/\s+/);

        const commonWords = words1.filter(w => words2.includes(w) && w.length > 2);
        const ratio = commonWords.length / Math.max(words1.length, words2.length);

        if (ratio > 0.4 || row.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(row.title.toLowerCase())) {
          duplicates.push({
            key: row.issue_key,
            title: row.title,
            status: row.status,
            similarity: Math.round(ratio * 100) || 75
          });
        }
      });

      res.json({ duplicates });
    } catch (error) {
      responseError(res, 500, 'Duplicate check failed', error);
    }
  });

  // 10. Generate Technical Documentation Suite
  app.post('/api/it-kanban/issues/:key/ai/generate-docs', async (req, res) => {
    const { key } = req.params;
    try {
      const [rows] = await db.query('SELECT title, description FROM it_kanban_issues WHERE issue_key = ?', [key]);
      if (rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
      const issue = rows[0];

      let docs = {};
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: "You are an enterprise technical writer. Generate a comprehensive documentation suite in JSON format. The object MUST contain: 'summary' (string HTML), 'implementation_plan' (string HTML), 'qa_checklist' (string HTML), 'deployment_checklist' (string HTML), 'rollback_checklist' (string HTML), 'api_documentation' (string HTML), and 'user_documentation' (string HTML)."
            },
            {
              role: "user",
              content: `Title: ${issue.title}\nDescription: ${issue.description}`
            }
          ],
        });
        docs = safeParseJSON(response.choices[0].message.content);
      } catch (err) {
        console.warn('AI generate-docs failed, running fallback:', err.message);
        docs = generateSmartFallback(issue.title, issue.description || '', 'docs', key);
      }

      res.json(docs);
    } catch (error) {
      responseError(res, 500, 'AI documentation generation failed', error);
    }
  });

  // 11. Refine AI subtask suggestions via inline chat/prompts
  app.post('/api/it-kanban/issues/:key/ai/refine-suggestions', async (req, res) => {
    const { key } = req.params;
    const { prompt, currentSuggestions } = req.body;
    try {
      const [rows] = await db.query('SELECT title, description FROM it_kanban_issues WHERE issue_key = ?', [key]);
      const issue = rows[0] || { title: 'Issue', description: '' };

      // Fetch team users for assignee options
      const [teamUsers] = await db.query('SELECT id, first_name, last_name FROM users');
      const developers = teamUsers.map(u => `${u.first_name} ${u.last_name}`);

      let suggestions = [];
      try {
        if (!hasApiKey()) throw new Error('API key missing');
        const response = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: "You are an expert scrum master. The user wants to adjust, expand, or refine their list of subtask suggestions for a task. Read their prompt, the task title/description, and the current list of suggested subtasks. Return an updated JSON array inside a JSON object with key 'suggestions', incorporating their prompt instructions (e.g. adding missing tasks, changing details, etc.). Each suggestion has: 'title' (string), 'estimated_hours' (number), 'priority' ('High', 'Medium', 'Low'), 'suggested_assignee' (string, selected from provided developers list), 'dependencies' (string), 'labels' (array), 'sprint' (string), and 'complexity' ('High', 'Medium', 'Low'). Respond ONLY in valid JSON format."
            },
            {
              role: "user",
              content: `Task: ${issue.title}\nDescription: ${issue.description || 'None'}\nDevelopers: ${developers.join(', ')}\nCurrent Suggestions:\n${JSON.stringify(currentSuggestions)}\n\nUser Request: ${prompt}`
            }
          ],
        });
        const data = safeParseJSON(response.choices[0].message.content);
        suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      } catch (err) {
        console.warn('AI refine-suggestions failed, using fallback:', err.message);
        const devList = developers.length > 0 ? developers : ['Olivia Taylor', 'Michael Brown', 'Sophia Davis', 'Emma Johnson'];
        // Fallback: append item matching the prompt
        suggestions = [
          ...currentSuggestions,
          {
            title: prompt || 'Refined implementation subtask',
            estimated_hours: 6,
            priority: 'Medium',
            suggested_assignee: devList[Math.floor(Math.random() * devList.length)],
            dependencies: 'None',
            labels: ['AI-Added'],
            sprint: 'Sprint 1',
            complexity: 'Medium'
          }
        ];
      }

      res.json({ suggestions });
    } catch (error) {
      responseError(res, 500, 'AI refine subtasks suggestion failed', error);
    }
  });
};
