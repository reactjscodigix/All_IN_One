const ROLE_UI_VISIBILITY = {
  'Super Admin': {
    sidebar: {
      dashboard: true,
      crm: true,
      applications: true,
      reports: true,
      userManagement: true,
      crmSettings: true,
      membership: false,
      content: true,
      blog: false,
      settings: true,
      superAdmin: true,
    },
    components: {
      createButton: true,
      editButton: true,
      deleteButton: true,
      bulkActions: true,
      exportButton: true,
      importButton: true,
      settingsButton: true,
      assignButton: true,
      transferButton: true,
    },
    menuItems: {
      dealsDashboard: 'view',
      leadsDashboard: 'view',
      projectDashboard: 'view',
      applications: 'view',
      chatCallEmailCalendar: 'view',
      crmContacts: 'view',
      crmCompanies: 'view',
      crmDeals: 'view',
      crmLeads: 'view',
      crmPipeline: 'view',
      projectsAndTasks: 'view',
      proposalsAndEstimations: 'view',
      invoicesAndPayments: 'view',
      analytics: 'view',
      reports: 'view',
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: true,
      Deals: true,
      Pipelines: true,
      Campaign: true,
      Projects: true,
      Tasks: true,
      Proposals: true,
      Contracts: true,
      Estimations: true,
      Invoices: true,
      Payments: true,
      Activities: true,
      Analytics: true,
      UserManagement: true,
      Roles: true,
      Reports: true,
    }
  },
  'Admin': {
    sidebar: {
      dashboard: true,
      crm: true,
      applications: true,
      reports: true,
      userManagement: true,
      crmSettings: true,
      membership: false,
      content: true,
      blog: false,
      settings: false,
      superAdmin: false,
    },
    components: {
      createButton: true,
      editButton: true,
      deleteButton: true,
      bulkActions: true,
      exportButton: true,
      importButton: true,
      settingsButton: false,
      assignButton: true,
      transferButton: true,
    },
    menuItems: {
      dealsDashboard: 'view',
      leadsDashboard: 'view',
      projectDashboard: 'view',
      applications: 'view',
      chatCallEmailCalendar: 'view',
      crmContacts: 'view',
      crmCompanies: 'view',
      crmDeals: 'view',
      crmLeads: 'view',
      crmPipeline: 'view',
      projectsAndTasks: 'view',
      proposalsAndEstimations: 'view',
      invoicesAndPayments: 'view',
      analytics: 'view',
      reports: 'view',
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: true,
      Deals: true,
      Pipelines: true,
      Campaign: true,
      Projects: true,
      Tasks: true,
      Proposals: true,
      Contracts: true,
      Estimations: true,
      Invoices: true,
      Payments: true,
      Activities: true,
      Analytics: true,
      UserManagement: true,
      Roles: false,
      Reports: true,
    }
  },
  'Deal Manager': {
    sidebar: {
      dashboard: true,
      crm: true,
      applications: true,
      reports: true,
      userManagement: false,
      crmSettings: false,
      membership: false,
      content: false,
      blog: false,
      settings: false,
      superAdmin: false,
    },
    components: {
      createButton: true,
      editButton: true,
      deleteButton: false,
      bulkActions: true,
      exportButton: true,
      importButton: false,
      settingsButton: false,
      assignButton: true,
      transferButton: false,
    },
    menuItems: {
      dealsDashboard: 'view',
      leadsDashboard: 'view',
      projectDashboard: 'view_only',
      applications: 'view',
      chatCallEmailCalendar: 'view',
      crmContacts: 'view',
      crmCompanies: 'view',
      crmDeals: 'view',
      crmLeads: 'view',
      crmPipeline: 'view',
      projectsAndTasks: 'view_only',
      proposalsAndEstimations: 'view',
      invoicesAndPayments: 'view',
      analytics: 'view',
      reports: 'view',
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: true,
      Deals: true,
      Pipelines: true,
      Campaign: true,
      Projects: false,
      Tasks: true,
      Proposals: true,
      Contracts: false,
      Estimations: true,
      Invoices: true,
      Payments: true,
      Activities: true,
      Analytics: true,
      UserManagement: false,
      Roles: false,
      Reports: true,
    }
  },
  'Project Manager': {
    sidebar: {
      dashboard: true,
      crm: false,
      applications: true,
      reports: true,
      userManagement: false,
      crmSettings: false,
      membership: false,
      content: false,
      blog: false,
      settings: false,
      superAdmin: false,
    },
    components: {
      createButton: true,
      editButton: true,
      deleteButton: true,
      bulkActions: true,
      exportButton: true,
      importButton: false,
      settingsButton: false,
      assignButton: true,
      transferButton: true,
    },
    menuItems: {
      dealsDashboard: 'view_only_if_assigned',
      leadsDashboard: false,
      projectDashboard: 'view',
      applications: 'view',
      chatCallEmailCalendar: 'view',
      crmContacts: 'view_only_if_linked',
      crmCompanies: false,
      crmDeals: 'view_only',
      crmLeads: false,
      crmPipeline: false,
      projectsAndTasks: 'view',
      proposalsAndEstimations: 'view',
      invoicesAndPayments: 'view',
      analytics: 'view_only',
      reports: 'view_only',
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: false,
      Leads: false,
      Deals: true,
      Pipelines: false,
      Campaign: false,
      Projects: true,
      Tasks: true,
      Proposals: true,
      Contracts: true,
      Estimations: true,
      Invoices: true,
      Payments: true,
      Activities: true,
      Analytics: true,
      UserManagement: false,
      Roles: false,
      Reports: true,
    }
  },
  'Employee': {
    sidebar: {
      dashboard: true,
      crm: true,
      applications: true,
      reports: false,
      userManagement: false,
      crmSettings: false,
      membership: false,
      content: false,
      blog: false,
      settings: false,
      superAdmin: false,
    },
    components: {
      createButton: false,
      editButton: true,
      deleteButton: false,
      bulkActions: false,
      exportButton: false,
      importButton: false,
      settingsButton: false,
      assignButton: false,
      transferButton: false,
    },
    menuItems: {
      dealsDashboard: 'assigned_only',
      leadsDashboard: 'assigned_only',
      projectDashboard: 'assigned_only',
      applications: 'view',
      chatCallEmailCalendar: 'view',
      crmContacts: 'assigned_only',
      crmCompanies: 'assigned_only',
      crmDeals: 'assigned_only',
      crmLeads: 'assigned_only',
      crmPipeline: false,
      projectsAndTasks: 'assigned_tasks_only',
      proposalsAndEstimations: false,
      invoicesAndPayments: false,
      analytics: false,
      reports: false,
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: false,
      Deals: true,
      Pipelines: false,
      Campaign: false,
      Projects: true,
      Tasks: true,
      Proposals: true,
      Contracts: true,
      Estimations: true,
      Invoices: true,
      Payments: true,
      Activities: true,
      Analytics: false,
      UserManagement: false,
      Roles: false,
      Reports: false,
    }
  },
};

export const getVisibility = (role, category, key) => {
  const roleVisibility = ROLE_UI_VISIBILITY[role];
  if (!roleVisibility) return false;
  
  if (category === 'sidebar') {
    return roleVisibility.sidebar[key] || false;
  } else if (category === 'components') {
    return roleVisibility.components[key] || false;
  } else if (category === 'modules') {
    return roleVisibility.modules[key] || false;
  } else if (category === 'menuItems') {
    return roleVisibility.menuItems[key] || false;
  }
  
  return false;
};

export const isSidebarItemVisible = (role, item) => {
  return getVisibility(role, 'sidebar', item);
};

export const isComponentVisible = (role, component) => {
  return getVisibility(role, 'components', component);
};

export const isModuleAccessible = (role, module) => {
  return getVisibility(role, 'modules', module);
};

export const getMenuItemAccess = (role, menuItem) => {
  return getVisibility(role, 'menuItems', menuItem) || false;
};

export const canViewMenuItem = (role, menuItem) => {
  const access = getMenuItemAccess(role, menuItem);
  return access && access !== false;
};

export const canEditMenuItem = (role, menuItem) => {
  const access = getMenuItemAccess(role, menuItem);
  return access === 'view' || access === 'view_only_if_assigned' || access === 'assigned_only';
};

export const isAssignedOnly = (role, menuItem) => {
  const access = getMenuItemAccess(role, menuItem);
  return access === 'assigned_only' || access === 'assigned_tasks_only';
};

export const isViewOnly = (role, menuItem) => {
  const access = getMenuItemAccess(role, menuItem);
  return access === 'view_only' || access === 'view_only_if_assigned' || access === 'view_only_if_linked';
};

export const getVisibleModules = (role) => {
  const roleVisibility = ROLE_UI_VISIBILITY[role];
  if (!roleVisibility) return [];
  
  return Object.keys(roleVisibility.modules).filter(
    module => roleVisibility.modules[module]
  );
};

export const getVisibleSidebarSections = (role) => {
  const roleVisibility = ROLE_UI_VISIBILITY[role];
  if (!roleVisibility) return [];
  
  return Object.keys(roleVisibility.sidebar).filter(
    section => roleVisibility.sidebar[section]
  );
};

export const getDataAccessLevel = (role) => {
  const levelMap = {
    'Super Admin': 'all',
    'Admin': 'all',
    'Deal Manager': 'assigned_and_team',
    'Project Manager': 'assigned_projects',
    'Employee': 'assigned_only',
  };
  return levelMap[role] || 'none';
};
