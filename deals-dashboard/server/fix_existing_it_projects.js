const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'all_in_one_user',
    password: 'C0digix$309',
    database: 'deals_db'
  });

  try {
    const [projects] = await connection.query('SELECT p.id, p.deal_id, p.department_id, p.workflow_type FROM projects p WHERE p.deal_id IS NOT NULL');
    
    for (const project of projects) {
      if (!project.department_id || project.workflow_type === 'Standard') {
        const [deals] = await connection.query('SELECT service_category_id FROM deals WHERE id = ?', [project.deal_id]);
        if (deals.length > 0 && deals[0].service_category_id) {
          const [categories] = await connection.query('SELECT suggested_department_id FROM service_categories WHERE id = ?', [deals[0].service_category_id]);
          if (categories.length > 0 && categories[0].suggested_department_id) {
            const deptId = categories[0].suggested_department_id;
            
            const [depts] = await connection.query('SELECT name FROM departments WHERE id = ?', [deptId]);
            let workflowType = project.workflow_type;
            if (depts.length > 0) {
              if (depts[0].name.includes('IT')) workflowType = 'IT';
              if (depts[0].name.includes('Marketing')) workflowType = 'Marketing';
            }

            await connection.query('UPDATE projects SET department_id = ?, workflow_type = ? WHERE id = ?', [deptId, workflowType, project.id]);
            console.log(`Updated project ${project.id} with dept ${deptId} and workflow ${workflowType}`);
          }
        }
      }
    }
    console.log('Done fixing existing projects.');
  } catch (err) {
    console.error(err);
  } finally {
    connection.end();
  }
}

main().catch(console.error);
