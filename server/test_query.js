const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function test() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const query = `
    SELECT DISTINCT
      c.id, c.company_name, c.email, c.phone,
      (SELECT p.id FROM projects p WHERE p.company_id = c.id LIMIT 1) as project_id
    FROM companies c
    LEFT JOIN deals d ON d.company_id = c.id
    LEFT JOIN leads l ON l.company_id = c.id
    LEFT JOIN service_categories sc_d ON d.service_category_id = sc_d.id
    LEFT JOIN service_categories sc_l ON l.service_category_id = sc_l.id
    LEFT JOIN departments dept_d ON sc_d.suggested_department_id = dept_d.id
    LEFT JOIN departments dept_l ON sc_l.suggested_department_id = dept_l.id
    WHERE c.status = 'Active' 
    AND (
      (d.status = 'Won' AND dept_d.name = 'IT Department')
      OR 
      (l.lead_status = 'Won' AND dept_l.name = 'IT Department')
    )
    ORDER BY c.company_name ASC
  `;

  const [rows] = await db.query(query);
  console.log('Results:', rows);

  await db.end();
}

test().catch(console.error);
