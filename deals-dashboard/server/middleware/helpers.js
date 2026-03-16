const crypto = require('crypto');
const pool = require('../config/database');

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
}

async function checkPermission(userId, module, action) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT role_id FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      connection.release();
      return false;
    }
    
    const roleId = users[0].role_id;
    const [roles] = await connection.query(
      'SELECT name FROM roles WHERE id = ?',
      [roleId]
    );
    
    connection.release();
    
    if (roles.length === 0) {
      return false;
    }
    
    const role = roles[0].name;
    const ROLE_PERMISSIONS = {
      'Super Admin': { canAll: true },
      'Admin': { canAll: true, except: ['settings'] },
      'Leads Manager': {
        Leads: ['view', 'create', 'edit', 'delete', 'distribute', 'monitor'],
        Activities: ['view', 'create', 'edit'],
      },
      'Deals Manager': {
        Deals: ['view', 'create', 'edit', 'delete', 'approve_discount', 'allocate'],
        Pipeline: ['view', 'create', 'edit'],
        Documents: ['view', 'create', 'edit'],
      },
      'Sales Manager': {
        Leads: ['view', 'create', 'edit'],
        Deals: ['view', 'create', 'edit'],
        Quotations: ['view', 'create', 'edit', 'approve'],
        Targets: ['view', 'assign'],
        Commissions: ['view', 'approve'],
        Reports: ['view'],
      },
      'Marketing Manager': {
        Marketing: ['view', 'create', 'edit', 'delete', 'approve'],
        Campaigns: ['view', 'create', 'edit', 'delete'],
        Projects: ['view', 'create', 'edit'],
        Resources: ['allocate'],
        Budget: ['view', 'manage'],
      },
      'IT Manager': {
        IT: ['view', 'create', 'edit', 'delete', 'approve_deployment'],
        Projects: ['view', 'create', 'edit'],
        Sprints: ['view', 'create', 'edit', 'plan'],
        Bugs: ['view', 'create', 'edit', 'analyze'],
        DevOps: ['monitor'],
      },
      'Accounting Manager': {
        Invoices: ['view', 'create', 'edit', 'delete', 'approve'],
        Payments: ['view', 'create', 'edit', 'track'],
        Expenses: ['view', 'approve'],
        Commissions: ['view', 'approve'],
        Reports: ['view', 'finance'],
      },
      'Sales Executive': {
        Leads: ['view', 'create', 'edit'],
        Deals: ['view', 'create', 'edit'],
        Quotations: ['view', 'create'],
        Tasks: ['view', 'edit'],
      },
      'Marketing Executive': {
        Marketing: ['view', 'edit'],
        Projects: ['view', 'edit'],
        SEO: ['view', 'edit'],
        Creative: ['request', 'upload'],
      },
      'IT Specialist': {
        IT: ['view', 'edit'],
        Projects: ['view', 'edit'],
        Sprints: ['view'],
        Bugs: ['view', 'create', 'edit'],
        Deployment: ['request'],
      },
      'Accountant': {
        Invoices: ['view', 'create', 'edit'],
        Payments: ['view', 'create'],
        Expenses: ['view', 'create'],
      },
      'Employee': {
        Tasks: ['view', 'edit'],
        Projects: ['view'],
        Deals: ['view', 'edit'],
      }
    };
    
    const rolePerms = ROLE_PERMISSIONS[role];
    if (!rolePerms) return false;
    
    if (rolePerms.canAll) {
      return !rolePerms.except || !rolePerms.except.includes(module);
    }
    
    const modulePerms = rolePerms[module];
    return modulePerms && modulePerms.includes(action);
  } catch (error) {
    console.error('Error checking permission:', error.message);
    if (connection) connection.release();
    return false;
  }
}

module.exports = { hashPassword, checkPermission };
