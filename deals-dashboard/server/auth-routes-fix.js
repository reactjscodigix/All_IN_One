// ============================================
// FIXED AUTH ROUTES - FIX FOR JSON PARSE ERROR
// ============================================
// Replace the existing auth routes in server.js with these

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get database connection
    connection = await pool.getConnection();

    // Query user with role
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.password,
        u.avatar,
        r.name as role_name
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ?
    `;

    const [rows] = await connection.query(query, [email]);
    connection.release();

    // Check if user exists
    if (!rows || rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        success: false 
      });
    }

    const user = rows[0];

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        success: false 
      });
    }

    // Return user data
    return res.status(200).json({
      success: true,
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar: user.avatar || null,
      role_name: user.role_name || 'Lead'
    });

  } catch (error) {
    console.error('Login Route Error:', {
      message: error.message,
      stack: error.stack
    });

    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e.message);
      }
    }

    return res.status(500).json({ 
      error: 'Server error during login',
      details: error.message,
      success: false
    });
  }
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  let connection;
  try {
    const { first_name, last_name, email, password, role_name, phone, company } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ 
        error: 'First name, last name, email, and password are required',
        success: false 
      });
    }

    // Validate email format
    if (!email.includes('@')) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        success: false 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters',
        success: false 
      });
    }

    // Get database connection
    connection = await pool.getConnection();

    // Check if email already exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing && existing.length > 0) {
      connection.release();
      return res.status(409).json({ 
        error: 'Email already registered',
        success: false 
      });
    }

    // Map role name to role ID
    const roleMap = {
      'Admin': 1,
      'Company Owner': 2,
      'Deal Owner': 3,
      'Project Manager': 4,
      'Client': 5,
      'Lead': 6
    };

    const roleId = roleMap[role_name] || 6; // Default to Lead
    const username = email.split('@')[0]; // Use email prefix as username

    // Insert new user
    const insertQuery = `
      INSERT INTO users 
      (first_name, last_name, username, email, password, role_id, phone1, location, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', NOW())
    `;

    await connection.query(
      insertQuery,
      [first_name, last_name, username, email, password, roleId, phone || null, company || null]
    );

    // Fetch the created user
    const [newUser] = await connection.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar,
        r.name as role_name
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? LIMIT 1`,
      [email]
    );

    connection.release();

    if (!newUser || newUser.length === 0) {
      return res.status(500).json({ 
        error: 'Failed to create user',
        success: false 
      });
    }

    const user = newUser[0];

    // Return created user
    return res.status(201).json({
      success: true,
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar: user.avatar || null,
      role_name: user.role_name || role_name || 'Lead'
    });

  } catch (error) {
    console.error('Signup Route Error:', {
      message: error.message,
      stack: error.stack
    });

    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e.message);
      }
    }

    return res.status(500).json({ 
      error: 'Server error during signup',
      details: error.message,
      success: false
    });
  }
});

// ============================================
// HOW TO USE THIS FILE:
// ============================================
// 1. Find the existing auth routes in server.js (around line 590)
// 2. Delete the old /api/auth/login and /api/auth/signup routes
// 3. Paste these routes in their place
// 4. The routes will now return proper JSON with 'success' field
// 5. Restart the server
