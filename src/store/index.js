import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import articlesReducer from './articlesSlice';
import commentsReducer from './commentsSlice';
import profileReducer from './profileSlice';
import errorReducer from './errorSlice';
import uiReducer from './uiSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import { blogApi } from '../services/api';

// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articlesReducer,
    comments: commentsReducer,
    profile: profileReducer,
    ui: uiReducer,
    error: errorReducer,
    [blogApi.reducerPath]: blogApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'profile/updateProfile/fulfilled', 
          'auth/loginUser/fulfilled',
          'auth/registerUser/fulfilled'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.formData'],
        // Ignore these paths in the state
        ignoredPaths: ['profile.profilePic', 'auth.user']
      }
    }).concat(blogApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;