// src/hooks/useToast.js
import { useState } from 'react';

/**
 * Custom hook for managing toast notifications
 * @returns {Object} - Toast state and methods
 */
const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Show success toast
  const showSuccess = (message, duration = 3000) => {
    setToast({
      show: true,
      message,
      type: 'success',
      duration
    });
  };

  // Show error toast
  const showError = (message, duration = 5000) => {
    setToast({
      show: true,
      message,
      type: 'danger',
      duration
    });
  };

  // Show warning toast
  const showWarning = (message, duration = 4000) => {
    setToast({
      show: true,
      message,
      type: 'warning',
      duration
    });
  };

  // Show info toast
  const showInfo = (message, duration = 3000) => {
    setToast({
      show: true,
      message,
      type: 'info',
      duration
    });
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      show: false
    }));
  };

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast
  };
};

export default useToast;