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

const taskTitles = [
  'Prepare quarterly report',
  'Follow up with client',
  'Review project timeline',
  'Prepare budget analysis',
  'Schedule team meeting',
  'Update contact information',
  'Process payment',
  'Create proposal',
  'Finalize deal terms',
  'Review contract',
  'Prepare marketing materials',
  'Conduct research',
  'Update pipeline status',
  'Send invoice',
  'Schedule call',
];

const taskStatuses = ['Open', 'In Progress', 'Completed', 'On Hold'];
const taskPriorities = ['Low', 'Medium', 'High', 'Critical'];

const generateDate = (year, month, day) => {
  return new Date(year, month, day).toISOString().split('T')[0];
};

async function insertFullMonthData() {
  let connection;
  try {
    connection = await pool.getConnection();

    console.log('Inserting full month data for 2025...');

    const year = 2025;
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = generateDate(year, month, day);
        const tasksPerDay = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < tasksPerDay; i++) {
          const title = taskTitles[Math.floor(Math.random() * taskTitles.length)];
          const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
          const priority = taskPriorities[Math.floor(Math.random() * taskPriorities.length)];
          
          const query = `
            INSERT INTO general_tasks (title, description, status, priority, assigned_to, due_date, tags, linked_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            `${title} - ${dateStr}`,
            `Task created on ${dateStr}`,
            status,
            priority,
            JSON.stringify([1]),
            dateStr,
            JSON.stringify(['Monthly', 'Urgent']),
            'General',
            new Date(dateStr),
            new Date(dateStr)
          ];

          await connection.query(query, values);
        }
      }

      console.log(`✓ Inserted data for month ${month + 1}/12`);
    }

    console.log('\n✅ Full month data insertion completed!');
    console.log('Total tasks inserted: Ready for analysis');

  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

insertFullMonthData();
