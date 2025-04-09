// src/components/common/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ 
  children, 
  requiresAdmin = false, 
  requiresEditor = false,
  requiresOwnership = false,
  resourceId = null,
  resourceType = null
}) => {
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth);
  const { article } = useSelector(state => state.articles);
  
  // Check if user is admin
  const isAdmin = user?.is_staff || (user?.groups && user?.groups.includes('management'));
  
  // Check if user is editor
  const isEditor = isAdmin || (user?.groups && user?.groups.includes('editors'));
  
  // Check ownership if required and applicable
  let isOwner = false;
  if (requiresOwnership && resourceId && resourceType) {
    if (resourceType === 'article' && article) {
      isOwner = article.author_id === user?.id;
    }
    // Add more resource types as needed
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  
  // Check admin access
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Check editor access
  if (requiresEditor && !isEditor) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Check ownership
  if (requiresOwnership && !isAdmin && !isOwner) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // All checks passed, render children
  return children;
};

export default PrivateRoute;