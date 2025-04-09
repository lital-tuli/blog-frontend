import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserRole } from '../../store/usersSlice';
import { useToastContext } from '../../context/ToastContext';

const UserManagementPanel = ({ users, isLoading }) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToastContext();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleRoleChange = async (userId, role) => {
    try {
      await dispatch(updateUserRole({ userId, role })).unwrap();
      showSuccess(`User role updated to ${role}`);
    } catch (error) {
      showError(error.message || 'Failed to update user role');
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading users...</span>
        </div>
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }
  
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="card-title mb-4">User Management</h3>
        
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select 
                        className="form-select form-select-sm" 
                        value={user.groups?.[0] || 'users'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="users">User</option>
                        <option value="editors">Editor</option>
                        <option value="management">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-1" 
                        onClick={() => setSelectedUser(user)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <i className="fas fa-ban"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* User Detail Modal */}
        {selectedUser && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">User Details</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setSelectedUser(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>Username:</strong> {selectedUser.username}
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong> {selectedUser.email}
                  </div>
                  <div className="mb-3">
                    <strong>First Name:</strong> {selectedUser.first_name || 'N/A'}
                  </div>
                  <div className="mb-3">
                    <strong>Last Name:</strong> {selectedUser.last_name || 'N/A'}
                  </div>
                  <div className="mb-3">
                    <strong>Role:</strong> {selectedUser.groups?.[0] || 'User'}
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </div>
                  <div className="mb-3">
                    <strong>Last Login:</strong> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}
                  </div>
                  <div className="mb-3">
                    <strong>Date Joined:</strong> {new Date(selectedUser.date_joined).toLocaleString()}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Deactivate User Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm User Deactivation</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedUser(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Are you sure you want to deactivate user <strong>{selectedUser.username}</strong>? This will prevent them from logging in.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      // Handle user deactivation here
                      showSuccess(`User ${selectedUser.username} has been deactivated`);
                      setShowDeleteConfirm(false);
                      setSelectedUser(null);
                    }}
                  >
                    Deactivate User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPanel;