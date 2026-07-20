const fs = require('fs');
const path = require('path');

const loginPagePath = path.join(__dirname, 'client/src/components/LoginPage.js');

try {
  let content = fs.readFileSync(loginPagePath, 'utf8');
  
  const oldDemoUsers = `  const DEMO_USERS = [
    { email: 'admin@example.com', password: 'admin123', role: 'Admin' },
    { email: 'owner@example.com', password: 'owner123', role: 'Company Owner' },
    { email: 'deal@example.com', password: 'deal123', role: 'Deal Owner' },
    { email: 'pm@example.com', password: 'pm123', role: 'Project Manager' },
    { email: 'client@example.com', password: 'client123', role: 'Client' },
    { email: 'lead@example.com', password: 'lead123', role: 'Lead' },
  ];`;

  const newDemoUsers = `  const DEMO_USERS = [
    { email: 'admin@example.com', password: 'admin123', role: 'Admin' },
    { email: 'owner@example.com', password: 'owner123', role: 'Company Owner' },
    { email: 'deal@example.com', password: 'deal123', role: 'Deal Owner' },
    { email: 'pm@example.com', password: 'pm123', role: 'Project Manager' },
    { email: 'client@example.com', password: 'client123', role: 'Client' },
    { email: 'lead@example.com', password: 'lead123', role: 'Lead' },
    { email: 'employee@example.com', password: 'employee123', role: 'Employee' },
  ];`;

  if (content.includes(oldDemoUsers)) {
    content = content.replace(oldDemoUsers, newDemoUsers);
    fs.writeFileSync(loginPagePath, content, 'utf8');
    console.log('✅ LoginPage updated successfully!');
    console.log('   Added Employee demo user: employee@example.com / employee123');
  } else if (content.includes('{ email: \'employee@example.com\'')) {
    console.log('✅ LoginPage already has Employee demo user');
  } else {
    console.log('❌ Could not find DEMO_USERS in LoginPage.js');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
