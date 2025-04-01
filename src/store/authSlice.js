import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/api';

// Check if user is already logged in from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const initialState = {
  user: user || null,
  isAuthenticated: !!user,
  isLoading: false,
  error: null
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Rename confirmPassword to password2 for Django REST framework
      const apiData = {
        ...userData,
        password2: userData.confirmPassword || userData.password2 || userData.password
      };
      
      // Remove confirmPassword if it exists
      if (apiData.confirmPassword) {
        delete apiData.confirmPassword;
      }
      
      const response = await authService.register(apiData);
   
      // Save tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Save user info
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return {
        user: response.data.user,
        access: response.data.access,
        refresh: response.data.refresh
      };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        return rejectWithValue({ 
          message: 'No response from server. Please check your internet connection.' 
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        return rejectWithValue({ 
          message: 'Error during request setup: ' + error.message 
        });
      }
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Get tokens from login endpoint
      const response = await authService.login(credentials);
      
      // Save tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Fetch user details with the token
      try {
        const userResponse = await authService.getUserDetails();
        const userData = userResponse.data;
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        return {
          user: userData,
          access: response.data.access,
          refresh: response.data.refresh
        };
      } catch (userError) {
        // If user details can't be fetched, create basic user object from token
        const userData = {
          username: credentials.username
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        return {
          user: userData,
          access: response.data.access,
          refresh: response.data.refresh
        };
      }
    } catch (error) {
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = error.response.data;
        
        // Handle common authentication errors with user-friendly messages
        if (error.response.status === 401) {
          return rejectWithValue({ 
            message: 'Invalid credentials. Please check your username and password.' 
          });
        }
        
        return rejectWithValue(errorData);
      } else if (error.request) {
        // The request was made but no response was received
        return rejectWithValue({ 
          message: 'No response from server. Please check your internet connection.' 
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        return rejectWithValue({ 
          message: 'Error during request setup: ' + error.message 
        });
      }
    }
  }
);

// For refreshing tokens
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authService.refreshToken(refreshToken);
      localStorage.setItem('access_token', response.data.access);
      
      return response.data;
    } catch (error) {
      // If refresh fails, we'll need to re-login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      return rejectWithValue(
        error.response?.data || { message: 'Session expired. Please log in again.' }
      );
    }
  }
);

// Create the slice directly and handle the logout action internally
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Call the service but don't wait for it
      authService.logout();
      // Update the state
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
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
      })
      
      // Token refresh cases
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isLoading = false;
        // We don't need to update state otherwise as the token is stored in localStorage
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;