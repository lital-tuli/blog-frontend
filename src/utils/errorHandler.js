
/**
 * Centralized error handling for API responses
 * @param {Error} error - The error object from API response
 * @param {string} defaultMessage - Default message to show if no error message is available
 * @returns {Object} Formatted error object
 */
// src/utils/errorHandler.js
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    
    let errorMessage = defaultMessage;
    let statusCode = null;
    let fieldErrors = {};
    
    if (error.response) {
      statusCode = error.response.status;
      
      // Handle various response formats
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data) {
        // Extract main error message
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        }
        
        // Extract field errors
        if (error.response.data.errors) {
          fieldErrors = error.response.data.errors;
        } else {
          // Look for field-specific errors
          for (const key in error.response.data) {
            if (key !== 'message' && key !== 'detail' && key !== 'error' && key !== 'non_field_errors') {
              fieldErrors[key] = Array.isArray(error.response.data[key]) 
                ? error.response.data[key].join(' ') 
                : error.response.data[key];
            }
          }
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check your connection.';
    } else if (error.message) {
      // Something happened in setting up the request
      errorMessage = error.message;
    }
    
    return {
      message: errorMessage,
      statusCode,
      fieldErrors
    };
  };
  /**
   * Format field-specific validation errors from API
   * @param {Object} errors - API error response
   * @returns {Object} Formatted errors by field
   */
  export const formatValidationErrors = (errors) => {
    if (!errors) return {};
    
    const formatted = {};
    
    Object.entries(errors).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formatted[key] = value.join(', ');
      } else if (typeof value === 'string') {
        formatted[key] = value;
      } else if (typeof value === 'object') {
        formatted[key] = formatValidationErrors(value);
      }
    });
    
    return formatted;
  };
  
  /**
   * Handle API errors and trigger UI notifications
   * @param {Error} error - API error
   * @param {Function} showError - Function to show error toast
   * @param {Function} setFieldErrors - Function to set form field errors
   * @param {string} defaultMessage - Default error message
   */
  export const handleApiErrorWithUI = (error, showError, setFieldErrors = null, defaultMessage = 'An error occurred') => {
    const errorData = handleApiError(error, defaultMessage);
    
    // Show toast notification with error message
    showError(errorData.message);
    
    // Set field errors if form validation function is provided
    if (setFieldErrors && errorData.fieldErrors) {
      setFieldErrors(formatValidationErrors(errorData.fieldErrors));
    }
    
    return errorData;
  };