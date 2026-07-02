const mysql = require('mysql2');
require('dotenv').config({ path: '.env' });

async function test() {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  const db = connection.promise();

  console.log('--- Departments ---');
  const [depts] = await db.query('SELECT * FROM departments');
  console.table(depts);

  console.log('\n--- Service Categories ---');
  const [cats] = await db.query('SELECT sc.*, d.name as dept_name FROM service_categories sc LEFT JOIN departments d ON sc.suggested_department_id = d.id');
  console.table(cats);

  console.log('\n--- Companies ---');
  const [companies] = await db.query('SELECT id, company_name, status FROM companies');
  console.table(companies);

  console.log('\n--- Won Deals/Leads ---');
  const [deals] = await db.query(`
    SELECT d.id, d.company_id, d.status, sc.name as category, dept.name as dept_name
    FROM deals d
    LEFT JOIN service_categories sc ON d.service_category_id = sc.id
    LEFT JOIN departments dept ON sc.suggested_department_id = dept.id
    WHERE d.status = 'Won'
  `);
  console.table(deals);

  const [leads] = await db.query(`
    SELECT l.id, l.company_id, l.lead_status, sc.name as category, dept.name as dept_name
    FROM leads l
    LEFT JOIN service_categories sc ON l.service_category_id = sc.id
    LEFT JOIN departments dept ON sc.suggested_department_id = dept.id
    WHERE l.lead_status = 'Won'
  `);
  console.table(leads);

  const [projects] = await db.query('SELECT * FROM projects');
  console.log('\n--- Projects ---');
  console.table(projects);

  console.log('\n--- Department Names (HEX) ---');
  const [deptHex] = await db.query('SELECT name, HEX(name) as hex_name FROM departments');
  console.table(deptHex);

  console.log('\n--- Deals Table ---');
  const [dealsTable] = await db.query('SELECT id, company_id, status, service_category_id FROM deals');
  console.table(dealsTable);

  console.log('\n--- All Won Deals (Detailed) ---');
  const [allWonDeals] = await db.query(`
    SELECT d.id, d.company_id, d.status, d.service_category_id, sc.name as category, sc.suggested_department_id, dept.name as dept_name
    FROM deals d
    LEFT JOIN service_categories sc ON d.service_category_id = sc.id
    LEFT JOIN departments dept ON sc.suggested_department_id = dept.id
    WHERE d.status = 'Won'
  `);
  console.table(allWonDeals);

  await db.end();
}

test().catch(console.error);
