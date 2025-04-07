import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { useToastContext } from '../../context/ToastContext';

const LogoutModal = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess } = useToastContext();

  const handleLogout = () => {
    dispatch(logout());
    showSuccess('You have been logged out successfully');
    navigate('/');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Logout</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose} 
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to log out of your account?</p>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;