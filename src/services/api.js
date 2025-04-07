import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axios from 'axios';

// Base query with auth handling
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api/',
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
  credentials: 'include',
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we get a 401, try to refresh the token
  if (result?.error?.status === 401) {
    // Try to get a new token
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      // No refresh token available, user needs to login again
      return result;
    }
    
    const refreshResult = await baseQuery(
      { 
        url: 'token/refresh/', 
        method: 'POST',
        body: { refresh: refreshToken } 
      },
      api,
      extraOptions
    );
    
    if (refreshResult?.data) {
      // Store the new token
      localStorage.setItem('access_token', refreshResult.data.access);
      
      // Retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed - logout user
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Dispatch logout
      api.dispatch({ type: 'auth/logout' });
    }
  }
  
  return result;
};

// Define our API service
export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Articles', 'Article', 'Comments', 'Profile', 'Users'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: 'token/',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    register: builder.mutation({
      query: (userData) => ({
        url: 'register/',
        method: 'POST',
        body: userData,
      }),
    }),
    
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: 'token/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
    }),
    
    deactivateAccount: builder.mutation({
      query: (password) => ({
        url: 'deactivate/',
        method: 'POST',
        body: { password },
      }),
      invalidatesTags: ['Users'],
    }),
    
    // User endpoints
    getCurrentUser: builder.query({
      query: () => 'user/',
      providesTags: ['Users'],
    }),
    
    // Article endpoints
    getArticles: builder.query({
      query: (params) => ({
        url: 'articles/',
        params,
      }),
      providesTags: (result) => 
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Articles', id })),
              { type: 'Articles', id: 'LIST' },
            ]
          : [{ type: 'Articles', id: 'LIST' }],
    }),
    
    getArticleById: builder.query({
      query: (id) => `articles/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Article', id }],
    }),
    
    createArticle: builder.mutation({
      query: (articleData) => ({
        url: 'articles/',
        method: 'POST',
        body: articleData,
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }],
    }),
    
    updateArticle: builder.mutation({
      query: ({ id, ...articleData }) => ({
        url: `articles/${id}/`,
        method: 'PUT',
        body: articleData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Articles', id: 'LIST' },
        { type: 'Article', id },
      ],
    }),
    
    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `articles/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }],
    }),
    
    getPopularArticles: builder.query({
      query: () => 'articles/popular/',
      providesTags: [{ type: 'Articles', id: 'POPULAR' }],
    }),
    
    // Comment endpoints
    getArticleComments: builder.query({
      query: (articleId) => `articles/${articleId}/comments/`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Comments', id })),
              { type: 'Comments', id: 'LIST' },
            ]
          : [{ type: 'Comments', id: 'LIST' }],
    }),
    
    addComment: builder.mutation({
      query: ({ articleId, ...commentData }) => ({
        url: `articles/${articleId}/comments/`,
        method: 'POST',
        body: commentData,
      }),
      invalidatesTags: [{ type: 'Comments', id: 'LIST' }],
    }),
    
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `comments/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Comments', id: 'LIST' }],
    }),
    
    // Profile endpoints
    getUserProfile: builder.query({
      query: (userId) => `profile/${userId || ''}`,
      providesTags: (result, error, userId) => [{ type: 'Profile', id: userId || 'CURRENT' }],
    }),
    
    updateProfile: builder.mutation({
      query: ({ userId, ...profileData }) => ({
        url: `profile/${userId || ''}`,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Profile', id: userId || 'CURRENT' }],
    }),
  }),
});

// Export hooks
export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useDeactivateAccountMutation,
  
  // User hooks
  useGetCurrentUserQuery,
  
  // Article hooks
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetPopularArticlesQuery,
  
  // Comment hooks
  useGetArticleCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  
  // Profile hooks
  useGetUserProfileQuery,
  useUpdateProfileMutation,
} = blogApi;

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken
        });
        
        const newToken = response.data.access;
        localStorage.setItem('access_token', newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth-logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Legacy service exports for backward compatibility
export const authService = {
  register: (userData) => api.post('register/', userData),
  login: (credentials) => api.post('token/', credentials),
  getUserDetails: () => api.get('user/'),
  refreshToken: (refreshToken) => api.post('token/refresh/', { refresh: refreshToken }),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  deactivateAccount: (password) => api.post('deactivate/', { password })
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
  create: (commentData) => api.post(`articles/${commentData.article}/comments/`, commentData),
  reply: (commentId, replyData) => api.post(`comments/${commentId}/reply/`, replyData),
  delete: (id) => api.delete(`comments/${id}/`),
  update: (id, commentData) => api.put(`comments/${id}/`, commentData)
};

// User Profile Service
export const profileService = {
  getProfile: (id) => {
    // Validate ID before making request
    if (!id || isNaN(id)) {
      return Promise.reject(new Error('Invalid profile ID'));
    }
    return api.get(`profile/${id}/`);
  },
  getCurrentUserProfile: () => api.get('profile/'),
  updateProfile: (id, profileData) => {
    // Validate ID before making request
    if (!id || isNaN(id)) {
      return Promise.reject(new Error('Invalid profile ID'));
    }

    const headers = profileData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : {};
    
    return api.put(`profile/${id}/`, profileData, { headers });
  }
};

export default api;