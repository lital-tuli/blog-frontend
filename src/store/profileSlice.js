import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from '../services/api';

const initialState = {
  profile: null,
  isLoading: false,
  error: null
};

export const fetchCurrentUserProfile = createAsyncThunk(
  'profile/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getCurrentUserProfile();
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch your profile');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (profileId, { rejectWithValue }) => {
    try {
      // Ensure profileId is valid
      if (!profileId) {
        throw new Error('Invalid profile ID');
      }
      
      const response = await profileService.getProfile(profileId);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/update',
  async ({ profileData }, { rejectWithValue }) => {
    try {
      // No need to pass ID - backend will use current user
      const response = await profileService.updateProfile(profileData);
      
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to update profile');
    }
  }
);

// Helper function for consistent error handling
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error
    return error.response.data;
  } else if (error.request) {
    // No response received
    return { message: 'No response from server. Please check your internet connection.' };
  } else {
    // Request setup error
    return { message: `Error: ${error.message || defaultMessage}` };
  }
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user profile cases
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch specific profile cases
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProfile, clearError } = profileSlice.actions;
export default profileSlice.reducer;