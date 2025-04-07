import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UnauthorizedPage = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow">
            <div className="card-body text-center p-5">
              <div className="mb-4">
                <i className="fas fa-lock text-danger fa-5x"></i>
              </div>
              
              <h1 className="display-5 mb-3">Access Denied</h1>
              
              <p className="lead text-muted mb-4">
                You don't have permission to access this page. 
                {isAuthenticated ? (
                  <>This area requires additional privileges.</>
                ) : (
                  <>Please log in to continue.</>
                )}
              </p>
              
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link to="/" className="btn btn-outline-primary">
                  <i className="fas fa-home me-2"></i>
                  Return to Home
                </Link>
                
                {!isAuthenticated ? (
                  <Link to="/login" className="btn btn-primary">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Log In
                  </Link>
                ) : (
                  <Link to="/articles" className="btn btn-primary">
                    <i className="fas fa-newspaper me-2"></i>
                    Browse Articles
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h5>
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  Account Information
                </h5>
                <p className="mb-0">
                  You're currently logged in as <strong>{user?.username}</strong>. 
                  {user?.groups ? (
                    <span> Your role: <strong>{Array.isArray(user.groups) ? user.groups.join(', ') : user.groups}</strong></span>
                  ) : (
                    <span> You have standard user privileges.</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;