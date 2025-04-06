import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/',  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window !== 'undefined') {
      // Dispatch through window event
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
    return Promise.reject(error);
  }
);

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

// Add these flags to manage token refresh state
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
    
    // Only try to refresh if we get a 401 (unauthorized) response, 
    // the error is specifically about an expired token,
    // and we haven't already tried to refresh for this request
    if (
      error.response?.status === 401 && 
      error.response?.data?.code === 'token_not_valid' &&
      !originalRequest._retry
    ) {
      // Mark this request as retried so we don't retry it again
      originalRequest._retry = true;
      
      // If we're already refreshing, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        console.log('Attempting to refresh token...');
        
        // Make the refresh request directly with axios instead of using the intercepted client
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken
        });
        
        const newToken = response.data.access;
        console.log('Token refreshed successfully');
        
        // Store the new token
        localStorage.setItem('access_token', newToken);
        
        // Update authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Process any requests that were waiting for the token refresh
        processQueue(null, newToken);
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
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
  register: (userData) => api.post('api/register/', userData),
  login: (credentials) => api.post('api/token/', credentials),
  getUserDetails: () => api.get('api/user/'),
  refreshToken: (refreshToken) => api.post('api/token/refresh/', { refresh: refreshToken }),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

// Articles Service
export const articlesService = {
  getAll: (params) => api.get('api/articles/', { params }),
  getById: (id) => api.get(`api/articles/${id}/`),
  create: (articleData) => api.post('api/articles/', articleData),
  update: (id, articleData) => api.put(`api/articles/${id}/`, articleData),
  delete: (id) => api.delete(`api/articles/${id}/`),
  getComments: (id) => api.get(`api/articles/${id}/comments/`),
  getPopular: () => api.get('api/articles/popular/')
};

// Comments Service
export const commentsService = {
  create: (commentData) => api.post(`api/articles/${commentData.article}/comments/`, commentData),
  reply: (commentId, replyData) => api.post(`api/comments/${commentId}/reply/`, replyData),
  delete: (id) => api.delete(`api/comments/${id}/`),
  update: (id, commentData) => api.put(`api/comments/${id}/`, commentData)
};

// User Profile Service - updated paths
export const profileService = {
  getProfile: (id) => {
    // Validate ID before making request
    if (!id || isNaN(id)) {
      return Promise.reject(new Error('Invalid profile ID'));
    }
    return api.get(`api/profile/${id}/`);
  },
  getCurrentUserProfile: () => api.get('api/profile/'),
  updateProfile: (id, profileData) => {
    // Validate ID before making request
    if (!id || isNaN(id)) {
      return Promise.reject(new Error('Invalid profile ID'));
    }

    const headers = profileData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : {};
    
    return api.put(`api/profile/${id}/`, profileData, { headers });
  }
};

export default api;