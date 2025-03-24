import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { articlesService, commentsService } from '../services/api';

const initialState = {
  comments: [],
  isLoading: false,
  error: null
};

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchByArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await articlesService.getComments(articleId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch comments' }
      );
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/add',
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await commentsService.create(commentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to add comment' }
      );
    }
  }
);

export const addReply = createAsyncThunk(
  'comments/reply',
  async ({ commentId, replyData }, { rejectWithValue }) => {
    try {
      const response = await commentsService.reply(commentId, replyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to add reply' }
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (commentId, { rejectWithValue }) => {
    try {
      await commentsService.delete(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to delete comment' }
      );
    }
  }
);

// Comments slice
const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add comment
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments.push(action.payload);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add reply
      .addCase(addReply.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        state.isLoading = false;
        // Find the parent comment and add the reply
        const parentIndex = state.comments.findIndex(
          comment => comment.id === action.payload.reply_to
        );
        
        if (parentIndex !== -1) {
          // Initialize replies array if it doesn't exist
          if (!state.comments[parentIndex].replies) {
            state.comments[parentIndex].replies = [];
          }
          state.comments[parentIndex].replies.push(action.payload);
        }
      })
      .addCase(addReply.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove comment from state
        state.comments = state.comments.filter(
          comment => comment.id !== action.payload
        );
        
        // Also check if it's a reply and remove from parent
        state.comments.forEach(comment => {
          if (comment.replies) {
            comment.replies = comment.replies.filter(
              reply => reply.id !== action.payload
            );
          }
        });
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearComments, clearError } = commentsSlice.actions;
export default commentsSlice.reducer;