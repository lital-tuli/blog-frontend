import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

// Initialize state from localStorage
const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null
};

/**
 * Register a new user
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Format data for Django REST framework
      const apiData = {
        ...userData,
        password2: userData.confirmPassword || userData.password2 || userData.password
      };
      
      if (apiData.confirmPassword) {
        delete apiData.confirmPassword;
      }
      
      console.log('Registering user with data:', { 
        ...apiData, 
        password: '[REDACTED]', 
        password2: '[REDACTED]' 
      });
      
      const response = await authService.register(apiData);
      console.log('Registration successful');
      
      // Store auth data
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return {
        user: response.data.user,
        access: response.data.access,
        refresh: response.data.refresh
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Registration failed'));
    }
  }
);

/**
 * Login an existing user
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with username:', credentials.username);
      const response = await authService.login(credentials);
      console.log('Login successful, received tokens');
      
      // Save tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Save user data from login response
      const userData = response.data.user;
      console.log('User details received:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        user: userData,
        access: response.data.access,
        refresh: response.data.refresh
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Login failed'));
    }
  }
);

/**
 * Refresh the authentication token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      console.log('Refreshing token');
      const response = await authService.refreshToken(refreshToken);
      console.log('Token refreshed successfully');
      
      localStorage.setItem('access_token', response.data.access);
      
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthStorage();
      return rejectWithValue(handleApiError(error, 'Session expired. Please log in again.'));
    }
  }
);

/**
 * Deactivate user account
 */
export const deactivateAccount = createAsyncThunk(
  'auth/deactivate',
  async (password, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.deactivateAccount(password);
      dispatch(logout());
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to deactivate account'));
    }
  }
);

// Helper function to clear all auth storage items
const clearAuthStorage = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      console.log('Logging out, clearing auth state and tokens');
      // Call the service but don't wait for it
      authService.logout();
      
      // Update the state
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      
      clearAuthStorage();
    },
    clearError: (state) => {
      state.error = null;
    },
    checkAuthState: (state) => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          state.isAuthenticated = true;
          state.user = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          state.isAuthenticated = false;
          state.user = null;
          clearAuthStorage();
        }
      } else {
        state.isAuthenticated = false;
        state.user = null;
      }
    },
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        clearAuthStorage();
      })
      
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        clearAuthStorage();
      })
      
      // Token refresh cases
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
        clearAuthStorage();
      })
      
      // Deactivate account cases
      .addCase(deactivateAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deactivateAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        clearAuthStorage();
      })
      .addCase(deactivateAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError, checkAuthState, updateUserData } = authSlice.actions;
export default authSlice.reducer;