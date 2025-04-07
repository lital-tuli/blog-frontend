import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axios from 'axios';

// Base API URL - ensure this matches your Django server
const API_BASE_URL = 'http://localhost:8000/api/';

// Base query with auth handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
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
        url: 'login/',
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
    
    updateComment: builder.mutation({
      query: ({ commentId, ...commentData }) => ({
        url: `comments/${commentId}/`,
        method: 'PATCH',
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
      query: (userId) => userId ? `profile/${userId}/` : 'profile/',
      providesTags: (result, error, userId) => [{ type: 'Profile', id: userId || 'CURRENT' }],
    }),
    
    updateProfile: builder.mutation({
      query: ({ userId, ...profileData }) => {
        // Handle FormData for file uploads
        const isFormData = profileData instanceof FormData;
        
        return {
          url: userId ? `profile/${userId}/` : 'profile/',
          method: 'PUT',
          body: profileData,
          // Don't set Content-Type when sending FormData - browser will set it with boundary
          headers: isFormData ? {} : undefined
        };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'Profile', id: userId || 'CURRENT' }],
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useDeactivateAccountMutation,
  useGetCurrentUserQuery,
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetArticleCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetUserProfileQuery,
  useUpdateProfileMutation,
} = blogApi;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Response interceptor for handling token refresh
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
        
        const response = await axios.post(`${API_BASE_URL}token/refresh/`, {
          refresh: refreshToken
        });
        
        const newToken = response.data.access;
        localStorage.setItem('access_token', newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Emit logout event for global handling
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
  login: (credentials) => api.post('login/', credentials),
  getUserDetails: () => api.get('user/'),
  refreshToken: (refreshToken) => api.post('token/refresh/', { refresh: refreshToken }),
  logout: () => {
    // Just remove tokens, no endpoint needed
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  deactivateAccount: (password) => api.post('deactivate/', { password })
};

// Articles Service - aligned with backend endpoints
export const articlesService = {
  getAll: (params) => api.get('articles/', { params }),
  getById: (id) => api.get(`articles/${id}/`),
  create: (articleData) => api.post('articles/', articleData),
  update: (id, articleData) => api.put(`articles/${id}/`, articleData),
  delete: (id) => api.delete(`articles/${id}/`),
  getComments: (id) => api.get(`articles/${id}/comments/`),
  getPopular: () => api.get('articles/popular/')
};

// Comments Service - aligned with backend endpoints
export const commentsService = {
  create: (commentData) => {
    // Extract article ID and create comment
    const { article, ...data } = commentData;
    return api.post(`articles/${article}/comments/`, data);
  },
  reply: (commentId, replyData) => {
    // Extract article ID for the reply
    const { article, ...data } = replyData;
    return api.post(`articles/${article}/comments/`, {
      ...data,
      reply_to: commentId
    });
  },
  delete: (id) => api.delete(`comments/${id}/`),
  update: (id, commentData) => api.patch(`comments/${id}/`, commentData)
};

// User Profile Service - aligned with backend endpoints
export const profileService = {
  getProfile: (id) => {
    return api.get(`profile/${id}/`);
  },
  getCurrentUserProfile: () => api.get('profile/'),
  updateProfile: (profileData) => {
    // Handle FormData for file uploads
    const headers = profileData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : {};
    
    return api.put(`profile/`, profileData, { headers });
  }
};

export default api;