// src/contexts/ToastContext.js
import React, { createContext, useContext, useState } from 'react';
import { Toast } from '../components/Toast';

// Create context
const ToastContext = createContext();

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const showToast = (message, type = TOAST_TYPES.INFO, duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };

  // Remove a toast by id
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Convenience methods for different toast types
  const success = (message, duration) => showToast(message, TOAST_TYPES.SUCCESS, duration);
  const error = (message, duration) => showToast(message, TOAST_TYPES.ERROR, duration);
  const info = (message, duration) => showToast(message, TOAST_TYPES.INFO, duration);
  const warning = (message, duration) => showToast(message, TOAST_TYPES.WARNING, duration);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, info, warning }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;