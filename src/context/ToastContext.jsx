// src/context/ToastContext.jsx
import { createContext, useContext } from 'react';
import useToast from '../hooks/useToast';
import Toast from '../components/common/Toast';

// Create context
const ToastContext = createContext(null);

// Toast provider component
export const ToastProvider = ({ children }) => {
  const toastHelpers = useToast();
  const { toast, hideToast } = toastHelpers;
  
  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

// Hook for using toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;