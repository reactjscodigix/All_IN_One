const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deals_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function linkProjectsToCompanies() {
  let connection;
  try {
    connection = await pool.getConnection();

    console.log('Fetching projects and companies...');
    const [projects] = await connection.query('SELECT id, name, company_id FROM projects');
    const [companies] = await connection.query('SELECT id, company_name FROM companies');

    console.log(`Found ${projects.length} projects and ${companies.length} companies\n`);

    if (companies.length === 0) {
      console.log('No companies found. Skipping linking.');
      return;
    }

    let updated = 0;
    
    for (const project of projects) {
      if (project.company_id) {
        console.log(`✓ Project "${project.name}" already linked to company_id: ${project.company_id}`);
        continue;
      }

      const company = companies[updated % companies.length];
      
      await connection.query(
        'UPDATE projects SET company_id = ? WHERE id = ?',
        [company.id, project.id]
      );
      
      console.log(`✓ Linked project "${project.name}" to company "${company.company_name}"`);
      updated++;
    }

    console.log(`\n✓ Successfully linked ${updated} projects to companies`);

    const [linkedProjects] = await connection.query(
      'SELECT p.id, p.name, c.company_name FROM projects p LEFT JOIN companies c ON p.company_id = c.id LIMIT 5'
    );
    console.log('\nSample of linked projects:');
    console.log(linkedProjects);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

linkProjectsToCompanies();
