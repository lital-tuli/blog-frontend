import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from '../services/api';

const initialState = {
  profile: null,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile(profileId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch profile' }
      );
    }
  }
);

export const fetchCurrentUserProfile = createAsyncThunk(
  'profile/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getCurrentUserProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch your profile' }
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/update',
  async ({ profileId, profileData }, { rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(profileId, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update profile' }
      );
    }
  }
);

// Profile slice
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
      // Fetch profile
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
      
      // Fetch current user profile
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
      
      // Update profile
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