const pool = require('../config/database');

async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        email_opt_out BOOLEAN DEFAULT FALSE,
        password VARCHAR(255) NOT NULL,
        phone1 VARCHAR(20),
        phone1_country VARCHAR(5) DEFAULT 'US',
        phone2 VARCHAR(20),
        phone2_country VARCHAR(5) DEFAULT 'US',
        location VARCHAR(100),
        avatar LONGTEXT,
        role_id INT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_status (status),
        INDEX idx_role_id (role_id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        module_name VARCHAR(100) NOT NULL,
        can_create BOOLEAN DEFAULT FALSE,
        can_read BOOLEAN DEFAULT FALSE,
        can_update BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_module_per_role (role_id, module_name),
        INDEX idx_role_id (role_id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS delete_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS general_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        status ENUM('Open', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Open',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        assigned_to JSON,
        due_date DATE,
        tags JSON,
        linked_type ENUM('General', 'Deal', 'Project') DEFAULT 'General',
        linked_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_due_date (due_date),
        INDEX idx_linked_type (linked_type),
        INDEX idx_linked_id (linked_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        client_id INT NOT NULL,
        contact_id INT,
        deal_id INT,
        created_by INT,
        status ENUM('Draft', 'Submitted', 'Approved', 'Rejected', 'Sent', 'Accepted', 'Declined') DEFAULT 'Draft',
        proposal_date DATE,
        validity_date DATE,
        total_amount DECIMAL(15, 2),
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        terms_conditions LONGTEXT,
        notes LONGTEXT,
        version INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_proposal_number (proposal_number),
        INDEX idx_client_id (client_id),
        INDEX idx_deal_id (deal_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proposal_line_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        description LONGTEXT,
        quantity DECIMAL(10, 2) NOT NULL,
        rate DECIMAL(15, 2) NOT NULL,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        tax_percent DECIMAL(5, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        subtotal DECIMAL(15, 2),
        total DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_proposal_id (proposal_id),
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proposal_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        action_by INT,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        comments LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_proposal_id (proposal_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proposal_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        file_size INT,
        file_data LONGBLOB,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_proposal_id (proposal_id),
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(20),
        website VARCHAR(255),
        industry VARCHAR(100),
        revenue DECIMAL(15, 2),
        employees INT,
        description LONGTEXT,
        logo LONGTEXT,
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zipcode VARCHAR(20),
        status ENUM('Active', 'Inactive', 'Prospect') DEFAULT 'Active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company_name (company_name),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        description LONGTEXT,
        price DECIMAL(15, 2) NOT NULL,
        subscribers_count INT DEFAULT 0,
        status ENUM('Active', 'Inactive', 'Archived') DEFAULT 'Active',
        features JSON,
        billing_cycle VARCHAR(50),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_status (status),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        client_id INT NOT NULL,
        contract_type VARCHAR(100) NOT NULL,
        contract_value DECIMAL(15, 2) NOT NULL,
        description LONGTEXT,
        status ENUM('Draft', 'Active', 'Completed', 'Terminated') DEFAULT 'Draft',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_client_id (client_id),
        INDEX idx_start_date (start_date),
        INDEX idx_end_date (end_date),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (client_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(20),
        company_id INT,
        company_name VARCHAR(255),
        position VARCHAR(100),
        department VARCHAR(100),
        source VARCHAR(100),
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        avatar LONGTEXT,
        notes LONGTEXT,
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        tag VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_first_name (first_name),
        INDEX idx_email (email),
        INDEX idx_company_id (company_id),
        INDEX idx_status (status),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_name VARCHAR(255) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(20),
        company VARCHAR(255),
        lead_source VARCHAR(100),
        lead_status ENUM('New', 'Qualified', 'Contacted', 'Unqualified') DEFAULT 'New',
        rating INT DEFAULT 5,
        notes LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lead_name (lead_name),
        INDEX idx_email (email),
        INDEX idx_lead_status (lead_status),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deal_name VARCHAR(255) NOT NULL,
        company_id INT NOT NULL,
        contact_id INT,
        assignee_id INT,
        deal_value DECIMAL(15, 2),
        currency VARCHAR(10) DEFAULT 'USD',
        deal_stage VARCHAR(100),
        pipeline VARCHAR(100),
        status VARCHAR(100),
        probability INT,
        expected_close_date DATE,
        due_date DATE,
        follow_up_date DATE,
        source VARCHAR(100),
        priority VARCHAR(50) DEFAULT 'Medium',
        period VARCHAR(100),
        period_value INT,
        tags VARCHAR(500),
        description LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company_id (company_id),
        INDEX idx_deal_stage (deal_stage),
        INDEX idx_status (status),
        INDEX idx_expected_close_date (expected_close_date),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        description LONGTEXT,
        deal_id INT,
        company_id INT,
        contact_id INT,
        budget DECIMAL(15, 2),
        currency VARCHAR(10) DEFAULT 'USD',
        status ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Active') DEFAULT 'Planning',
        start_date DATE,
        end_date DATE,
        due_date DATE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_status (status),
        INDEX idx_deal_id (deal_id),
        INDEX idx_company_id (company_id),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        client_id INT NOT NULL,
        bill_to VARCHAR(255),
        ship_to VARCHAR(255),
        project_id INT,
        deal_id INT,
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        invoice_date DATE,
        open_till DATE,
        payment_method VARCHAR(100),
        status ENUM('Draft', 'Sent', 'Paid', 'Unpaid', 'Overdue', 'Partially Paid') DEFAULT 'Draft',
        description LONGTEXT,
        subtotal DECIMAL(15, 2) DEFAULT 0,
        discount_percentage DECIMAL(5, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        extra_discount_percentage DECIMAL(5, 2) DEFAULT 0,
        extra_discount_amount DECIMAL(15, 2) DEFAULT 0,
        tax_percentage DECIMAL(5, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        total DECIMAL(15, 2),
        notes LONGTEXT,
        terms_conditions LONGTEXT,
        amount_paid DECIMAL(15, 2) DEFAULT 0,
        payment_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_client_id (client_id),
        INDEX idx_invoice_number (invoice_number),
        INDEX idx_status (status),
        INDEX idx_invoice_date (invoice_date),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (client_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        description LONGTEXT,
        quantity DECIMAL(10, 2) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        discount_percentage DECIMAL(5, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        tax_percentage DECIMAL(5, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        amount DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_invoice_id (invoice_id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS estimations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estimation_number VARCHAR(50) UNIQUE NOT NULL,
        client_id INT NOT NULL,
        contact_id INT,
        project_id INT,
        bill_to VARCHAR(255),
        ship_to VARCHAR(255),
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        estimate_date DATE,
        expiry_date DATE,
        status ENUM('Draft', 'Sent', 'Accepted', 'Declined') DEFAULT 'Draft',
        description LONGTEXT,
        tags JSON,
        estimate_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_client_id (client_id),
        INDEX idx_estimation_number (estimation_number),
        INDEX idx_status (status),
        INDEX idx_estimate_date (estimate_date),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (client_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (estimate_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS pipeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description LONGTEXT,
        position INT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_position (position)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description LONGTEXT,
        status ENUM('Draft', 'Active', 'Paused', 'Completed', 'Cancelled') DEFAULT 'Draft',
        start_date DATE,
        end_date DATE,
        budget DECIMAL(15, 2),
        currency VARCHAR(10) DEFAULT 'USD',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_status (status)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message_text LONGTEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sender_id (sender_id),
        INDEX idx_receiver_id (receiver_id),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read),
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS call_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        caller_name VARCHAR(255) NOT NULL,
        caller_email VARCHAR(150),
        caller_avatar LONGTEXT,
        phone_number VARCHAR(20),
        call_type ENUM('Audio Call', 'Video Call') DEFAULT 'Audio Call',
        call_direction ENUM('Incoming', 'Outgoing', 'Missed Call') DEFAULT 'Outgoing',
        duration INT DEFAULT 0,
        started_at TIMESTAMP NULL,
        ended_at TIMESTAMP NULL,
        meeting_link VARCHAR(255),
        notes LONGTEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_caller (caller_name),
        INDEX idx_call_type (call_type),
        INDEX idx_direction (call_direction),
        INDEX idx_created_at (created_at)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
        category VARCHAR(100),
        tag VARCHAR(100),
        is_important BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_priority (priority),
        INDEX idx_tag (tag),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS file_folders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        parent_id INT,
        storage_type ENUM('Internal', 'Dropbox', 'Google Drive', 'Cloud Storage') DEFAULT 'Internal',
        path VARCHAR(500),
        size_bytes BIGINT DEFAULT 0,
        file_count INT DEFAULT 0,
        is_shared BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES file_folders(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_parent_id (parent_id),
        INDEX idx_storage_type (storage_type),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        folder_id INT,
        name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50),
        size_bytes BIGINT NOT NULL,
        storage_type ENUM('Internal', 'Dropbox', 'Google Drive', 'Cloud Storage') DEFAULT 'Internal',
        file_path VARCHAR(500),
        mime_type VARCHAR(100),
        is_favorite BOOLEAN DEFAULT FALSE,
        is_shared BOOLEAN DEFAULT FALSE,
        access_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (folder_id) REFERENCES file_folders(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_folder_id (folder_id),
        INDEX idx_file_type (file_type),
        INDEX idx_storage_type (storage_type),
        INDEX idx_is_favorite (is_favorite),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS file_shares (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_id INT,
        folder_id INT,
        shared_by_id INT NOT NULL,
        shared_with_id INT NOT NULL,
        permission ENUM('View', 'Edit', 'Download') DEFAULT 'View',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
        FOREIGN KEY (folder_id) REFERENCES file_folders(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_by_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_shared_by_id (shared_by_id),
        INDEX idx_shared_with_id (shared_with_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        participant1_id INT NOT NULL,
        participant2_id INT NOT NULL,
        last_message_text LONGTEXT,
        last_message_timestamp TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_participant1_id (participant1_id),
        INDEX idx_participant2_id (participant2_id),
        INDEX idx_updated_at (updated_at),
        UNIQUE KEY unique_conversation (participant1_id, participant2_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message_text LONGTEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_conversation_id (conversation_id),
        INDEX idx_sender_id (sender_id),
        INDEX idx_receiver_id (receiver_id),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_type VARCHAR(100) NOT NULL DEFAULT 'Note',
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        contact_id INT,
        deal_id INT,
        project_id INT,
        company_id INT,
        assigned_to INT,
        created_by INT,
        scheduled_date DATETIME,
        completed_date DATETIME,
        duration_minutes INT,
        meeting_link VARCHAR(500),
        notes LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_activity_type (activity_type),
        INDEX idx_status (status),
        INDEX idx_contact_id (contact_id),
        INDEX idx_deal_id (deal_id),
        INDEX idx_project_id (project_id),
        INDEX idx_company_id (company_id),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_created_by (created_by),
        INDEX idx_scheduled_date (scheduled_date),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS entity_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT NOT NULL,
        contact_id INT,
        company_id INT,
        deal_id INT,
        project_id INT,
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        is_important BOOLEAN DEFAULT FALSE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_contact_id (contact_id),
        INDEX idx_company_id (company_id),
        INDEX idx_deal_id (deal_id),
        INDEX idx_project_id (project_id),
        INDEX idx_is_important (is_important),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plan_name VARCHAR(255) NOT NULL,
        plan_type VARCHAR(100),
        plan_position INT,
        plan_currency VARCHAR(10),
        plan_currency_free VARCHAR(10),
        discount_type VARCHAR(50),
        discount DECIMAL(10, 2),
        limitations_invoices INT,
        max_customers INT,
        product VARCHAR(255),
        supplier VARCHAR(255),
        modules LONGTEXT,
        access_trial BOOLEAN DEFAULT FALSE,
        trial_days INT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_plan_name (plan_name),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plan_name VARCHAR(255) NOT NULL,
        plan_type VARCHAR(100) NOT NULL,
        price DECIMAL(15, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        total_subscribers INT DEFAULT 0,
        description LONGTEXT,
        features JSON,
        status ENUM('Active', 'Inactive', 'Archived') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_plan_name (plan_name),
        INDEX idx_plan_type (plan_type),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('✓ All tables initialized successfully');
    
    const [existingRoles] = await connection.query('SELECT COUNT(*) as count FROM roles');
    if (existingRoles[0].count === 0) {
      const defaultRoles = [
        { name: 'Super Admin', description: 'Full system access - can manage everything' },
        { name: 'Admin', description: 'Company-wide management - cannot change system settings' },
        { name: 'Deal Manager', description: 'Focus on deals, leads, and pipelines' },
        { name: 'Project Manager', description: 'Focus on projects and team management' },
        { name: 'Employee', description: 'Limited access - only assigned items' }
      ];
      for (const role of defaultRoles) {
        await connection.query('INSERT INTO roles (name, description) VALUES (?, ?)', [role.name, role.description]);
        console.log(`✓ Role created: ${role.name}`);
      }
      console.log('✓ All default roles created');
    } else {
      const [roles] = await connection.query('SELECT id, name FROM roles ORDER BY id');
      console.log('✓ Existing roles found:', roles.map(r => `${r.id}: ${r.name}`).join(', '));
    }
    
    const [existingModules] = await connection.query('SELECT COUNT(*) as count FROM modules');
    if (existingModules[0].count === 0) {
      const defaultModules = ['Dashboard', 'Contacts', 'Companies', 'Leads', 'Deals', 'Pipelines', 'Campaign', 'Projects', 'Tasks', 'Activity'];
      for (const module of defaultModules) {
        await connection.query('INSERT INTO modules (name) VALUES (?)', [module]);
      }
      console.log('✓ Default modules created');
    }

    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      const demoUsers = [
        { first_name: 'Admin', last_name: 'User', email: 'admin@example.com', password: 'admin123', role_id: 1 },
        { first_name: 'John', last_name: 'Doe', email: 'john@example.com', password: 'pass123', role_id: 2 },
        { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', password: 'pass123', role_id: 3 },
        { first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com', password: 'pass123', role_id: 4 },
        { first_name: 'Client', last_name: 'User', email: 'client@example.com', password: 'pass123', role_id: 5 },
        { first_name: 'Lead', last_name: 'User', email: 'lead@example.com', password: 'pass123', role_id: 6 }
      ];
      for (const user of demoUsers) {
        const username = user.email.split('@')[0];
        await connection.query(
          'INSERT INTO users (first_name, last_name, username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [user.first_name, user.last_name, username, user.email, user.password, user.role_id, 'Active']
        );
      }
      console.log('✓ Demo users created');
    }

    const [existingCompanies] = await connection.query('SELECT COUNT(*) as count FROM companies');
    if (existingCompanies[0].count === 0) {
      const demoCompanies = [
        { company_name: 'Acme Corporation', email: 'contact@acme.com', phone: '555-0101', website: 'https://acme.com', industry: 'Technology', status: 'Active', created_by: 1 },
        { company_name: 'Global Solutions Inc', email: 'info@globalsol.com', phone: '555-0102', website: 'https://globalsol.com', industry: 'Consulting', status: 'Active', created_by: 1 },
        { company_name: 'Tech Innovations Ltd', email: 'hello@techinnovations.com', phone: '555-0103', website: 'https://techinnovations.com', industry: 'Software', status: 'Active', created_by: 1 }
      ];
      for (const company of demoCompanies) {
        await connection.query(
          'INSERT INTO companies (company_name, email, phone, website, industry, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [company.company_name, company.email, company.phone, company.website, company.industry, company.status, company.created_by]
        );
      }
      console.log('✓ Demo companies created');
    }

    const [existingActivities] = await connection.query('SELECT COUNT(*) as count FROM activities');
    if (existingActivities[0].count === 0) {
      const demoActivities = [
        { activity_type: 'Meeting', title: 'We scheduled a meeting for next week', status: 'Pending', priority: 'High', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Calls', title: 'Had conversation with Fred regarding task', status: 'Completed', priority: 'Medium', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Email', title: 'Analysing latest time estimation for new project', status: 'Pending', priority: 'Medium', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Task', title: 'Store and manage contact data', status: 'Pending', priority: 'High', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Meeting', title: 'Will have a meeting before project start', status: 'Pending', priority: 'Medium', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Calls', title: 'Call John and discuss about project', status: 'Pending', priority: 'Low', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Task', title: 'Built landing pages', status: 'Completed', priority: 'High', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Email', title: 'Regarding latest updates in project', status: 'Pending', priority: 'Medium', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Calls', title: 'Discussed budget proposal with Edwin', status: 'Completed', priority: 'High', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000) },
        { activity_type: 'Email', title: 'Attach final proposal for upcoming project', status: 'Pending', priority: 'High', assigned_to: null, created_by: null, scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }
      ];
      for (const activity of demoActivities) {
        await connection.query(
          'INSERT INTO activities (activity_type, title, status, priority, assigned_to, created_by, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [activity.activity_type, activity.title, activity.status, activity.priority, activity.assigned_to, activity.created_by, activity.scheduled_date]
        );
      }
      console.log('✓ Demo activities created');
    }

    const [existingPipelines] = await connection.query('SELECT COUNT(*) as count FROM pipeline');
    if (existingPipelines[0].count === 0) {
      const demoPipelines = [
        { name: 'Sales Pipeline', description: 'Main sales pipeline for B2B deals', position: 1, status: 'Active' },
        { name: 'Project Pipeline', description: 'Pipeline for project-based sales', position: 2, status: 'Active' },
        { name: 'Support Pipeline', description: 'Support and maintenance contracts', position: 3, status: 'Active' }
      ];
      for (const pipeline of demoPipelines) {
        await connection.query(
          'INSERT INTO pipeline (name, description, position, status) VALUES (?, ?, ?, ?)',
          [pipeline.name, pipeline.description, pipeline.position, pipeline.status]
        );
      }
      console.log('✓ Demo pipelines created');
    }

    const [existingContracts] = await connection.query('SELECT COUNT(*) as count FROM contracts');
    if (existingContracts[0].count === 0) {
      const demoContracts = [
        { subject: 'Service Agreement - 2024', start_date: new Date(), end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), client_id: 1, contract_type: 'Service Agreement', contract_value: 50000, status: 'Active', created_by: 1 },
        { subject: 'Software License Agreement', start_date: new Date(), end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), client_id: 2, contract_type: 'License Agreement', contract_value: 25000, status: 'Draft', created_by: 1 },
        { subject: 'Maintenance Contract - Annual', start_date: new Date(), end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), client_id: 3, contract_type: 'Maintenance', contract_value: 15000, status: 'Active', created_by: 2 }
      ];
      for (const contract of demoContracts) {
        await connection.query(
          'INSERT INTO contracts (subject, start_date, end_date, client_id, contract_type, contract_value, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [contract.subject, contract.start_date, contract.end_date, contract.client_id, contract.contract_type, contract.contract_value, contract.status, contract.created_by]
        );
      }
      console.log('✓ Demo contracts created');
    }

    const [existingEstimations] = await connection.query('SELECT COUNT(*) as count FROM estimations');
    if (existingEstimations[0].count === 0) {
      const demoEstimations = [
        { estimation_number: 'EST-001', client_id: 1, amount: 35000, currency: 'USD', status: 'Draft', estimate_date: new Date(), expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        { estimation_number: 'EST-002', client_id: 2, amount: 18000, currency: 'USD', status: 'Sent', estimate_date: new Date(), expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        { estimation_number: 'EST-003', client_id: 3, amount: 12000, currency: 'USD', status: 'Accepted', estimate_date: new Date(), expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      ];
      for (const estimation of demoEstimations) {
        await connection.query(
          'INSERT INTO estimations (estimation_number, client_id, amount, currency, status, estimate_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [estimation.estimation_number, estimation.client_id, estimation.amount, estimation.currency, estimation.status, estimation.estimate_date, estimation.expiry_date]
        );
      }
      console.log('✓ Demo estimations created');
    }

    const [existingTasks] = await connection.query('SELECT COUNT(*) as count FROM general_tasks');
    if (existingTasks[0].count === 0) {
      const demoTasks = [
        { title: 'Review client feedback', description: 'Go through the latest feedback from client meetings', status: 'Open', priority: 'High', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
        { title: 'Update project documentation', description: 'Make sure all project docs are current', status: 'In Progress', priority: 'Medium', due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
        { title: 'Prepare presentation for stakeholders', description: 'Create slides for Q1 review meeting', status: 'Open', priority: 'High', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        { title: 'Budget review meeting', description: 'Schedule and conduct budget review with finance team', status: 'Completed', priority: 'Medium', due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { title: 'Team training session', description: 'Conduct training on new tools and procedures', status: 'Open', priority: 'Low', due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }
      ];
      for (const task of demoTasks) {
        await connection.query(
          'INSERT INTO general_tasks (title, description, status, priority, due_date, linked_type) VALUES (?, ?, ?, ?, ?, ?)',
          [task.title, task.description, task.status, task.priority, task.due_date, 'General']
        );
      }
      console.log('✓ Demo general tasks created');
    }

    const [existingProposals] = await connection.query('SELECT COUNT(*) as count FROM proposals');
    if (existingProposals[0].count === 0) {
      const demoProposals = [
        { proposal_number: 'PROP-001', title: 'Web Development Project Proposal', client_id: 1, total_amount: 45000, currency: 'USD', status: 'Submitted', proposal_date: new Date(), validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        { proposal_number: 'PROP-002', title: 'Mobile App Development Proposal', client_id: 2, total_amount: 65000, currency: 'USD', status: 'Draft', proposal_date: new Date(), validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        { proposal_number: 'PROP-003', title: 'Cloud Infrastructure Proposal', client_id: 3, total_amount: 28000, currency: 'USD', status: 'Approved', proposal_date: new Date(), validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      ];
      for (const proposal of demoProposals) {
        await connection.query(
          'INSERT INTO proposals (proposal_number, title, client_id, total_amount, currency, status, proposal_date, validity_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [proposal.proposal_number, proposal.title, proposal.client_id, proposal.total_amount, proposal.currency, proposal.status, proposal.proposal_date, proposal.validity_date]
        );
      }
      console.log('✓ Demo proposals created');
    }

    const [existingConversations] = await connection.query('SELECT COUNT(*) as count FROM conversations');
    if (existingConversations[0].count === 0) {
      const demoConversations = [
        { participant1_id: 1, participant2_id: 2, last_message_text: 'Hey, how are you doing?', last_message_timestamp: new Date() },
        { participant1_id: 1, participant2_id: 3, last_message_text: 'Let\'s sync up next week', last_message_timestamp: new Date() },
        { participant1_id: 2, participant2_id: 3, last_message_text: 'Sounds good to me', last_message_timestamp: new Date() }
      ];
      for (const conversation of demoConversations) {
        await connection.query(
          'INSERT INTO conversations (participant1_id, participant2_id, last_message_text, last_message_timestamp) VALUES (?, ?, ?, ?)',
          [conversation.participant1_id, conversation.participant2_id, conversation.last_message_text, conversation.last_message_timestamp]
        );
      }
      console.log('✓ Demo conversations created');
    }

    const [existingMessages] = await connection.query('SELECT COUNT(*) as count FROM messages');
    if (existingMessages[0].count === 0) {
      const [conversations] = await connection.query('SELECT * FROM conversations LIMIT 3');
      
      if (conversations.length > 0) {
        const demoMessages = [
          { conversation_id: conversations[0].id, sender_id: 1, receiver_id: 2, message_text: 'Hi there!' },
          { conversation_id: conversations[0].id, sender_id: 2, receiver_id: 1, message_text: 'Hey! How are you?' },
          { conversation_id: conversations[0].id, sender_id: 1, receiver_id: 2, message_text: 'Great! How about you?' },
          { conversation_id: conversations[1].id, sender_id: 1, receiver_id: 3, message_text: 'Let\'s schedule a call' },
          { conversation_id: conversations[1].id, sender_id: 3, receiver_id: 1, message_text: 'Sure, how about Tuesday?' },
          { conversation_id: conversations[2].id, sender_id: 2, receiver_id: 3, message_text: 'Sounds good to me' }
        ];
        for (const message of demoMessages) {
          await connection.query(
            'INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text) VALUES (?, ?, ?, ?)',
            [message.conversation_id, message.sender_id, message.receiver_id, message.message_text]
          );
        }
        console.log('✓ Demo messages created');
      }
    }

    const [existingFiles] = await connection.query('SELECT COUNT(*) as count FROM files');
    if (existingFiles[0].count === 0) {
      const demoFiles = [
        { user_id: 1, name: 'Project Proposal.pdf', file_type: 'pdf', size_bytes: 2048000, mime_type: 'application/pdf', storage_type: 'Internal' },
        { user_id: 1, name: 'Budget Spreadsheet.xlsx', file_type: 'xlsx', size_bytes: 512000, mime_type: 'application/vnd.ms-excel', storage_type: 'Internal' },
        { user_id: 2, name: 'Meeting Notes.docx', file_type: 'docx', size_bytes: 256000, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', storage_type: 'Google Drive' },
        { user_id: 2, name: 'Client Presentation.pptx', file_type: 'pptx', size_bytes: 4096000, mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', storage_type: 'Internal' },
        { user_id: 3, name: 'Design Assets.zip', file_type: 'zip', size_bytes: 10485760, mime_type: 'application/zip', storage_type: 'Dropbox' }
      ];
      for (const file of demoFiles) {
        await connection.query(
          'INSERT INTO files (user_id, name, file_type, size_bytes, mime_type, storage_type) VALUES (?, ?, ?, ?, ?, ?)',
          [file.user_id, file.name, file.file_type, file.size_bytes, file.mime_type, file.storage_type]
        );
      }
      console.log('✓ Demo files created');
    }


    
    connection.release();
  } catch (error) {
    console.error('Database initialization error:', error.message);
    if (connection) connection.release();
  }
}

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log('✓ Database connection successful');
    await initializeDatabase();
  } catch (err) {
    console.error('✗ Database connection failed:', err.code || err.message);
  }
}

module.exports = { initializeDatabase, testConnection };
