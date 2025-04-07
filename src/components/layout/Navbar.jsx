import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LogoutModal from '../auth/LogoutModal';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const isAdmin = user && (user.is_staff || (user.groups && user.groups.includes('management')));
  const isEditor = user && (user.groups && user.groups.includes('editors'));

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <i className="fas fa-blog me-2"></i>
            <span className="fw-bold">Django Blog</span>
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent" 
            aria-controls="navbarContent" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  <i className="fas fa-home me-1"></i> Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/articles" className="nav-link">
                  <i className="fas fa-newspaper me-1"></i> Articles
                </Link>
              </li>
            </ul>
            
            <ul className="navbar-nav">
              {isAuthenticated ? (
                <>
                  {/* Only show New Post button for admin or editor users */}
                  {(isAdmin || isEditor) && (
                    <li className="nav-item me-2">
                      <Link to="/articles/new" className="nav-link btn btn-outline-light btn-sm px-3 py-1 d-flex align-items-center">
                        <i className="fas fa-plus-circle me-1"></i> New Post
                      </Link>
                    </li>
                  )}
                  <li className="nav-item dropdown">
                    <a 
                      className="nav-link dropdown-toggle d-flex align-items-center" 
                      href="#" 
                      id="userDropdown" 
                      role="button" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                    >
                      <i className="fas fa-user-circle me-1"></i>
                      {user?.username || 'User'}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
                      <li>
                        <Link to="/profile" className="dropdown-item">
                          <i className="fas fa-id-card me-2"></i> My Profile
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          onClick={() => setShowLogoutModal(true)} 
                          className="dropdown-item text-danger"
                        >
                          <i className="fas fa-sign-out-alt me-2"></i> Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link">
                      <i className="fas fa-sign-in-alt me-1"></i> Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link btn btn-outline-light btn-sm px-3 py-1 ms-2">
                      <i className="fas fa-user-plus me-1"></i> Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Navbar;