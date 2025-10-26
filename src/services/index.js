import api from './api';

export const authService = {
  login: async (name, password) => {
    const response = await api.post('/auth/login', { name, password });
    return response.data;
  },

  register: async (name, password, role = 'staff') => {
    const response = await api.post('/auth/register', { name, password, role });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const itemService = {
  getAllItems: async (params = {}) => {
    const response = await api.get('/items', { params });
    return response.data;
  },

  getItemById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  getItemByCode: async (code) => {
    const response = await api.get(`/items/code/${code}`);
    return response.data;
  },

  createItem: async (itemData) => {
    const response = await api.post('/items', itemData);
    return response.data;
  },

  updateItem: async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/items/stats');
    return response.data;
  },
};

export const transactionService = {
  getAllTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getItemHistory: async (itemId) => {
    const response = await api.get(`/transactions/item/${itemId}`);
    return response.data;
  },

  checkOutItem: async (code, notes = '', checkoutPerson = '', projectName = '') => {
    const response = await api.post('/transactions/checkout', { code, notes, checkoutPerson, projectName });
    return response.data;
  },

  checkInItem: async (code, notes = '') => {
    const response = await api.post('/transactions/checkin', { code, notes });
    return response.data;
  },

  getRecentTransactions: async () => {
    const response = await api.get('/transactions/recent');
    return response.data;
  },
};

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
