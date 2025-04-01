import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, requiresAdmin = false, requiresEditor = false }) => {
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth);
  
  const isAdmin = user?.is_staff || user?.groups?.includes('management');
  const isEditor = user?.groups?.includes('editors');
  
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
  
  // Check if user has required roles when specified
  if ((requiresAdmin && !isAdmin) || (requiresEditor && !(isAdmin || isEditor))) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated and has required roles, render the children components
  return children;
};

export default PrivateRoute;