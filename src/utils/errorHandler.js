
/**
 * Centralized error handling for API responses
 * @param {Error} error - The error object from API response
 * @param {string} defaultMessage - Default message to show if no error message is available
 * @returns {Object} Formatted error object
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data?.message || 
                 error.response.data?.detail || 
                 defaultMessage,
        errors: error.response.data?.errors || {},
        statusCode: error.response.status
      };
    } else if (error.request) {
      // No response received
      return { 
        message: 'No response from server. Please check your internet connection.',
        statusCode: 0
      };
    } else {
      // Request setup error
      return { 
        message: error.message || defaultMessage,
        statusCode: 0
      };
    }
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
    if (setFieldErrors && errorData.errors) {
      setFieldErrors(formatValidationErrors(errorData.errors));
    }
    
    return errorData;
  };
  
  export default {
    handleApiError,
    formatValidationErrors,
    handleApiErrorWithUI
  };