import React from 'react';

/**
 * 
 * @param {Object} props
 * @param {string|Object} props.error - Error object or message string
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
const ErrorMessage = ({ error, className = '' }) => {
  if (!error) return null;
  
  let errorMessage = '';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
  } else if (typeof error === 'object') {
    // Handle nested error objects from Django REST Framework
    try {
      const errorEntries = Object.entries(error);
      if (errorEntries.length > 0) {
        errorMessage = errorEntries
          .map(([key, value]) => {
            // Handle arrays of error messages
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          })
          .join('. ');
      } else {
        errorMessage = 'An error occurred';
      }
    } catch (e) {
      errorMessage = 'An error occurred';
    }
  } else {
    errorMessage = 'An error occurred';
  }
  
  return (
    <div className={`alert alert-danger d-flex align-items-center ${className}`} role="alert">
      <i className="fas fa-exclamation-circle me-2"></i>
      <div>{errorMessage}</div>
    </div>
  );
};

export default ErrorMessage;