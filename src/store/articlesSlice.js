
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { articlesService } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

const initialState = {
  articles: [],
  article: null,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
  lastFetched: null,
  lastFetchParams: null
};

// Async thunks
export const fetchArticles = createAsyncThunk(
  'articles/fetchAll',
  async (params = {}, { getState, rejectWithValue }) => {
    const state = getState();
    const now = Date.now();
    const cacheTime = 5 * 60 * 1000; // 5 minutes
    
    // Use cached data if available and recent, and params match
    const cachedParams = state.articles.lastFetchParams;
    const paramsMatch = cachedParams && 
      Object.keys(params).length === Object.keys(cachedParams).length &&
      Object.keys(params).every(key => params[key] === cachedParams[key]);
      
    if (state.articles.lastFetched && 
        now - state.articles.lastFetched < cacheTime &&
        state.articles.articles.length > 0 &&
        paramsMatch) {
      return {
        results: state.articles.articles,
        count: state.articles.articles.length,
        current_page: state.articles.currentPage,
        total_pages: state.articles.totalPages
      };
    }
    
    try {
      const response = await articlesService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch articles'));
    }
  }
);

export const fetchArticleById = createAsyncThunk(
  'articles/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await articlesService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch article'));
    }
  }
);

export const createArticle = createAsyncThunk(
  'articles/create',
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await articlesService.create(articleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create article'));
    }
  }
);

export const updateArticle = createAsyncThunk(
  'articles/update',
  async ({ id, ...articleData }, { rejectWithValue }) => {
    try {
      const response = await articlesService.update(id, articleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update article'));
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (id, { rejectWithValue }) => {
    try {
      await articlesService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete article'));
    }
  }
);

// Articles slice
const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearArticle: (state) => {
      state.article = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
      state.lastFetchParams = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all articles
      .addCase(fetchArticles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastFetched = Date.now();
        state.lastFetchParams = action.meta.arg; // Store the params for cache comparison
        
        // Check if we received a valid response
        if (!action.payload) {
          state.articles = [];
          state.totalPages = 0;
          state.currentPage = 1;
          return;
        }
        
        // Handle both paginated and non-paginated responses
        if (action.payload.results) {
          // Ensure results is an array
          state.articles = Array.isArray(action.payload.results) ? action.payload.results : [];
          state.totalPages = action.payload.total_pages || 
                          Math.ceil(action.payload.count / 10); // Assuming 10 per page
          state.currentPage = action.payload.current_page || 1;
        } else if (Array.isArray(action.payload)) {
          state.articles = action.payload;
          state.totalPages = 1;
        } else {
          // Fallback for unexpected response format
          state.articles = [];
          state.totalPages = 0;
        }
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'An error occurred while fetching articles' };
        state.articles = []; // Reset articles on error
      })
      
      // Fetch article by ID
      .addCase(fetchArticleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.article = action.payload;
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.article = null; // Reset article on error
      })
      
      // Create article
      .addCase(createArticle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastFetched = null; // Invalidate cache on mutation
        if (action.payload && Array.isArray(state.articles)) {
          state.articles.unshift(action.payload); // Add new article to the start of the array
        }
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update article
      .addCase(updateArticle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastFetched = null; // Invalidate cache on mutation
        
        if (action.payload && Array.isArray(state.articles)) {
          // Update in the articles array if present
          const index = state.articles.findIndex(a => a.id === action.payload.id);
          if (index !== -1) {
            state.articles[index] = action.payload;
          }
        }
        // Update the current article if it's the one being viewed
        if (state.article && state.article.id === action.payload?.id) {
          state.article = action.payload;
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete article
      .addCase(deleteArticle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastFetched = null; // Invalidate cache on mutation
        
        if (Array.isArray(state.articles)) {
          state.articles = state.articles.filter(article => article.id !== action.payload);
        }
        if (state.article && state.article.id === action.payload) {
          state.article = null;
        }
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentPage, clearArticle, clearError, invalidateCache } = articlesSlice.actions;
export default articlesSlice.reducer;