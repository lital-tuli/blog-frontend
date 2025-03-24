import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import articlesReducer from './articlesSlice';
import commentsReducer from './commentsSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articlesReducer,
    comments: commentsReducer,
    profile: profileReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false // Disabled due to non-serializable values in action payloads
    })
});

export default store;