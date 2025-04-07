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
      return handleApiError(error, 'Failed to fetch comments');
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
      return handleApiError(error, 'Failed to add comment');
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
      return handleApiError(error, 'Failed to add reply');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const response = await commentsService.update(commentId, { content });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to update comment');
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
      return handleApiError(error, 'Failed to delete comment');
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

// Improved function to recursively find and update a comment or reply
const findAndUpdateComment = (comments, targetId, updateFn) => {
  return comments.map(comment => {
    // Check if this is the target comment
    if (comment.id === targetId) {
      return updateFn(comment);
    }
    
    // Check if there are replies and if the target is among them
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: findAndUpdateComment(comment.replies, targetId, updateFn)
      };
    }
    
    // Not found in this branch
    return comment;
  });
};

// Similar function to find and remove a comment
const findAndRemoveComment = (comments, targetId) => {
  // Filter out the target comment at this level
  const filteredComments = comments.filter(comment => comment.id !== targetId);
  
  // Process replies for each remaining comment
  return filteredComments.map(comment => {
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: findAndRemoveComment(comment.replies, targetId)
      };
    }
    return comment;
  });
};

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
        // Ensure comments is always an array
        state.comments = Array.isArray(action.payload) ? action.payload : [];
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
        // Ensure comments is an array before pushing to it
        if (!Array.isArray(state.comments)) {
          state.comments = [];
        }
        
        // Add the new comment
        if (action.payload.reply_to) {
          // This is a reply to an existing comment
          state.comments = findAndUpdateComment(
            state.comments,
            action.payload.reply_to,
            (comment) => ({
              ...comment,
              replies: [...(comment.replies || []), action.payload]
            })
          );
        } else {
          // This is a top-level comment
          state.comments.push(action.payload);
        }
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
        // Make sure state.comments is an array
        if (!Array.isArray(state.comments)) {
          state.comments = [];
        }
        
        // Use the helper function to find the parent and add the reply
        state.comments = findAndUpdateComment(
          state.comments,
          action.payload.reply_to,
          (comment) => ({
            ...comment,
            replies: [...(comment.replies || []), action.payload]
          })
        );
      })
      .addCase(addReply.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Find and update the comment or reply
        state.comments = findAndUpdateComment(
          state.comments,
          action.payload.id,
          () => action.payload
        );
      })
      .addCase(updateComment.rejected, (state, action) => {
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
        
        // Remove the comment using the helper function
        state.comments = findAndRemoveComment(state.comments, action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearComments, clearError } = commentsSlice.actions;
export default commentsSlice.reducer;