import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useToastContext } from '../../context/ToastContext';
import api from '../../services/api';

const DeactivateAccount = () => {
  const [password, setPassword] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToastContext();
  
  const handleDeactivate = async (e) => {
    e.preventDefault();
    
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    
    if (!password) {
      setError('Password is required for verification');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await api.post('deactivate/', { password });
      
      // Log the user out and remove tokens
      dispatch(logout());
      
      // Show success message
      showSuccess('Your account has been deactivated successfully');
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          'Failed to deactivate account. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const cancelDeactivation = () => {
    setIsConfirming(false);
    setPassword('');
    setError('');
  };
  
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-danger text-white">
        <h5 className="mb-0">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Deactivate Account
        </h5>
      </div>
      <div className="card-body">
        {!isConfirming ? (
          <>
            <p className="text-danger mb-4">
              <strong>Warning:</strong> Deactivating your account will make your profile 
              and contributions inaccessible. This action cannot be undone easily.
            </p>
            
            <div className="d-flex justify-content-end">
              <button 
                className="btn btn-outline-danger" 
                onClick={handleDeactivate}
              >
                <i className="fas fa-user-slash me-2"></i>
                Deactivate Account
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleDeactivate}>
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-circle me-2"></i>
              Please confirm by entering your current password. This action will:
              <ul className="mb-0 mt-2">
                <li>Disable your ability to login</li>
                <li>Hide your profile from other users</li>
                <li>Require contacting support to reactivate</li>
              </ul>
            </div>
            
            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Current Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelDeactivation}
                disabled={isSubmitting}
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-slash me-2"></i>
                    Confirm Deactivation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DeactivateAccount;