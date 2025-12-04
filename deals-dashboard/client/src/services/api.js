const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {
  
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },
};

export const companiesAPI = {
  getAll: () => apiService.get('/companies'),
  getById: (id) => apiService.get(`/companies/${id}`),
  create: (data) => apiService.post('/companies', data),
  update: (id, data) => apiService.put(`/companies/${id}`, data),
  delete: (id) => apiService.delete(`/companies/${id}`),
  upgrade: (id, data) => apiService.post(`/companies/${id}/upgrade`, data),
};

export const dealsAPI = {
  getAll: () => apiService.get('/deals'),
  getById: (id) => apiService.get(`/deals/${id}`),
  create: (data) => apiService.post('/deals', data),
  update: (id, data) => apiService.put(`/deals/${id}`, data),
  delete: (id) => apiService.delete(`/deals/${id}`),
};

export const contactsAPI = {
  getAll: () => apiService.get('/contacts'),
  create: (data) => apiService.post('/contacts', data),
};

export const leadsAPI = {
  getAll: () => apiService.get('/leads'),
  getById: (id) => apiService.get(`/leads/${id}`),
  create: (data) => apiService.post('/leads', data),
  update: (id, data) => apiService.put(`/leads/${id}`, data),
  delete: (id) => apiService.delete(`/leads/${id}`),
  convertToContact: (id, data) => apiService.post(`/leads/${id}/convert-to-contact`, data),
  convertToCompany: (id, data) => apiService.post(`/leads/${id}/convert-to-company`, data),
  convertToDeal: (id, data) => apiService.post(`/leads/${id}/convert-to-deal`, data),
};

export const plansAPI = {
  getAll: () => apiService.get('/plans'),
  create: (data) => apiService.post('/plans', data),
};

export const pipelineAPI = {
  getAll: () => apiService.get('/pipeline'),
  getById: (id) => apiService.get(`/pipeline/${id}`),
  create: (data) => apiService.post('/pipeline', data),
  update: (id, data) => apiService.put(`/pipeline/${id}`, data),
  delete: (id) => apiService.delete(`/pipeline/${id}`),
};

export const invoicesAPI = {
  getAll: () => apiService.get('/invoices'),
  getById: (id) => apiService.get(`/invoices/${id}`),
  create: (data) => apiService.post('/invoices', data),
  update: (id, data) => apiService.put(`/invoices/${id}`, data),
  delete: (id) => apiService.delete(`/invoices/${id}`),
};

export const campaignAPI = {
  getAll: () => apiService.get('/campaigns'),
  getById: (id) => apiService.get(`/campaigns/${id}`),
  create: (data) => apiService.post('/campaigns', data),
  update: (id, data) => apiService.put(`/campaigns/${id}`, data),
  delete: (id) => apiService.delete(`/campaigns/${id}`),
};

export const projectAPI = {
  getAll: () => apiService.get('/projects'),
  getById: (id) => apiService.get(`/projects/${id}`),
  create: (data) => apiService.post('/projects', data),
  update: (id, data) => apiService.put(`/projects/${id}`, data),
  delete: (id) => apiService.delete(`/projects/${id}`),
  convertDealToProject: (dealId, data) => apiService.post(`/deals/${dealId}/convert-to-project`, data),
  getActivity: (projectId) => apiService.get(`/projects/${projectId}/activity`),
};

export const taskAPI = {
  create: (projectId, data) => apiService.post(`/projects/${projectId}/tasks`, data),
  getAll: (projectId) => apiService.get(`/projects/${projectId}/tasks`),
  update: (projectId, taskId, data) => apiService.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId) => apiService.delete(`/projects/${projectId}/tasks/${taskId}`),
  
  createGeneral: (data) => apiService.post('/tasks', data),
  getAllGeneral: () => apiService.get('/tasks'),
  getById: (taskId) => apiService.get(`/tasks/${taskId}`),
  updateGeneral: (taskId, data) => apiService.put(`/tasks/${taskId}`, data),
  deleteGeneral: (taskId) => apiService.delete(`/tasks/${taskId}`),
};

export const projectCommentAPI = {
  create: (projectId, data) => apiService.post(`/projects/${projectId}/comments`, data),
  getAll: (projectId) => apiService.get(`/projects/${projectId}/comments`),
};

export const projectTeamAPI = {
  addMember: (projectId, data) => apiService.post(`/projects/${projectId}/team`, data),
  getMembers: (projectId) => apiService.get(`/projects/${projectId}/team`),
  removeMember: (projectId, userId) => apiService.delete(`/projects/${projectId}/team/${userId}`),
};

export const proposalsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiService.get(`/proposals${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiService.get(`/proposals/${id}`),
  create: (data) => apiService.post('/proposals', data),
  update: (id, data) => apiService.put(`/proposals/${id}`, data),
  delete: (id) => apiService.delete(`/proposals/${id}`),
  updateStatus: (id, data) => apiService.post(`/proposals/${id}/status`, data),
  submit: (id, data) => apiService.post(`/proposals/${id}/submit`, data),
  approve: (id, data) => apiService.post(`/proposals/${id}/approve`, data),
  reject: (id, data) => apiService.post(`/proposals/${id}/reject`, data),
  send: (id, data) => apiService.post(`/proposals/${id}/send`, data),
  getHistory: (id) => apiService.get(`/proposals/${id}/history`),
  convertToInvoice: (id, data) => apiService.post(`/proposals/${id}/convert-to-invoice`, data),
};

export default apiService;
