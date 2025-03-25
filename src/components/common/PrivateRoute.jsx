// src/components/common/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * A wrapper component for routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  
  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the children components
  return children;
};

export default PrivateRoute;