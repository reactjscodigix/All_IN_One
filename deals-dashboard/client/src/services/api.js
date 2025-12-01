const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {
  
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
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
  create: (data) => apiService.post('/deals', data),
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
};

export default apiService;
