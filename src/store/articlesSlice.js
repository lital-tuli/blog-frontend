import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { articlesService } from '../services/api';

const initialState = {
  articles: [],
  article: null,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchArticles = createAsyncThunk(
  'articles/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await articlesService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch articles' }
      );
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
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch article' }
      );
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
      return rejectWithValue(
        error.response?.data || { message: 'Failed to create article' }
      );
    }
  }
);

export const updateArticle = createAsyncThunk(
  'articles/update',
  async ({ id, articleData }, { rejectWithValue }) => {
    try {
      const response = await articlesService.update(id, articleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update article' }
      );
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
      return rejectWithValue(
        error.response?.data || { message: 'Failed to delete article' }
      );
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
        state.articles = action.payload.results;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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
      })
      
      // Create article
      .addCase(createArticle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articles.unshift(action.payload); // Add new article to the start of the array
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
        // Update in the articles array if present
        const index = state.articles.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.articles[index] = action.payload;
        }
        // Update the current article if it's the one being viewed
        if (state.article && state.article.id === action.payload.id) {
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
        state.articles = state.articles.filter(article => article.id !== action.payload);
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

export const { setCurrentPage, clearArticle, clearError } = articlesSlice.actions;
export default articlesSlice.reducer;