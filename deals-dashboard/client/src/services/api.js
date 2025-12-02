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
  create: (data) => apiService.post('/leads', data),
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
};

export default apiService;
