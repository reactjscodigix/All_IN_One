const pool = require('./config/database');

async function check() {
  try {
    console.log('--- Checking SP TECHPIONEER PVT.LTD. (Company ID: 1) ---');
    
    const [company] = await pool.query('SELECT * FROM companies WHERE id = 1');
    console.log('Company:', company);

    const [deals] = await pool.query(`
      SELECT d.id, d.deal_name, d.status, d.service_category_id, sc.name as service_name, dept.name as dept_name 
      FROM deals d 
      LEFT JOIN service_categories sc ON d.service_category_id = sc.id 
      LEFT JOIN departments dept ON sc.suggested_department_id = dept.id 
      WHERE d.company_id = 1
    `);
    console.log('Deals:', deals);

    const [leads] = await pool.query(`
      SELECT l.id, l.lead_name, l.lead_status, l.service_category_id, sc.name as service_name, dept.name as dept_name 
      FROM leads l 
      LEFT JOIN service_categories sc ON l.service_category_id = sc.id 
      LEFT JOIN departments dept ON sc.suggested_department_id = dept.id 
      WHERE l.company_id = 1
    `);
    console.log('Leads:', leads);

    const [depts] = await pool.query('SELECT * FROM departments');
    console.log('Departments:', depts);

    // Run the actual query used in the API
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
    const [results] = await pool.query(query);
    console.log('--- Final Query Results ---');
    console.log(results);

  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
