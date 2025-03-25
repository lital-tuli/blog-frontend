// src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logout } from '../store/authSlice';

/**
 * Custom hook for authentication functionality
 * Provides methods for login, register, logout and access to auth state
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector(state => state.auth);

  // Login function
  const login = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      navigate('/');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
      navigate('/');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  // Logout function
  const signOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: signOut
  };
};

export default useAuth;