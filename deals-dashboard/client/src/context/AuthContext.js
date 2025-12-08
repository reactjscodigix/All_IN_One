import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

const ROLE_PERMISSIONS = {
  'Admin': {
    dashboard: ['view', 'edit', 'create', 'delete'],
    contacts: ['view', 'create', 'edit', 'delete', 'export'],
    companies: ['view', 'create', 'edit', 'delete', 'export'],
    leads: ['view', 'create', 'edit', 'delete', 'convert', 'export'],
    deals: ['view', 'create', 'edit', 'delete', 'assign', 'export'],
    pipeline: ['view', 'create', 'edit', 'delete'],
    campaign: ['view', 'create', 'edit', 'delete'],
    projects: ['view', 'create', 'edit', 'delete', 'manage_team'],
    tasks: ['view', 'create', 'edit', 'delete', 'assign'],
    proposals: ['view', 'create', 'edit', 'delete'],
    contracts: ['view', 'create', 'edit', 'delete'],
    estimations: ['view', 'create', 'edit', 'delete'],
    invoices: ['view', 'create', 'edit', 'delete'],
    payments: ['view', 'create', 'edit', 'delete'],
    activities: ['view', 'export'],
    analytics: ['view', 'export'],
    users: ['view', 'create', 'edit', 'delete'],
    roles: ['view', 'create', 'edit', 'delete'],
    reports: ['view', 'export', 'create'],
    settings: ['view', 'edit'],
  },
  'Company Owner': {
    dashboard: ['view', 'edit'],
    contacts: ['view', 'create', 'edit'],
    companies: ['view', 'edit'],
    leads: ['view', 'create', 'edit', 'convert'],
    deals: ['view', 'create', 'edit', 'assign'],
    pipeline: ['view'],
    campaign: ['view', 'create', 'edit'],
    projects: ['view', 'create', 'edit', 'manage_team'],
    tasks: ['view', 'create', 'edit', 'assign'],
    proposals: ['view', 'create', 'edit'],
    contracts: ['view', 'create', 'edit'],
    estimations: ['view', 'create', 'edit'],
    invoices: ['view', 'create', 'edit'],
    payments: ['view'],
    activities: ['view'],
    analytics: ['view'],
    users: ['view'],
    roles: [],
    reports: ['view', 'create'],
    settings: [],
  },
  'Deal Owner': {
    dashboard: ['view'],
    contacts: ['view', 'edit'],
    companies: ['view'],
    leads: ['view', 'create', 'edit', 'convert'],
    deals: ['view', 'create', 'edit', 'assign'],
    pipeline: ['view'],
    campaign: ['view'],
    projects: ['view'],
    tasks: ['view', 'create', 'edit'],
    proposals: ['view', 'create', 'edit'],
    contracts: ['view'],
    estimations: ['view', 'create', 'edit'],
    invoices: ['view'],
    payments: ['view'],
    activities: ['view'],
    analytics: ['view'],
    users: [],
    roles: [],
    reports: ['view'],
    settings: [],
  },
  'Project Manager': {
    dashboard: ['view'],
    contacts: ['view'],
    companies: ['view'],
    leads: ['view'],
    deals: ['view'],
    pipeline: ['view'],
    campaign: ['view', 'create', 'edit'],
    projects: ['view', 'create', 'edit', 'manage_team'],
    tasks: ['view', 'create', 'edit', 'delete', 'assign'],
    proposals: ['view'],
    contracts: ['view'],
    estimations: ['view'],
    invoices: ['view'],
    payments: ['view'],
    activities: ['view'],
    analytics: ['view'],
    users: [],
    roles: [],
    reports: ['view', 'create'],
    settings: [],
  },
  'Client': {
    dashboard: ['view'],
    contacts: ['view'],
    companies: ['view'],
    leads: [],
    deals: ['view'],
    pipeline: ['view'],
    campaign: [],
    projects: ['view'],
    tasks: ['view'],
    proposals: ['view'],
    contracts: ['view'],
    estimations: ['view'],
    invoices: ['view'],
    payments: ['view'],
    activities: [],
    analytics: [],
    users: [],
    roles: [],
    reports: [],
    settings: [],
  },
  'Lead': {
    dashboard: ['view'],
    contacts: ['view', 'create', 'edit'],
    companies: ['view'],
    leads: ['view', 'create', 'edit'],
    deals: ['view', 'create', 'edit'],
    pipeline: ['view'],
    campaign: [],
    projects: ['view'],
    tasks: ['view', 'create', 'edit'],
    proposals: ['view'],
    contracts: [],
    estimations: [],
    invoices: [],
    payments: [],
    activities: ['view'],
    analytics: [],
    users: [],
    roles: [],
    reports: [],
    settings: [],
  },
  'Employee': {
    dashboard: ['view'],
    contacts: ['view', 'edit'],
    companies: ['view'],
    leads: ['view'],
    deals: ['view', 'edit'],
    pipeline: ['view'],
    campaign: [],
    projects: ['view'],
    tasks: ['view', 'create', 'edit'],
    proposals: ['view'],
    contracts: ['view'],
    estimations: ['view'],
    invoices: ['view'],
    payments: ['view'],
    activities: ['view'],
    analytics: [],
    users: [],
    roles: [],
    reports: [],
    settings: [],
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasPermission = useCallback((module, action) => {
    if (!user) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) return false;

    const modulePerms = rolePermissions[module];
    if (!modulePerms) return false;

    return modulePerms.includes(action);
  }, [user]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  const canAccess = useCallback((modules) => {
    if (!user) return false;
    if (!Array.isArray(modules)) modules = [modules];
    
    return modules.some(module => {
      const rolePermissions = ROLE_PERMISSIONS[user.role];
      return rolePermissions && rolePermissions[module] && rolePermissions[module].length > 0;
    });
  }, [user]);

  const getRolePermissions = useCallback((role) => {
    return ROLE_PERMISSIONS[role] || {};
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    canAccess,
    getRolePermissions,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
