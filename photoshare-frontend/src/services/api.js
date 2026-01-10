/**
 * API Service
 * ===========
 * Centralized API calls using axios
 * Create this file as: src/services/api.js
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Authentication API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  
  register: (userData) =>
    api.post('/auth/register/', userData),
  
  getCurrentUser: () =>
    api.get('/users/me/'),
};

// Photo API
export const photoAPI = {
  list: (params) =>
    api.get('/photos/', { params }),
  
  get: (id) =>
    api.get(`/photos/${id}/`),
  
  create: (formData) =>
    api.post('/photos/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id, data) =>
    api.patch(`/photos/${id}/`, data),
  
  delete: (id) =>
    api.delete(`/photos/${id}/`),
  
  search: (query) =>
    api.get('/photos/search/', { params: { q: query } }),
  
  trending: () =>
    api.get('/photos/trending/'),
  
  getComments: (photoId) =>
    api.get(`/photos/${photoId}/comments/`),
  
  getRatings: (photoId) =>
    api.get(`/photos/${photoId}/ratings/`),
};

// Comment API
export const commentAPI = {
  create: (data) =>
    api.post('/comments/', data),
  
  list: (photoId) =>
    api.get(`/photos/${photoId}/comments/`),
  
  delete: (id) =>
    api.delete(`/comments/${id}/`),
  
  update: (id, data) =>
    api.patch(`/comments/${id}/`, data),
};

// Rating API
export const ratingAPI = {
  create: (photoId, score) =>
    api.post('/ratings/', { photo: photoId, score }),
  
  list: (photoId) =>
    api.get('/ratings/', { params: { photo: photoId } }),
};

export default api;
