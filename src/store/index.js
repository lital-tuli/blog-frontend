import { configureStore } from '@reduxjs/toolkit';
// Import reducers directly from their files, not from circular dependencies
import authReducer from './authSlice';
import articlesReducer from './articlesSlice';
import commentsReducer from './commentsSlice';
import profileReducer from './profileSlice';

// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articlesReducer,
    comments: commentsReducer,
    profile: profileReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['profile/updateProfile/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.formData'],
        // Ignore these paths in the state
        ignoredPaths: ['profile.profilePic']
      }
    })
});

export default store;