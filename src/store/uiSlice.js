import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: true,
  isLoading: false,
  loadingMessage: '',
  notifications: [],
  modal: {
    isOpen: false,
    title: '',
    content: null,
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info' // 'info', 'warning', 'danger', 'success'
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setLoadingWithMessage: (state, action) => {
      state.isLoading = true;
      state.loadingMessage = action.payload;
    },
    clearLoading: (state) => {
      state.isLoading = false;
      state.loadingMessage = '';
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(), // Simple unique ID
        ...action.payload,
        createdAt: new Date().toISOString()
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      state.modal = {
        ...state.modal,
        isOpen: true,
        ...action.payload
      };
    },
    closeModal: (state) => {
      state.modal = {
        ...state.modal,
        isOpen: false
      };
    }
  },
  // Add extra reducers to handle async actions from other slices
  extraReducers: (builder) => {
    // Handle loading states from various async actions
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => {
          state.isLoading = false;
          state.loadingMessage = '';
        }
      );
  }
});

export const {
  toggleDarkMode,
  toggleSidebar,
  setLoading,
  setLoadingWithMessage,
  clearLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal
} = uiSlice.actions;

export default uiSlice.reducer;