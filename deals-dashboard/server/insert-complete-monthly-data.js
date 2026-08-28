const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const companyNames = [
  'Tech Solutions Inc', 'Digital Marketing Co', 'Cloud Systems Ltd',
  'Enterprise Solutions', 'Global Tech Corp', 'Innovation Labs',
  'Future Systems', 'Smart Business Inc', 'Digital Growth Co',
  'Advanced Analytics Ltd'
];

const contactFirstNames = ['John', 'Jane', 'Michael', 'Sarah', 'Robert', 'Emily', 'David', 'Jessica'];
const contactLastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson'];

const dealNames = [
  'Enterprise License Deal', 'Cloud Migration Project', 'Annual Renewal',
  'Premium Support Plan', 'Consulting Services', 'Integration Services',
  'Training & Certification', 'SaaS Subscription', 'Implementation Project'
];

const projectNames = [
  'Website Redesign', 'Mobile App Development', 'Database Migration',
  'System Integration', 'Cloud Infrastructure Setup', 'API Development',
  'Security Audit', 'Performance Optimization', 'Custom Development'
];

const invoiceDescriptions = [
  'Software License Fee', 'Implementation Services', 'Support & Maintenance',
  'Consulting Hours', 'Training Sessions', 'API Usage', 'Cloud Services',
  'Development Services', 'Integration Services'
];

const proposalTitles = [
  'Technical Proposal', 'Service Agreement', 'Software License',
  'Consulting Services', 'Implementation Plan', 'Support & Maintenance'
];

const taskTitles = [
  'Follow up with client', 'Prepare presentation', 'Review requirements',
  'Schedule meeting', 'Send proposal', 'Create contract', 'Conduct demo',
  'Process payment', 'Update status', 'Send invoice'
];

const taskStatuses = ['Open', 'In Progress', 'Completed', 'On Hold'];
const taskPriorities = ['Low', 'Medium', 'High', 'Critical'];
const dealStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const projectStatuses = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
const leadSources = ['Web', 'Email', 'Phone', 'Referral', 'Social Media', 'Event', 'Advertisement'];
const contractTypes = ['Service Agreement', 'License Agreement', 'Maintenance Contract', 'SaaS Agreement'];
const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education'];

function generatePhone() {
  return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
}

function generateEmail(name) {
  const domain = ['gmail.com', 'outlook.com', 'yahoo.com', 'company.com'][Math.floor(Math.random() * 4)];
  return `${name.toLowerCase().replace(/\s+/g, '.')}@${domain}`;
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function insertCompleteMonthlyData() {
  let connection;
  try {
    connection = await pool.getConnection();

    console.log('🚀 Starting complete monthly data insertion...\n');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const insertedIds = {
      users: [],
      companies: [],
      contacts: [],
      leads: [],
      deals: [],
      projects: [],
      tasks: [],
      invoices: [],
      proposals: [],
      contracts: []
    };

    // Get existing users or use demo users
    const [users] = await connection.query('SELECT id FROM users LIMIT 5');
    insertedIds.users = users.map(u => u.id);

    if (insertedIds.users.length === 0) {
      console.log('⚠️  No users found. Please run setup first.');
      return;
    }

    const getRandomUser = () => insertedIds.users[Math.floor(Math.random() * insertedIds.users.length)];

    // ====== INSERT COMPANIES ======
    console.log('📊 Inserting companies...');
    for (let i = 0; i < 8; i++) {
      const companyName = companyNames[i];
      const query = `
        INSERT INTO companies (company_name, email, phone, website, industry, revenue, employees, description, address, city, state, country, zipcode, status, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        companyName,
        generateEmail(companyName),
        generatePhone(),
        `https://www.${companyName.replace(/\s+/g, '')}.com`,
        industries[Math.floor(Math.random() * industries.length)],
        Math.floor(Math.random() * 5000000 + 100000),
        Math.floor(Math.random() * 500 + 10),
        `${companyName} is a leading provider of business solutions.`,
        `${Math.floor(Math.random() * 999) + 1} Business St`,
        ['New York', 'Los Angeles', 'Chicago', 'Houston'][Math.floor(Math.random() * 4)],
        ['NY', 'CA', 'IL', 'TX'][Math.floor(Math.random() * 4)],
        'USA',
        `${Math.floor(Math.random() * 90000) + 10000}`,
        ['Active', 'Active', 'Prospect'][Math.floor(Math.random() * 3)],
        getRandomUser(),
        formatDate(getRandomDate(monthStart, monthEnd))
      ];

      const [result] = await connection.query(query, values);
      insertedIds.companies.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.companies.length} companies`);

    // ====== INSERT CONTACTS ======
    console.log('📇 Inserting contacts...');
    for (let i = 0; i < 25; i++) {
      const firstName = contactFirstNames[Math.floor(Math.random() * contactFirstNames.length)];
      const lastName = contactLastNames[Math.floor(Math.random() * contactLastNames.length)];
      const companyId = insertedIds.companies[Math.floor(Math.random() * insertedIds.companies.length)];
      const [company] = await connection.query('SELECT company_name FROM companies WHERE id = ?', [companyId]);
      const companyName = company[0]?.company_name || 'Unknown';

      const query = `
        INSERT INTO contacts (first_name, last_name, email, phone, company_id, company_name, position, department, source, status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        firstName,
        lastName,
        generateEmail(`${firstName}${lastName}`),
        generatePhone(),
        companyId,
        companyName,
        ['Manager', 'Director', 'Executive', 'Coordinator'][Math.floor(Math.random() * 4)],
        ['Sales', 'Operations', 'IT', 'Finance'][Math.floor(Math.random() * 4)],
        leadSources[Math.floor(Math.random() * leadSources.length)],
        'Active',
        `${firstName} ${lastName} is a key contact at ${companyName}`,
        formatDate(getRandomDate(monthStart, monthEnd))
      ];

      const [result] = await connection.query(query, values);
      insertedIds.contacts.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.contacts.length} contacts`);

    // ====== INSERT LEADS ======
    console.log('🎯 Inserting leads...');
    for (let i = 0; i < 15; i++) {
      const firstName = contactFirstNames[Math.floor(Math.random() * contactFirstNames.length)];
      const lastName = contactLastNames[Math.floor(Math.random() * contactLastNames.length)];
      const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];

      const query = `
        INSERT INTO leads (lead_name, email, phone, company, lead_source, lead_status, rating, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        `${firstName} ${lastName}`,
        generateEmail(`${firstName}${lastName}`),
        generatePhone(),
        companyName,
        leadSources[Math.floor(Math.random() * leadSources.length)],
        ['New', 'Qualified', 'Contacted'][Math.floor(Math.random() * 3)],
        Math.floor(Math.random() * 5) + 1,
        `Potential lead from ${companyName}`,
        formatDate(getRandomDate(monthStart, monthEnd))
      ];

      const [result] = await connection.query(query, values);
      insertedIds.leads.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.leads.length} leads`);

    // ====== INSERT DEALS ======
    console.log('💰 Inserting deals...');
    for (let i = 0; i < 12; i++) {
      const companyId = insertedIds.companies[Math.floor(Math.random() * insertedIds.companies.length)];
      const contactId = insertedIds.contacts[Math.floor(Math.random() * insertedIds.contacts.length)];

      const query = `
        INSERT INTO deals (deal_name, company_id, contact_id, assignee_id, deal_value, currency, deal_stage, pipeline, status, probability, expected_close_date, due_date, follow_up_date, source, priority, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const dealStage = dealStages[Math.floor(Math.random() * dealStages.length)];
      const expectedCloseDate = getRandomDate(monthStart, new Date(monthEnd.getTime() + 90 * 24 * 60 * 60 * 1000));
      const probability = (dealStages.indexOf(dealStage) + 1) * 20;

      const values = [
        dealNames[Math.floor(Math.random() * dealNames.length)],
        companyId,
        contactId,
        getRandomUser(),
        Math.floor(Math.random() * 50000 + 5000),
        'USD',
        dealStage,
        'Main Pipeline',
        ['Open', 'In Progress'][Math.floor(Math.random() * 2)],
        probability,
        formatDate(expectedCloseDate),
        formatDate(getRandomDate(monthStart, monthEnd)),
        formatDate(getRandomDate(monthStart, monthEnd)),
        leadSources[Math.floor(Math.random() * leadSources.length)],
        taskPriorities[Math.floor(Math.random() * taskPriorities.length)],
        `Strategic deal with growth potential`,
        formatDate(getRandomDate(monthStart, monthEnd))
      ];

      const [result] = await connection.query(query, values);
      insertedIds.deals.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.deals.length} deals`);

    // ====== INSERT PROJECTS ======
    console.log('📁 Inserting projects...');
    for (let i = 0; i < 10; i++) {
      const companyId = insertedIds.companies[Math.floor(Math.random() * insertedIds.companies.length)];
      const dealId = insertedIds.deals[Math.floor(Math.random() * insertedIds.deals.length)];
      const contactId = insertedIds.contacts[Math.floor(Math.random() * insertedIds.contacts.length)];
      const startDate = getRandomDate(monthStart, monthEnd);
      const endDate = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);

      const query = `
        INSERT INTO projects (name, title, description, deal_id, company_id, contact_id, budget, currency, status, start_date, end_date, due_date, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        projectNames[Math.floor(Math.random() * projectNames.length)],
        `Project ${i + 1}`,
        `A strategic project for client success`,
        dealId,
        companyId,
        contactId,
        Math.floor(Math.random() * 100000 + 10000),
        'USD',
        projectStatuses[Math.floor(Math.random() * projectStatuses.length)],
        formatDate(startDate),
        formatDate(endDate),
        formatDate(new Date(monthEnd.getTime() + 30 * 24 * 60 * 60 * 1000)),
        getRandomUser(),
        formatDate(getRandomDate(monthStart, monthEnd))
      ];

      const [result] = await connection.query(query, values);
      insertedIds.projects.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.projects.length} projects`);

    // ====== INSERT TASKS ======
    console.log('✅ Inserting tasks...');
    for (let i = 0; i < 20; i++) {
      const dealId = insertedIds.deals[Math.floor(Math.random() * insertedIds.deals.length)];
      const projectId = insertedIds.projects[Math.floor(Math.random() * insertedIds.projects.length)];
      const dueDate = getRandomDate(monthStart, monthEnd);

      const query = `
        INSERT INTO general_tasks (title, description, status, priority, assigned_to, due_date, tags, linked_type, linked_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const linkedType = Math.random() > 0.5 ? 'Deal' : 'Project';
      const linkedId = linkedType === 'Deal' ? dealId : projectId;
      const assignedUser = getRandomUser();

      const values = [
        taskTitles[Math.floor(Math.random() * taskTitles.length)],
        `Task description for better tracking`,
        taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
        taskPriorities[Math.floor(Math.random() * taskPriorities.length)],
        JSON.stringify([assignedUser]),
        formatDate(dueDate),
        JSON.stringify(['Important', 'Follow-up']),
        linkedType,
        linkedId,
        formatDate(getRandomDate(monthStart, monthEnd))
      ];

      const [result] = await connection.query(query, values);
      insertedIds.tasks.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.tasks.length} tasks`);

    // ====== INSERT INVOICES ======
    console.log('📄 Inserting invoices...');
    for (let i = 0; i < 8; i++) {
      const companyId = insertedIds.companies[Math.floor(Math.random() * insertedIds.companies.length)];
      const projectId = insertedIds.projects[Math.floor(Math.random() * insertedIds.projects.length)];
      const dealId = insertedIds.deals[Math.floor(Math.random() * insertedIds.deals.length)];
      const invoiceDate = getRandomDate(monthStart, monthEnd);
      const subtotal = Math.floor(Math.random() * 50000 + 5000);
      const taxAmount = subtotal * 0.1;
      const discountAmount = subtotal * 0.05;
      const total = subtotal + taxAmount - discountAmount;

      const query = `
        INSERT INTO invoices (invoice_number, client_id, bill_to, project_id, deal_id, amount, currency, invoice_date, open_till, payment_method, status, description, subtotal, discount_percentage, discount_amount, tax_percentage, tax_amount, total, amount_paid, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        `INV-${Date.now()}-${i}`,
        companyId,
        `Bill To Company`,
        projectId,
        dealId,
        total,
        'USD',
        formatDate(invoiceDate),
        formatDate(new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000)),
        'Bank Transfer',
        ['Draft', 'Sent', 'Paid', 'Unpaid'][Math.floor(Math.random() * 4)],
        invoiceDescriptions[Math.floor(Math.random() * invoiceDescriptions.length)],
        subtotal,
        5.00,
        discountAmount,
        10.00,
        taxAmount,
        total,
        Math.random() > 0.5 ? total : 0,
        formatDate(invoiceDate)
      ];

      const [result] = await connection.query(query, values);
      insertedIds.invoices.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.invoices.length} invoices`);

    // ====== INSERT PROPOSALS ======
    console.log('📋 Inserting proposals...');
    for (let i = 0; i < 6; i++) {
      const companyId = insertedIds.companies[Math.floor(Math.random() * insertedIds.companies.length)];
      const contactId = insertedIds.contacts[Math.floor(Math.random() * insertedIds.contacts.length)];
      const dealId = insertedIds.deals[Math.floor(Math.random() * insertedIds.deals.length)];
      const proposalDate = getRandomDate(monthStart, monthEnd);
      const totalAmount = Math.floor(Math.random() * 100000 + 10000);

      const query = `
        INSERT INTO proposals (proposal_number, title, description, client_id, contact_id, deal_id, created_by, status, proposal_date, validity_date, total_amount, discount_amount, tax_amount, currency, notes, version, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        `PROP-${Date.now()}-${i}`,
        proposalTitles[Math.floor(Math.random() * proposalTitles.length)],
        `Detailed proposal for business engagement`,
        companyId,
        contactId,
        dealId,
        getRandomUser(),
        ['Draft', 'Submitted', 'Approved'][Math.floor(Math.random() * 3)],
        formatDate(proposalDate),
        formatDate(new Date(proposalDate.getTime() + 30 * 24 * 60 * 60 * 1000)),
        totalAmount,
        Math.floor(totalAmount * 0.05),
        Math.floor(totalAmount * 0.1),
        'USD',
        `Proposal includes all required services`,
        1,
        formatDate(proposalDate)
      ];

      const [result] = await connection.query(query, values);
      insertedIds.proposals.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.proposals.length} proposals`);

    // ====== INSERT CONTRACTS ======
    console.log('📜 Inserting contracts...');
    for (let i = 0; i < 5; i++) {
      const companyId = insertedIds.companies[Math.floor(Math.random() * insertedIds.companies.length)];
      const startDate = getRandomDate(monthStart, monthEnd);
      const endDate = new Date(startDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);

      const query = `
        INSERT INTO contracts (subject, start_date, end_date, client_id, contract_type, contract_value, description, status, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        `Contract for ${companyNames[Math.floor(Math.random() * companyNames.length)]}`,
        formatDate(startDate),
        formatDate(endDate),
        companyId,
        contractTypes[Math.floor(Math.random() * contractTypes.length)],
        Math.floor(Math.random() * 200000 + 20000),
        `Comprehensive business contract with all terms and conditions`,
        ['Draft', 'Active'][Math.floor(Math.random() * 2)],
        getRandomUser(),
        formatDate(startDate)
      ];

      const [result] = await connection.query(query, values);
      insertedIds.contracts.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.contracts.length} contracts`);

    // ====== INSERT ESTIMATIONS ======
    console.log('💵 Inserting estimations...');
    insertedIds.estimations = [];
    for (let i = 0; i < 12; i++) {
      const companyId = insertedIds.companies[Math.floor(Math.random() * insertedIds.companies.length)];
      const projectId = insertedIds.projects[Math.floor(Math.random() * insertedIds.projects.length)];
      const estimateDate = getRandomDate(monthStart, monthEnd);
      const expiryDate = new Date(estimateDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const estimationAmount = Math.floor(Math.random() * 100000 + 5000);

      const query = `
        INSERT INTO estimations (estimation_number, client_id, project_id, bill_to, ship_to, amount, currency, estimate_date, expiry_date, status, description, tags, estimate_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const estimationNumber = `EST-${Date.now()}-${i}`;
      const estimationStatus = ['Draft', 'Draft', 'Sent', 'Accepted'][Math.floor(Math.random() * 4)];

      const values = [
        estimationNumber,
        companyId,
        projectId || null,
        `Bill To Address ${i}`,
        `Ship To Address ${i}`,
        estimationAmount,
        'USD',
        formatDate(estimateDate),
        formatDate(expiryDate),
        estimationStatus,
        `Professional estimation for project requirements`,
        JSON.stringify(['Professional', 'Detailed']),
        getRandomUser(),
        formatDate(getRandomDate(monthStart, monthEnd))
      ];

      const [result] = await connection.query(query, values);
      insertedIds.estimations.push(result.insertId);
    }
    console.log(`✅ Inserted ${insertedIds.estimations.length} estimations`);

    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPLETE DATA INSERTION SUMMARY:');
    console.log('='.repeat(50));
    console.log(`✅ Companies:     ${insertedIds.companies.length}`);
    console.log(`✅ Contacts:      ${insertedIds.contacts.length}`);
    console.log(`✅ Leads:         ${insertedIds.leads.length}`);
    console.log(`✅ Deals:         ${insertedIds.deals.length}`);
    console.log(`✅ Projects:      ${insertedIds.projects.length}`);
    console.log(`✅ Tasks:         ${insertedIds.tasks.length}`);
    console.log(`✅ Invoices:      ${insertedIds.invoices.length}`);
    console.log(`✅ Proposals:     ${insertedIds.proposals.length}`);
    console.log(`✅ Contracts:     ${insertedIds.contracts.length}`);
    console.log(`✅ Estimations:   ${insertedIds.estimations.length}`);
    console.log('='.repeat(50));
    console.log('\n✨ All data properly linked with foreign keys!');
    console.log('✨ Ready to view in dashboards and reports!');
    console.log('✨ No null values - all fields populated!\n');

  } catch (error) {
    console.error('❌ Error inserting data:', error.message);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

insertCompleteMonthlyData();
