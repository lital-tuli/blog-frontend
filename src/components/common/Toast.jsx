// src/components/common/Toast.jsx
import { useState, useEffect } from 'react';

const Toast = ({ type = 'success', message, show, onClose, autoClose = true, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(show);
  
  useEffect(() => {
    setIsVisible(show);
  }, [show]);
  
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, duration, onClose]);
  
  // Set the toast color based on type
  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'danger':
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      case 'info':
        return 'bg-info text-dark';
      default:
        return 'bg-success text-white';
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1050 }}
    >
      <div 
        className={`toast show ${getToastClass()}`} 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
      >
        <div className="toast-header">
          <strong className="me-auto">Notification</strong>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => {
              setIsVisible(false);
              if (onClose) onClose();
            }}
            aria-label="Close"
          ></button>
        </div>
        <div className="toast-body">
          {message}
        </div>
      </div>
    </div>
  );
};

export default Toast;