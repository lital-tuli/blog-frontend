import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh token without using store dispatch
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await api.post('auth/token/refresh/', { refresh: refreshToken });
        const newToken = response.data.access;
        
        // Store the new token
        localStorage.setItem('access_token', newToken);
        
        // Process the queue
        processQueue(null, newToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and process queue with error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        processQueue(refreshError);
        
        // Import necessary for logout without circular dependency
        const { store } = require('../store');
        const { logout } = require('../store/authSlice');
        store.dispatch(logout());
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Enhance error with user-friendly messages based on status code
    if (error.response) {
      switch (error.response.status) {
        case 400:
          error.userMessage = 'Invalid request. Please check your input.';
          break;
        case 403:
          error.userMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          error.userMessage = 'The requested resource was not found.';
          break;
        case 500:
          error.userMessage = 'Server error. Please try again later.';
          break;
        default:
          error.userMessage = 'An error occurred. Please try again.';
      }
    } else if (error.request) {
      error.userMessage = 'No response from server. Please check your connection.';
    } else {
      error.userMessage = 'Request error. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => api.post('auth/register/', userData),
  login: (credentials) => api.post('auth/token/', credentials),
  getUserDetails: () => api.get('auth/user/'),
  refreshToken: (refreshToken) => api.post('auth/token/refresh/', { refresh: refreshToken }),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

// Articles Service
export const articlesService = {
  getAll: (params) => api.get('articles/', { params }),
  getById: (id) => api.get(`articles/${id}/`),
  create: (articleData) => api.post('articles/', articleData),
  update: (id, articleData) => api.put(`articles/${id}/`, articleData),
  delete: (id) => api.delete(`articles/${id}/`),
  getComments: (id) => api.get(`articles/${id}/comments/`),
  getPopular: () => api.get('articles/popular/')
};

// Comments Service
export const commentsService = {
  create: (articleId, commentData) => api.post(`articles/${articleId}/comments/`, commentData),
  reply: (commentId, replyData) => api.post(`comments/${commentId}/reply/`, replyData),
  delete: (id) => api.delete(`comments/${id}/`),
  update: (id, commentData) => api.put(`comments/${id}/`, commentData)
};

// User Profile Service
export const profileService = {
  getProfile: (id) => api.get(`auth/profile/${id}/`),
  getCurrentUserProfile: () => api.get('auth/profile/'),
  updateProfile: (id, profileData) => {
    // For FormData with files, we need to change the content type
    const headers = profileData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : {};
    
      return api.put(`auth/profile/${id}/`, profileData, { headers });
    }
};

export default api;