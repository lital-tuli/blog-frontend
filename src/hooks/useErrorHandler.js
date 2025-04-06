import { useDispatch } from 'react-redux';
import { setGlobalError, setFieldErrors, clearErrors } from '../store/errorSlice';
import { addNotification } from '../store/uiSlice';

/**
 * Custom hook for centralized error handling
 */
const useErrorHandler = () => {
  const dispatch = useDispatch();

  /**
   * Handle API error response
   * @param {Object} error - The error object from API response
   * @param {boolean} showNotification - Whether to show the error as a notification
   */
  const handleApiError = (error, showNotification = true) => {
    console.error('API Error:', error);

    // Clear previous errors
    dispatch(clearErrors());
    
    // Extract error data from the error object
    const errorData = error.response?.data;
    const status = error.response?.status;
    
    // Format error message
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (errorData) {
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle different status codes
    switch (status) {
      case 400: // Bad Request - likely a validation error
        if (errorData.errors || errorData.non_field_errors) {
          // Field-specific errors
          dispatch(setFieldErrors(errorData.errors || { 
            non_field_errors: errorData.non_field_errors 
          }));
          
          // Also set a user-friendly message
          errorMessage = 'Please check the form for errors.';
        }
        break;
        
      case 401: // Unauthorized
        errorMessage = 'Authentication failed. Please login again.';
        // Redirect to login page or trigger token refresh
        break;
        
      case 403: // Forbidden
        errorMessage = 'You do not have permission to perform this action.';
        break;
        
      case 404: // Not Found
        errorMessage = 'The requested resource was not found.';
        break;
        
      case 500: // Server Error
        errorMessage = 'A server error occurred. Please try again later.';
        break;
        
      default:
        // Keep default error message
        break;
    }
    
    // Set global error
    dispatch(setGlobalError(errorMessage));
    
    // Show notification if needed
    if (showNotification) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
        duration: 5000
      }));
    }
    
    // Return the error message for the caller to use if needed
    return errorMessage;
  };
  
  /**
   * Handle validation error
   * @param {Object} errors - Validation errors object with field names as keys
   * @param {boolean} showGlobalError - Whether to set a global error message
   */
  const handleValidationError = (errors, showGlobalError = true) => {
    dispatch(setFieldErrors(errors));
    
    if (showGlobalError) {
      dispatch(setGlobalError('Please check the form for errors'));
      
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please check the form for errors',
        duration: 3000
      }));
    }
  };
  
  /**
   * Clear all errors
   */
  const clearAllErrors = () => {
    dispatch(clearErrors());
  };
  
  return {
    handleApiError,
    handleValidationError,
    clearAllErrors
  };
};

export default useErrorHandler;