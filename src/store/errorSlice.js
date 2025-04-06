import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  globalError: null,
  fieldErrors: {}
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    setFieldErrors: (state, action) => {
      state.fieldErrors = action.payload;
    },
    clearErrors: (state) => {
      state.globalError = null;
      state.fieldErrors = {};
    }
  },
  extraReducers: (builder) => {
    // You can catch any async action rejections here
    builder.addMatcher(
      action => action.type.endsWith('/rejected'),
      (state, action) => {
        if (action.payload) {
          if (typeof action.payload === 'string') {
            state.globalError = action.payload;
          } else if (action.payload.message) {
            state.globalError = action.payload.message;
          } else {
            state.fieldErrors = action.payload;
          }
        }
      }
    );
  }
});

export const { setGlobalError, setFieldErrors, clearErrors } = errorSlice.actions;
export default errorSlice.reducer;