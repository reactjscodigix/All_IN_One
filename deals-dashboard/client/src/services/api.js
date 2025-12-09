const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {
  
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        let errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error || errorText;
        } catch (e) {
          errorText = errorText.substring(0, 200);
        }
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log(`✅ GET ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ GET ${endpoint} failed:`, error);
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
      if (!response.ok) {
        let errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error || errorText;
        } catch (e) {
          errorText = errorText.substring(0, 200);
        }
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
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
      if (!response.ok) {
        let errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error || errorText;
        } catch (e) {
          errorText = errorText.substring(0, 200);
        }
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
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
      if (!response.ok) {
        let errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error || errorText;
        } catch (e) {
          errorText = errorText.substring(0, 200);
        }
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
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
  getMetrics: () => apiService.get('/invoices/metrics/summary'),
  getBreakdown: () => apiService.get('/invoices/status/breakdown'),
  getByCompany: (companyId) => apiService.get(`/companies/${companyId}/invoices`),
  getByDeal: (dealId) => apiService.get(`/deals/${dealId}/invoices`),
  linkToDeal: (invoiceId, dealId) => apiService.post(`/invoices/${invoiceId}/link-to-deal/${dealId}`, {}),
  linkToClient: (invoiceId, clientId) => apiService.post(`/invoices/${invoiceId}/link-to-client/${clientId}`, {}),
  getItems: (invoiceId) => apiService.get(`/invoices/${invoiceId}/items`),
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

export const contractsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiService.get(`/contracts${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiService.get(`/contracts/${id}`),
  create: (data) => apiService.post('/contracts', data),
  update: (id, data) => apiService.put(`/contracts/${id}`, data),
  delete: (id) => apiService.delete(`/contracts/${id}`),
};

export const estimationsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiService.get(`/estimations${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiService.get(`/estimations/${id}`),
  create: (data) => apiService.post('/estimations', data),
  update: (id, data) => apiService.put(`/estimations/${id}`, data),
  delete: (id) => apiService.delete(`/estimations/${id}`),
  send: (id, data) => apiService.post(`/estimations/${id}/send`, data),
  convertToInvoice: (id, data) => apiService.post(`/estimations/${id}/convert-to-invoice`, data),
};

export const paymentsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiService.get(`/invoices${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiService.get(`/invoices/${id}`),
  create: (data) => apiService.post('/invoices', data),
  update: (id, data) => apiService.put(`/invoices/${id}`, data),
  delete: (id) => apiService.delete(`/invoices/${id}`),
  getByInvoice: (invoiceId) => apiService.get(`/invoices/${invoiceId}/items`),
  getMetrics: () => apiService.get('/invoices/metrics/summary'),
  markAsRefunded: (id, data) => apiService.post(`/invoices/${id}/refund`, data),
};

export const fileManagerAPI = {
  getFiles: (userId) => apiService.get(`/files${userId ? '?userId=' + userId : ''}`),
  getFolders: (userId) => apiService.get(`/folders${userId ? '?userId=' + userId : ''}`),
  getStorageStats: (userId) => apiService.get(`/files/storage-stats${userId ? '?userId=' + userId : ''}`),
  createFolder: (data) => apiService.post('/folders', data),
  uploadFile: (data) => apiService.post('/files', data),
  updateFileFavorite: (fileId, isFavorite) => apiService.put(`/files/${fileId}/favorite`, { isFavorite }),
  deleteFile: (fileId) => apiService.delete(`/files/${fileId}`),
  deleteFolder: (folderId) => apiService.delete(`/folders/${folderId}`),
};

export const createContract = (data) => contractsAPI.create(data);

export default apiService;
