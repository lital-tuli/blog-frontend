import axios from 'axios';

// Create axios instance with correct base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // If no refresh token, logout
          return Promise.reject(error);
        }
        
        const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
          refresh: refreshToken
        });
        
        // Save the new access token
        localStorage.setItem('access_token', response.data.access);
        
        // Update the request with the new token
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  register: (userData) => api.post('auth/register/', userData),
  login: (credentials) => api.post('auth/token/', credentials),
  getUserDetails: () => api.get('auth/user/'),
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
  getComments: (id) => api.get(`articles/${id}/comments/`)
};

// Comments Service
export const commentsService = {
  create: (commentData) => api.post(`articles/${commentData.article}/comments/`, commentData),
  reply: (commentId, replyData) => api.post(`comments/${commentId}/reply/`, replyData),
  delete: (id) => api.delete(`comments/${id}/`)
};

// User Profile Service
export const profileService = {
  getProfile: (id) => api.get(`auth/profile/${id}/`),
  getCurrentUserProfile: () => api.get('auth/profile/'),
  updateProfile: (id, profileData) => api.put(`auth/profile/${id}/`, profileData)
};

export default api;