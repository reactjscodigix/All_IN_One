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
      'Deal Manager': {
        Deals: ['view', 'create', 'edit', 'delete'],
        Leads: ['view', 'create', 'edit'],
        Pipeline: ['view', 'create', 'edit'],
      },
      'Project Manager': {
        Projects: ['view', 'create', 'edit', 'delete'],
        Tasks: ['view', 'create', 'edit', 'delete'],
      },
      'Employee': {
        Deals: ['view', 'edit'],
        Tasks: ['view', 'edit'],
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
