const ROLE_UI_VISIBILITY = {
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
      settings: true,
      superAdmin: false,
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
  'Company Owner': {
    sidebar: {
      dashboard: true,
      crm: true,
      applications: true,
      reports: true,
      userManagement: false,
      crmSettings: true,
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
      UserManagement: false,
      Roles: false,
      Reports: true,
    }
  },
  'Deal Owner': {
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
      bulkActions: false,
      exportButton: true,
      importButton: false,
      settingsButton: false,
      assignButton: true,
      transferButton: false,
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: true,
      Deals: true,
      Pipelines: true,
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
  'Project Manager': {
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
      deleteButton: true,
      bulkActions: true,
      exportButton: true,
      importButton: false,
      settingsButton: false,
      assignButton: true,
      transferButton: true,
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: false,
      Deals: true,
      Pipelines: true,
      Campaign: true,
      Projects: true,
      Tasks: true,
      Proposals: true,
      Contracts: true,
      Estimations: false,
      Invoices: false,
      Payments: false,
      Activities: true,
      Analytics: true,
      UserManagement: false,
      Roles: false,
      Reports: true,
    }
  },
  'Client': {
    sidebar: {
      dashboard: true,
      crm: false,
      applications: false,
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
      editButton: false,
      deleteButton: false,
      bulkActions: false,
      exportButton: false,
      importButton: false,
      settingsButton: false,
      assignButton: false,
      transferButton: false,
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: false,
      Deals: true,
      Pipelines: true,
      Campaign: false,
      Projects: true,
      Tasks: true,
      Proposals: true,
      Contracts: true,
      Estimations: true,
      Invoices: true,
      Payments: true,
      Activities: false,
      Analytics: false,
      UserManagement: false,
      Roles: false,
      Reports: false,
    }
  },
  'Lead': {
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
      createButton: true,
      editButton: true,
      deleteButton: false,
      bulkActions: false,
      exportButton: false,
      importButton: false,
      settingsButton: false,
      assignButton: false,
      transferButton: false,
    },
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: true,
      Deals: true,
      Pipelines: true,
      Campaign: false,
      Projects: true,
      Tasks: true,
      Proposals: true,
      Contracts: false,
      Estimations: false,
      Invoices: false,
      Payments: false,
      Activities: true,
      Analytics: false,
      UserManagement: false,
      Roles: false,
      Reports: false,
    }
  },
  'Employee': {
    sidebar: {
      dashboard: true,
      crm: true,
      applications: false,
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
    modules: {
      Dashboard: true,
      Contacts: true,
      Companies: true,
      Leads: false,
      Deals: true,
      Pipelines: true,
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
