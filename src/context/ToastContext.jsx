import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/common/Toast'; 

// Create context
const ToastContext = createContext();

// Custom hook to use the toast context
export const useToastContext = () => {
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
  const showSuccess = (message, duration) => showToast(message, TOAST_TYPES.SUCCESS, duration);
  const showError = (message, duration) => showToast(message, TOAST_TYPES.ERROR, duration);
  const showInfo = (message, duration) => showToast(message, TOAST_TYPES.INFO, duration);
  const showWarning = (message, duration) => showToast(message, TOAST_TYPES.WARNING, duration);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            show={true}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;